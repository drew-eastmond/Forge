import { $Promise, $UseRace, QuickHash, Serialize } from "../../core/Core";
import { ISubscription, Subscription } from "../../core/Subscription";

const __ForgeProtocol: string = "forge://";

export type ServiceConfig = {
    command?: string
    debounce?: number,
    race?: number,

    key?: string,
    reboot?: boolean,
    route_root?: string
}

export interface IServiceAdapter extends ISubscription {
    get race(): number;

    read(message: [string, Record<string, unknown>, Serialize]): void;

    write(header: Record<string, unknown>, data: Serialize): void;
    resolve(header: Record<string, unknown>, data: Serialize): void;
    reject(header: Record<string, unknown>, data: Serialize): void;

    $reset(data: Serialize): Promise<Serialize>;

    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;

    $reboot();

}

export class AbstractServiceAdapter extends Subscription implements IServiceAdapter {

    protected _name: string;
    protected _key: string;
    protected _race: number;
    protected _reboot: boolean;

    protected readonly _sessions: Map<string, $Promise<unknown>> = new Map();
    protected readonly _bindings: Map<Function, Function> = new Map();


    constructor(name: string, config: ServiceConfig) {

        super();

        this._name = name;

        this._key = config.key || QuickHash();
        this._race = config.race;

        this._bindings.set(this._pipeStdio, this._pipeStdio.bind(this));
        this._bindings.set(this._pipeError, this._pipeError.bind(this));
        
        this._bindings.set(this.read, this.read.bind(this));

    }

    protected _pipeStdio(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);

        for (const line of lines) {

            try {

                const [forge, header, data] = JSON.parse(line);

                if (header.key != this._key) return;

                this.read([forge, header, data]);

            } catch (error: unknown) {

                if (line != "") {

                    console.parse(`<cyan>${line}</cyan>`);

                }

            }

        }

    }

    protected _pipeError(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);

        for (const line of lines) {

            try {

                const [forge, header, data] = JSON.parse(line);

                if (header.key != this._key) return;

                this.read([forge, header, data]);

            } catch (error: unknown) {

                if (line != "") {

                    console.parse(`<magenta>${line}</magenta>`);

                }

            }

        }

    }

    get race(): number {

        return this._race;

    }

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

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // console.log(signal, data, race);

        const session: string = QuickHash();

        const sessions: Map<string, $Promise> = this._sessions;

        const $race: $Promise<Serialize> = $UseRace(race);
        $race[0]
            .then(function () {

                console.parse(`<green>$signal session resolved <cyan>"${signal}"</cyan></green>`);
                // console.log(data);
            })
            .catch(function (error: unknown) {

                console.parse("<yellow>$signal exception caught :</yellow>", error);

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

}