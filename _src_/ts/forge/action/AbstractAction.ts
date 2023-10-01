import { $Promise, $UseRace, QuickHash, Serialize, TimeoutClear } from "../../core/Core";
import { Expiry } from "../../core/Expiry";
import { ISubscription, Subscription } from "../../core/Subscription";
import { ForgeStream } from "../ForgeStream";
import { ForgeTask } from "../ForgeTask";

const $fs = require("fs").promises;

const __ForgeProtocol: string = "forge://";
export enum ActionStdioType {
    Default = "pipe",
    Pipe = "pipe",
    Inherit = "inherit",
    Silent = "silent"
}

export enum ActionRouter {
    Service = "service",
    Local = "local",
    Remote = "remote"
}

export interface IServiceAdapter extends ISubscription {

    race: number;

    read(message): void;
    write(...data: Serialize[]): void;

    $reset(data: Serialize): Promise<Serialize>;

    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;

}

export class AbstractServiceAdapter extends Subscription implements IServiceAdapter {

    protected _key: string = QuickHash();

    protected readonly _sessions: Map<string, $Promise<unknown>> = new Map();

    public race: number;

    constructor(config: { race: number }) {

        super();

        this.race = config.race;

    }

    public read(message: any): boolean {

        try {

            // first test is to destructure the message
            const [protocol, header, data] = message;

            // console.log(protocol, header, data);

            if (protocol != __ForgeProtocol) return;
            if (header.key != this._key) return;

            if ("resolve" in header) {

                const $race: $Promise = this._sessions.get(header.resolve);
                $race[1](data);
                this.notify("resolve", header, data);


            } else if ("reject" in header) {

                console.log("rejected", protocol, header, data);
                
                const $race: $Promise = this._sessions.get(header.reject);
                $race[2](data);
                this.notify("reject", header, data);

            } else if ("broadcast" in header) {

                const { notify } = header;
                this.notify("broadcast", notify, data);

            } else {

                this.notify("message", message);

            }

            return true;

        } catch (error: unknown) {

            // just catch teh error
            // console.log("read error", error)

        }

        return false;

    }

    public write(...data: Serialize[]): void {

        throw new Error("Please override write(...) in subclasses");

    }

    public $reset(data: Serialize): Promise<Serialize> {

        return this.$signal("reset", data, this.race);

    }

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // console.log(signal, data, race);

        const session: string = QuickHash();

        const sessions: Map<string, $Promise> = this._sessions;

        const $race: $Promise<unknown> = $UseRace(race);
        $race[0]
            .catch(function (error: unknown) {

                // console.parse("<yellow>$signal exception caught :</yellow>", error);

            })
            .finally(function () {

                sessions.delete(session);

            });


        this._sessions.set(session, $race);

        this.write({ signal, session, key: this._key }, data);

        return $race[0];

    }

}


export interface IAction {

    name: string;

    dependencies: { task: string, action: string }[];

    implement(): string;

    $reset(data: Serialize): Promise<Serialize>;

    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>

    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;

    $route(url: string, request): Promise<{ mime: string, buffer: Buffer }>;

    write(...rest: Serialize[]): void;

}
export class AbstractAction extends Subscription implements IAction {

    private _task: ForgeTask;

    protected _iProcessAdapter: IServiceAdapter;
    protected _data: any;
    protected _implement: string;
    protected _watch: RegExp;

    protected _async: boolean;
    protected _enabled: boolean;

    protected _stdio: ActionStdioType;

    protected _startTime: number;
    protected _race: number;
    protected _cancelable: boolean;
    protected _renderer: ActionRouter;

    protected readonly _bindings: Map<Function, Function> = new Map();

    protected readonly _sessions: Map<string, $Promise<Serialize>> = new Map();

    public readonly dependencies: { task: string, action: string }[];

    public stdout: [string, number][];
    public stderr: [string, number][];

    public name: string;

    constructor(iServiceAdapter: IServiceAdapter, implement: string, data: any) {

        super();

        this._bindings.set(this._subscribeBroadcast, this._subscribeBroadcast.bind(this));

        this._iProcessAdapter = iServiceAdapter;
        this._iProcessAdapter.subscribe("broadcast", this._bindings.get(this._subscribeBroadcast));
        
        this._implement = implement;
        this._data = data;

        // ! data.watch is a special case. Convert from a glob to 
        if (data.watch) {
            
            const watch: string = String(data.watch);
            let globStr: string = watch;

            if (/\*\*[\/\\]\*\.\*$/.test(watch)) {

                globStr = globStr.replace(/[\/\\]\*\*[\/\\]\*/, "((.+?)[\\\/\\\\].+?)$")

            } else if (/[\/\\]\*/.test(watch)) {

                globStr = globStr.replace(/\*\*[\/\\]\*/g, "[\\\/\\\\](.+?)")

            } 
            // glob replacemetn for "**/*"
                // .replace(/[\/\\]/g, "[\\\\\/]")
                // .replace(/\*/, "\\*")
                
                // replace "*"
            // globStr = globStr
            //    .replace(/[\/\\]\*/g, "(\\\\*)"); 

            console.parse(`<blue>${globStr}</blue>`);
            this._watch = new RegExp(globStr);


        }

        this.name = this._resolveData("name", QuickHash()) as string;

        this._async = this._resolveData("async", false) as boolean;
        this._enabled = this._resolveData("enabled", true) as boolean;

        this._stdio = this._resolveData("stdio", ActionStdioType.Default) as ActionStdioType;

        this._race = this._resolveData("race") as number;

        this.dependencies = this._resolveData("wait", []) as { task: string, action: string }[];

        this.stdout = [];
        this.stderr = [];

    }

    protected _subscribeBroadcast(notify: string, header: any, data: any): void {

        // console.log(">>>>", notify, header, data);

        if (notify == "message") {

            if (header.resolve) {

                const resolve: string = header.resolve;
                if (this._sessions.has(resolve)) {

                    const $promise: $Promise = this._sessions.get(resolve);
                    $promise[1](data);

                    this._sessions.delete(resolve);

                }

            } else if (header.reject) {

                const reject: string = header.reject;
                if (this._sessions.has(reject)) {

                    const $promise: $Promise = this._sessions.get(reject);
                    $promise[2](data);

                    this._sessions.delete(reject);

                }

            } else if (header.signal !== undefined) {

                console.log("NOOOOOO");
                this.notify(header.signal, data);

            }

        }

    }

    protected _resolveData(key: string, defaultValue?: unknown): unknown {

        const value: unknown = this._data[key];
        return (value === undefined) ? defaultValue : value;

    }

    /* protected _then$signal(value: unknown): unknown {

        console.log("_then$signal");

        return value;

    }

    protected _catch$signal(error: unknown): void {

        console.log("Error", error);

    } */

    public task(forgeTask: ForgeTask): void {

        this._task = forgeTask;

    } 

    public implement(): string {

        return this._implement;

    }

    public $signal(signal: string): Promise<unknown>;
    public $signal(signal: string, data: Serialize): Promise<unknown>;
    public $signal(signal: string, data: Serialize, race: number): Promise<unknown>;
    public $signal(signal: string, data?: Serialize, race?: number): Promise<unknown> {

        // optimize the `watch` signals only if a watch value is provided
        if (signal == "watch") {

            console.log(this._watch, this._watch.test(String(data)), data);
            if (this._watch && this._watch.test(String(data)) === false) {

                console.warn(`"watch"" Signal Ignored`);

        }

        return this._iProcessAdapter.$signal(signal, data, race);

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        // need to start time for other 
        this._startTime = Date.now();

        this.stdout = [];
        this.stderr = [];

        return this._iProcessAdapter.$reset(data);

    }

    public async $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void> {

        // reroute the `stderrCallback` with `stdoutCallback` if none is provid
        stderrCallback = stderrCallback || stdoutCallback;

        let completeDelay: number = 0;

        // first
        for (const [message, delay] of this.stdout) {

            setTimeout(function () {

                const messages: string[] = message.split(/\n+/g);
                for (const log of messages) {

                    if (log != "") {

                        stdoutCallback(log);

                    }

                }

            }, delay);

            completeDelay = Math.max(delay, completeDelay);

        }

        for (const [error, delay] of this.stderr) {

            setTimeout(function () {

                const errors: string[] = error.split(/\n+/g);
                for (const log of errors) {

                    if (log != "") {

                        stderrCallback(log);

                    }

                }

            }, delay);

            completeDelay = Math.max(delay, completeDelay);

        }

        return new Promise(function (resolve) {

            setTimeout(resolve, completeDelay);

        });

    }

    public write(...rest: Serialize[]): void {

        throw new Error("AbstractAction.write( .. ) should be overriden");

    }

    

    public async $load(iStorage): Promise<this> {


        return this;

    }

    public async $save(iStorage): Promise<this> {



        return this;

    }

    public help(): { label: string, values: [string, string], description: string }[] {

        return [
            { label: "async", values: ["true | false", "true"], description: "does the `Action` completion event depends if execution completes" },
            { label: "enabled", values: ["true | false", "true"], description: "weather the `Action` will execute" },
            { label: "stdio", values: ["[ default, pipe, stdio & Dependency]", "default"], description: "An array of value combine to override the stdio to pipe from a dependency `Action`" },
            { label: "race", values: ["0 - 9999999", "0"], description: "how long to give the `Action` to complete before aborting" },
            { label: "rebound", values: ["0 - 5", "0"], description: "how many times to rebound $execute" },

            { label: "render", values: ["internal", ""], description: "how many times to rebound $execute" },
        ]

    }

    public async $route(route: string, params: Serialize): Promise<{ mime: string, buffer: Buffer }> {

        return this.$signal("route", { route, params })
            .then(async function (response: Serialize) {

                const { mime, contents } = JSON.parse(response as string);
                return { mime, buffer: Buffer.from(contents, "base64") };

            })
            .catch(function (error: unknown) {

                return { mime: "text/html", buffer: Buffer.from("route error", "utf8") };

            }) as Promise<{ mime: string, buffer: Buffer }>;

    }

}





















/*


/* return new Promise(function (resolve, reject) {

            _this.write({ signal, session, key }, data);

            const expiry: Expiry = (race === undefined) ? new Expiry(_this._race) : new Expiry(race);

            _this.$listen("message", function (iAction: IAction, message) {

                console.log("signal $listen", message);

                try {

                    const [response, data] = message;

                    if (response.session != session) return false;

                    if (response.resolve == signal) {

                        resolve(data);
                        return true;

                    } else if (response.reject == signal) {

                        reject(data);
                        return true;

                    }

                } catch (error) {

                    // ignore message!!
                    console.error("message ignored", message);

                }

            }, expiry);

        })
            .catch(function (err) {

                return err;

            })
            .finally(function () {

                console.log("COMPLETE PARENT");

                clearTimeout(timeout);

            }); */

/* public async $rebound(forgeStream: ForgeStream): Promise<boolean> {

this._rebound -= 1;
if (this._rebound < 0) return false;

const dependencies: string[] = this.data.dependencies;
if (dependencies === undefined) return false;

for (const dependency of dependencies) {

for (const iAction of forgeStream.executions()) {

if (iAction.name() == dependency) {

    this.$execute(forgeStream);

}

}

}


return true;

}

*/