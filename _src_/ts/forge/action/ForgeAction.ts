import { QuickHash, Serialize } from "../../core/Core";
import { Subscription } from "../../core/Subscription";
import { ForgeStream } from "../ForgeStream";
import { ForgeTask } from "../ForgeTask";
import { IServiceAdapter } from "../service/AbstractServiceAdapter";
import { IForgeTrigger, ParseTrigger, TriggerData } from "./ForgeTrigger";

/**
 * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
 * 
 * @typedef {Object} ActionData
 * 
 * @property {TriggerData[]}  triggers - An array of data to instantiate a set of `IForgeTriggers`.
 * @property {string}  service - Binds this action to a service provided by the `Forge` instance. 
 * @property {(string|undefined)}  name - (optional) the default error message.
 * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
 * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
 * @property {(boolean|undefined)}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`.
 * 
 */

export type ActionData = {
    
    triggers: TriggerData[],
    service: string,

    name?: string,
    enabled?: boolean,
    race?: number,
    route?: boolean
}

/**
 * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
 * 
 * @typedef {Object} ActionConfig
 * 
 * @property {(string|undefined)}  name - (optional) the default error message.
 * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
 * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
 * @property {(boolean|undefined)}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`. 
 * 
 */

export type ActionConfig = {

    name?: string,
    route: boolean
    enabled: boolean,
    race: number,

}

export interface IAction {

    name: string;
    task: ForgeTask;
    route: boolean;

    $reset(data: Serialize): Promise<Serialize>;

    $trigger(forgeStream: ForgeStream): Promise<boolean>;

    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;

    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>

    $route(url: string, request): Promise<Serialize>;

    write(...rest: Serialize[]): void;

    add(overload: IForgeTrigger): this;

}

/**
 * ForgeAction is the base class to eval signal dispatching from triggers, dispatch `$signals`, route requests, or stream output during `ForgeStream.$signal( ... )`
 * 
 */
export class ForgeAction extends Subscription implements IAction {

    public static Parse(iServiceAdapter: IServiceAdapter, actionData: ActionData, data: Record<string, unknown>): IAction {

        const route: boolean = actionData.route || false;
        const name: string = actionData.name;
        const enabled: boolean = actionData.enabled || true;
        const race: number = actionData.race;

        const iAction: IAction = new ForgeAction(iServiceAdapter, { name, route, enabled, race }, data);

        const triggerData: TriggerData[] = actionData.triggers as TriggerData[];
        const iForgeTriggers: IForgeTrigger[] = triggerData.map(ParseTrigger);
        for (const iForgeTrigger of iForgeTriggers) {

            iAction.add(iForgeTrigger);

        }

        return iAction;

    }

    protected _iServiceAdapter: IServiceAdapter;
    protected _data: any;

    protected _startTime: number;
    protected _race: number;
    protected _cancelable: boolean;

    protected readonly _bindings: Map<Function, Function> = new Map();

    protected _iForgeTriggers: Set<IForgeTrigger> = new Set();

    public stdout: [string, number][];
    public stderr: [string, number][];

    public name: string;
    public enabled: boolean;
    public task: ForgeTask;
    public route: boolean;

    constructor(iServiceAdapter: IServiceAdapter, actionConfig: ActionConfig, data: Record<string, unknown>) {

        super();

        if (iServiceAdapter === undefined) throw new Error(`iServiceAdapter is undefined`);

        this._iServiceAdapter = iServiceAdapter;

        this.name = actionConfig.name || QuickHash();

        this._race = actionConfig.race || this._iServiceAdapter.race;

        this.enabled = actionConfig.enabled || true;

        this.route = actionConfig.route || false;

        // this get merged, injected, then sent via `signals`
        this._data = data;

        this.stdout = [];
        this.stderr = [];

    }

    protected _subscribeBroadcast(notify: string, header: any, data: any): void {

        console.log("_subscribeBroadcast", header, data);

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

        return this._iServiceAdapter.$signal(signal, { ...this._data, ...data as object }, race);

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

    public async $route(route: string, params: Serialize): Promise<{ mime: string, buffer: Buffer }> {

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

    /* public async $serve(route: string, params: Serialize): Promise<{ mime: string, buffer: Buffer }> {

        return this.$signal("serve", { route, params }, this._race)
            .then(async function (response: Serialize) {

                const { mime, contents } = response as { mime: string, contents: string };
                return { mime, buffer: Buffer.from(contents, "base64") };

            })
            .catch(function (error: unknown) {

                console.log(error);

                return { mime: "text/html", buffer: Buffer.from("route error", "utf8") };

            }) as Promise<{ mime: string, buffer: Buffer }>;

    } */

}