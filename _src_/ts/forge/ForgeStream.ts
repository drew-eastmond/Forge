import { Serialize } from "../core/Core";
import { IAction } from "./action/AbstractAction";
import { ForgeTask } from "./ForgeTask";

export class ForgeStream {

    private readonly _tasks: Map<string, ForgeTask> = new Map();
    private readonly _iActions: Map<string, IAction> = new Map();
    private readonly _bindings: Map<Function, unknown> = new Map();

    private readonly _executions: Set<IAction> = new Set();

    private _signal: string;
    private _data: Serialize;

    constructor() {

        this._bindings.set(this._thenRaced$Execute, this._thenRaced$Execute.bind(this));
        this._bindings.set(this._$catchRaced$Execute, this._$catchRaced$Execute.bind(this));

    }

    private _thenRaced$Execute(iAction: IAction): void {

    }

    private async _$catchRaced$Execute(error: Error): Promise<Error> {

        // console.error(`Action failed, `, error);
        return new Error("Action failed");

    }

    /*
    *
    *
    *
    */

    public actions(): Iterable<[string, IAction]> {

        return this._iActions;

    }

    public signal(): string;
    public signal(value: string): string;
    public signal(value?: string): string {

        return (value === undefined) ? this._signal : this._signal = value;

    }

    public data(): Serialize;
    public data(value: Serialize): Serialize;
    public data(value?: Serialize): Serialize {

        return (value === undefined) ? this._data : this._data = value;

    }

    public executions(): Set<IAction>;
    public executions(iterable: Iterable<IAction>): Set<IAction>;
    public executions(iterable?: Iterable<IAction>): Set<IAction> {

        if (iterable === undefined) return this._executions;

        for (const iAction of iterable) {

            this._executions.add(iAction);

        }

        return this._executions;

    }

    public add(forgeTask: ForgeTask): this {

        //
        // Dependencies can be based on ForgeTasks or IActions have been executed. So save the forgeTask and atomize each iAction of the
        // so there are easier to fetch using the `find` method
        //
        this._tasks.set(forgeTask.name, forgeTask);

        for (const [actionName, iAction] of forgeTask.actions()) {

            this._iActions.set(`${forgeTask.name}.${actionName}`, iAction);

        }

        return this;

    }

    public find(forgeName: string, actionName: string): IAction {

        // if (dependencyobj.task === undefined && dependencyobj.action === undefined) throw new Error("Both ForgeTask.name and IAction.name are both undefined");

      
        const actionKey: string = `${forgeName}.${actionName}`;
        return this._iActions.get(actionKey);

    }

    public async $reset(): Promise<void> {

        this._executions.clear();

        const promises: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            promises.push(iAction.$reset({}));

        }

        console.log("reset complete", promises);

        await Promise.all(promises);

    }

    public async $signal(signal: string): Promise<(Serialize | Error)[]>
    public async $signal(signal: string, data: Serialize): Promise<(Serialize | Error)[]>
    public async $signal(signal: string, data?: Serialize): Promise<(Serialize | Error)[]> {

        // collectiosn of all responses
        
        const executedActions: Set<IAction> = this._executions;


        const promises: Promise<unknown>[] = [];
        for (const [name, iAction] of this._iActions) {

            // only one execution per reset and action must implement the signal
            if (this._executions.has(iAction)) continue;
            if (iAction.implement() != signal) continue;
            if (iAction.dependencies.length) continue;

            promises.push(iAction.$signal(signal, data)
                .then(function (data: Serialize) {

                    executedActions.add(iAction);

                    return data;

                }));

            /*const response: Serialize | Error = await iAction.$signal(signal, data)
                .then(function (data: Serialize) {

                    executedActions.add(iAction);

                    return data;

                })
                .catch(this._bindings.get(this._$catchRaced$Execute) as (error) => unknown);

                results.push(response); */

        }

        console.log("forgeStream!!!>>>", await Promise.allSettled(promises));

        for (const [name, iAction] of this._iActions) {

            const dependencies: { task?: string, action?: string }[] = iAction.dependencies; 

            if (dependencies.length == 0) {

                console.parse(`<red>no dependencies :</red> "${iAction.task.name}"`);
                continue;

            }

            let resolved: boolean = true;
            for (const dependencyObj of dependencies) {

                const forgeName: string = (dependencyObj.task === undefined) ? iAction.task.name : dependencyObj.task;
                const dependentAction: IAction = this.find(forgeName, dependencyObj.action);

                if (this._executions.has(dependentAction) === false) resolved = false;

            }

            
            if (resolved) {

                console.log("resolvign", iAction.name);

                const implement: string = iAction.implement();
                promises.push(iAction.$signal(implement, data));

            }
            

        }

        const results: ({ status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown })[] | unknown[] = await Promise.allSettled(promises);
        for (let i: number = 0; i < results.length; i++) {

            const settleInfo: { status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown } = results[i] as { status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown };
            const result = ((settleInfo.status == "fulfilled") ? settleInfo.value : settleInfo.reason) as unknown;

            try {

                results[i] = JSON.parse(result as string);

            } catch (error: unknown) {

                results[i] = result;

            }

            

        }

        console.error("realllll", results);

        return results;



        // do dependencies
        /* for (const [name, iAction] of this._iActions) {

            console.log("_executions", this._executions.has(iAction));
            console.log(iAction.implement(), iAction.implement() != "dependency");
            // console.log(iAction.resolveDependencies(this))

            // actions should only be executed once
            if (this._executions.has(iAction)) continue; 
            if (iAction.implement() != "dependency") continue;
            // if (iAction.resolveDependencies(this) === false) continue;

            console.log("dependecy found");

            const response: Serialize | Error = await iAction.$signal("dependency", data)
                .then(function (data: Serialize) {

                    executedActions.add(iAction);

                    return data;

                })
                .catch(this._bindings.get(this._$catchRaced$Execute) as (error) => unknown);

            results.push(response);

        }

        return results; */

    }

}