import { $Promise, $UseRace, QuickHash, Serialize, TimeoutClear } from "../core/Core";
import { ISubscription, Subscription } from "../core/Subscription";
import { ForgeStream } from "./ForgeStream";
import { ForgeTask } from "./ForgeTask";
const $fs = require("fs").promises;

import { IServiceAdapter } from "./service/AbstractServiceAdapter";


const __ForgeProtocol: string = "forge://";

export type ActionConfig = {
    name: string,
    service: string,

    async?: boolean,
    triggers?: [
        {
            trigger: "signal",
            signals: string[]
        },
        {
            trigger: "watch",
            watch: string[]
        },
        {
            trigger: "circuit"
            operator: "and",
            operands: { task?: string, action: string }[]
        }
    ]
}
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

export interface IAction {

    name: string;
    task: ForgeTask;

    dependencies: { task: string, action: string }[];

    implement(): string;

    $reset(data: Serialize): Promise<Serialize>;

    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>

    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;

    $route(url: string, request): Promise<{ mime: string, buffer: Buffer }>;

    write(...rest: Serialize[]): void;

}

export class ForgeAction extends Subscription implements IAction {

    protected _iServiceAdapter: IServiceAdapter;
    protected _data: any;
    protected _implement: string;
    protected _watch: RegExp;

    protected _async: boolean;
    
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
    public enabled: boolean;
    public task: ForgeTask;

    constructor(iServiceAdapter: IServiceAdapter, config: ActionConfig, data: Record<string, unknown>) {
        // this._iServiceAdapter.subscribe("message", this._bindings.get(this._subscribeMessage));
        
        this._implement = config.implement;
        this._data = data;

        // ! data.watch is a special case. Convert from a glob to 
        if ("_watch_" in data) {
            
            const watch: string = String(data._watch_);
            let globStr: string = watch;

            if (/\*\*[\/\\]\*\.\*$/.test(watch)) {

                globStr = globStr.replace(/[\/\\]\*\*[\/\\]\*/, "((.+?)[\\\/\\\\].+?)$")

            } else if (/[\/\\]\*/.test(watch)) {

                globStr = globStr.replace(/[\/\\]\*\*[\/\\]\*/g, "[\\\/\\\\](.+?)")

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

        this.name = config.name || QuickHash();

        this._async = config.async || false;
        
        this._stdio = this._resolveData("stdio", ActionStdioType.Default) as ActionStdioType;

        this._race = this._resolveData("_race_", this._iServiceAdapter.race) as number;

        this.dependencies = this._resolveData("_wait_", []) as { task: string, action: string }[];
        this.enabled = this._resolveData("enabled", true) as boolean;

        this.stdout = [];
        this.stderr = [];

    }

    protected _subscribeBroadcast(notify: string, header: any, data: any): void {

        console.log("_subscribeBroadcast", header, data);

        /* if (notify == "message") {

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

        } */

    }

    protected _subscribeMessage(notify: string, header: Record<string, unknown>, ...data: Serialize[]): void {

        console.error("_subscribeMessage", notify, header, data);


    }

    protected _resolveData(key: string, defaultValue?: unknown): unknown {

        const value: unknown = this._data[key];
        return (value === undefined) ? defaultValue : value;

    }

    public implement(): string {

        return this._implement;

    }

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // optimize the `watch` signals only if a watch value is provided
        if (signal == "watch" && this._watch) {

            const { file, event } = data as { file: string, event: string };

            console.log(`${this.name} watching:`, this._watch, this._watch.test(file), data);
            if (this._watch.test(file) === false) {

                console.warn(`"watch" Signal Ignored`);
                return Promise.reject({ name: this._data._name_, watch: "ignored" });

            }

        }

        // console.log({ ...this._data, ...data as object });

        return this._iServiceAdapter.$signal(signal, { ...this._data, ...data as object }, race);

    }

    public $watch(data: Serialize): Promise<boolean> {

        // optimize the `watch` signals only if a watch value is provided

        const { file, event } = data as { file: string, event: string };

        console.log(this._watch, this._watch.test(file), data);
        if (this._watch && this._watch.test(file) === false) {

            console.warn(`"watch" Signal Ignored`);
            return Promise.reject({ task: this.task.name, name: this._data.name, watch: "ignored" });

        }

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        // need to start time for other 
        this._startTime = Date.now();

        this.stdout = [];
        this.stderr = [];

        return this._iServiceAdapter.$reset(data);

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

    public write(header: Record<string, unknown>, data: Serialize): void {

        this._iServiceAdapter.write(header, data);

    }

    public async $route(route: string, params: Serialize): Promise<Serialize> {

        return this.$signal("route", { route, params }, this._race)
            .then(async function (data: Serialize) {

                const { mime, contents } = data as { mime: string, contents: string };
                return { mime, buffer: Buffer.from(contents, "base64") };

            })
            .catch(function (error: unknown) {

                console.log(error);

                return { mime: "text/html", buffer: Buffer.from("route error", "utf8") };

            }) as Promise<{ mime: string, buffer: Buffer }>;

    }

    public async $serve(route: string, params: Serialize): Promise<{ mime: string, buffer: Buffer }> {

        return this.$signal("serve", { route, params }, this._race)
            .then(async function (response: Serialize) {

                const { mime, contents } = response as { mime: string, contents: string };
                return { mime, buffer: Buffer.from(contents, "base64") };

            })
            .catch(function (error: unknown) {

                console.log(error);

                return { mime: "text/html", buffer: Buffer.from("route error", "utf8") };

            }) as Promise<{ mime: string, buffer: Buffer }>;

    }

}