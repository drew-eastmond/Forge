const $fs = require("fs").promises;

import { $Promise, $UseRace, QuickHash, Serialize, TimeoutClear } from "../../core/Core";

import { ISubscription, Subscription } from "../../core/Subscription";
import { ForgeStream } from "../ForgeStream";
import { ForgeTask } from "../ForgeTask";
import { IServiceAdapter } from "../service/AbstractServiceAdapter";
import { IForgeTrigger, ParseTrigger, TriggerData } from "./ForgeTrigger";

export type ActionData = {

    name: string,
    triggers: TriggerData[],
    service: string,

    enabled?: boolean,
    race?: number,
    route?: boolean
}

export type ActionConfig = {

    name: string,
    route: boolean
    enabled: boolean,
    race: number,

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

    // dependencies: { task: string, action: string }[];

    // implement(): string;

    $reset(data: Serialize): Promise<Serialize>;

    $trigger(forgeStream: ForgeStream): Promise<boolean>;

    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;

    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>

    $serve(url: string, request): Promise<{ mime: string, buffer: Buffer }>;

    $route(url: string, request): Promise<Serialize>;

    write(...rest: Serialize[]): void;

    add(overload: IForgeTrigger): this;

}

export class ForgeAction extends Subscription implements IAction {

    public static Parse(iServiceAdapter: IServiceAdapter, actionData: Record<string, unknown>, data: Record<string, unknown>): IAction {

        const triggerData: TriggerData[] = actionData.triggers as TriggerData[];
        const iForgeTriggers: IForgeTrigger[] = triggerData.map(ParseTrigger);

        const iAction: IAction = new ForgeAction(iServiceAdapter, { name: actionData.name as string, ...actionData }, data);

        for (const iForgeTrigger of iForgeTriggers) {

            iAction.add(iForgeTrigger);


        }

        return iAction;

    }

    protected _iServiceAdapter: IServiceAdapter;
    protected _data: any;
    protected _watch: RegExp;

    protected _startTime: number;
    protected _race: number;
    protected _cancelable: boolean;
    protected _renderer: ActionRouter;

    protected readonly _bindings: Map<Function, Function> = new Map();

    protected readonly _sessions: Map<string, $Promise<Serialize>> = new Map();

    protected _iForgeTriggers: Set<IForgeTrigger> = new Set();

    // public readonly dependencies: { task: string, action: string }[];

    public stdout: [string, number][];
    public stderr: [string, number][];

    public name: string;
    public enabled: boolean;
    public task: ForgeTask;

    constructor(iServiceAdapter: IServiceAdapter, actionConfig: ActionConfig, data: Record<string, unknown>) {

        super();

        if (iServiceAdapter === undefined) throw new Error(`iServiceAdapter is undefined`);

        this._iServiceAdapter = iServiceAdapter;

        this.name = actionConfig.name || QuickHash();

        this._race = actionConfig.race || this._iServiceAdapter.race; // this._resolveData("_race_", this._iServiceAdapter.race) as number;

        // this.dependencies = this._resolveData("_wait_", []) as { task: string, action: string }[];
        this.enabled = actionConfig.enabled || true;


        // this get merged, injected, then sent via `signals`
        this._data = data;

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

    public add(overload: IForgeTrigger): this {

        this._iForgeTriggers.add(overload);

        return this;

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        if (this.enabled === false) return false;
        if (forgeStream.executions.has(this)) return false;

        for (const iForgeTrigger of this._iForgeTriggers) {

            if (await iForgeTrigger.$trigger(forgeStream)) return true;

        }

        return false;

    }

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // optimize the `watch` signals only if a watch value is provided
        /* if (signal == "watch" && this._watch) {

            const { file, event } = data as { file: string, event: string };

            console.log(`${this.name} watching:`, this._watch, this._watch.test(file), data);
            if (this._watch.test(file) === false) {

                console.warn(`"watch" Signal Ignored`);
                return Promise.reject({ name: this._data._name_, watch: "ignored" });

            }

        } */

        // console.log({ ...this._data, ...data as object });

        return this._iServiceAdapter.$signal(signal, { ...this._data, ...data as object }, race);

    }

    /* public $watch(data: Serialize): Promise<boolean> {

        // optimize the `watch` signals only if a watch value is provided

        const { file, event } = data as { file: string, event: string };

        console.log(this._watch, this._watch.test(file), data);
        if (this._watch && this._watch.test(file) === false) {

            console.warn(`"watch" Signal Ignored`);
            return Promise.reject({ task: this.task.name, name: this._data.name, watch: "ignored" });

        }

    } */

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