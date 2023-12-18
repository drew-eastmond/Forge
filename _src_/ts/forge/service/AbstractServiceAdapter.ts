import { $Promise, $UseRace, QuickHash, Serialize } from "../../core/Core";
import { ISubscription, Subscription } from "../../core/Subscription";

const __ForgeProtocol: string = "forge://";

enum StdioOption {

    Pipe = "pipe",
    Inherit = "inherit",
    Silent = "silent"

}

export type ServiceConfig = {
    command?: string
    debounce?: number,
    stdio?: string,
    race?: number | Record<string, number>,

    key?: string,
    reboot?: boolean,
    route_root?: string
}

export interface IServiceAdapter extends ISubscription {

    read(message: [string, Record<string, unknown>, Serialize]): void;

    write(header: Record<string, unknown>, data: Serialize): void;
    resolve(header: Record<string, unknown>, data: Serialize): void;
    reject(header: Record<string, unknown>, data: Serialize): void;

    $reset(data: Serialize): Promise<Serialize>;

    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;

    $reboot();

}

export class AbstractServiceAdapter extends Subscription implements IServiceAdapter {

    protected _name: string;
    protected _key: string;
    protected _reboot: boolean;
    protected _stdio: StdioOption;

    protected readonly _race: Map<RegExp, number> = new Map();

    protected readonly _sessions: Map<string, $Promise<unknown>> = new Map();
    protected readonly _bindings: Map<Function, Function> = new Map();


    constructor(name: string, config: ServiceConfig) {

        super();

        this._name = name;

        this._key = config.key || QuickHash();

        const race: number | Record<string, number> = config.race;
        if (isNaN(race as number) === false) {

            this._race.set(/.*/, race as number);

        } else if (typeof race === "object") {

            for (const [key, value] of Object.entries(race as Record<string, number>)) {

                this._race.set(new RegExp(key), value);

            }

        } else {

            throw new Error(`Invalid race value: ${race}`)

        }

        const stdio: string = config.stdio || "pipe";
        switch (stdio.toLowerCase()) {
            case "pipe":
                this._stdio = StdioOption.Pipe;
                break;
            case "inherit":
                this._stdio = StdioOption.Inherit;
                break;
            case "silent":
                this._stdio = StdioOption.Silent;
                break;
            default:
                throw new Error(`Invalid stdio option ( "pipe" | "inherit" | "silent" ): ${config.stdio}`);
        }
        

        this._bindings.set(this._pipeStdio, this._pipeStdio.bind(this));
        this._bindings.set(this._pipeError, this._pipeError.bind(this));
        
        this._bindings.set(this.read, this.read.bind(this));

    }

    protected _getRace(signal: string): number {

        for (const [regExp, race] of this._race) {

            if (regExp.test(signal)) return race;

        }

        throw `"${signal}" does not have a race`;

    }

    protected _pipeStdio(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);

        let output: string[] = [];

        for (const line of lines) {

            try {

                const [forge, header, data] = JSON.parse(line);

                if (header.key != this._key) return;

                this.read([forge, header, data]);

            } catch (error: unknown) {

                if (line != "") output.push(line);

            }

        }

        if (output.length && (this._stdio == "pipe" || this._stdio == "inherit")) {

            console.parse(`<cyan>${output.join("\n")}</cyan>`);

        }

    }

    protected _pipeError(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);

        let output: string[] = [];

        for (const line of lines) {

            try {

                const [forge, header, data] = JSON.parse(line);

                if (header.key != this._key) return;

                this.read([forge, header, data]);

            } catch (error: unknown) {

                if (line != "") output.push(line);

            }

        }

        if (output.length) {

            console.parse(`<magenta>${output.join("\n")}</magenta>`);

        }

    }

    /* get race(): number {

        return this._race;

    } */

    public read(message: [string, Record<string, unknown>, Serialize]): boolean {

        try {

            // first test is to destructure the message
            const [protocol, header, data] = message;

            // broadcast dont have to have validate the key. 
            if ("broadcast" in header) {

                // I know the destructure is excessive, but it make reading code far more easier.
                const { broadcast } = header;
                this.notify("broadcast", header, data);
                return true;

            }

            if (protocol != __ForgeProtocol) return;
            if (header.key != this._key) return;

            if ("resolve" in header) {

                const $race: $Promise = this._sessions.get(header.resolve as string);
                $race[1](data);
                this.notify("resolve", header, data);

            } else if ("reject" in header) {

                console.log("rejected", protocol, header, data);
                
                const $race: $Promise = this._sessions.get(header.reject as string);
                $race[2](data);
                this.notify("reject", header, data);

            } else {

                this.notify("message", header, data);

            }

            return true;

        } catch (error: unknown) {

            // just catch teh error
            console.log("read error", error)

        }

        return false;

    }

    public write(header: Record<string, unknown>, data: Serialize): void {

        throw new Error("Please override write(...) in subclasses");

    }

    public resolve(header: Record<string, unknown>, data: Serialize): void {

        this.write({ resolve: header.session, key: this._key }, data);

    }

    public reject(header: Record<string, unknown>, data: Serialize): void {

        this.write({ reject: header.session, key: this._key }, data);

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        return { name: this._name, reset: this.constructor.name }; // this.$signal("reset", data, this.race);

    }

    public $signal(signal: string, data: Serialize, race?: number): Promise<Serialize> {

        // console.log(signal, data, race);

        const session: string = QuickHash();

        const sessions: Map<string, $Promise> = this._sessions;

        const $race: $Promise<Serialize> = $UseRace(this._getRace(signal));
        $race[0]
            .then(function () {

                // console.parse(`<green>AbstractServiceAdapter.$signal ( ... ) session resolved <cyan>"${signal}"</cyan></green>`);
                // console.log(data);
            })
            .catch(function (error: unknown) {

                console.parse("<yellow>$signal <cyan>race</cyan> exception caught :</yellow>", (error as Error).message);

            })
            .finally(function () {

                sessions.delete(session);

            });


        this._sessions.set(session, $race);

        this.write({ signal, session, key: this._key }, data);

        return $race[0];

    }

    public async $reboot(): Promise<void> {

    }

    public async $route(route: string, params: Serialize): Promise<{ mime: string, buffer: Buffer }> {

        return this.$signal("route", { route, params }, this._getRace("route"))
            .then(async function (data: Serialize) {

                const { mime, contents } = data as { mime: string, contents: string };
                return { mime, buffer: Buffer.from(contents, "base64") };

            })
            .catch(function (error: unknown) {

                console.log(error);

                return { mime: "text/html", buffer: Buffer.from("route error", "utf8") };

            }) as Promise<{ mime: string, buffer: Buffer }>;

    }

}