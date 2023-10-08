import { Serialize } from "../core/Core";
import { IAction } from "./GenericAction";
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

    public find(taskName: string, actionName: string): IAction {

        // if (dependencyobj.task === undefined && dependencyobj.action === undefined) throw new Error("Both ForgeTask.name and IAction.name are both undefined");

        const forgeTask: ForgeTask = this._tasks.get(taskName);
        if (forgeTask === undefined) throw new Error(`ForgeTask : "${taskName}" does not exist`);

        const iAction: IAction = forgeTask.actions().get(actionName);
        if (iAction === undefined) throw new Error(`IAction : "${actionName}" does not exist within "${taskName}"`);

        return iAction;
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
            const errors: string[] = [];
            if (this._executions.has(iAction)) errors.push(`already executed`);
            if (iAction.implement() != signal) errors.push(`already executed`);;
            if (iAction.dependencies.length) errors.push(`already executed`);;

            if (errors.length) {

                promises.push(Promise.reject({
                    status: 'rejected',
                    reason: errors
                }));
                continue;

            } else {

                promises.push(iAction.$signal(signal, data)
                    .then(function (data: Serialize) {

                        executedActions.add(iAction);

                        return data;

                    }));

            }

            

            /*const response: Serialize | Error = await iAction.$signal(signal, data)
                .then(function (data: Serialize) {

                    executedActions.add(iAction);

                    return data;

                })
                .catch(this._bindings.get(this._$catchRaced$Execute) as (error) => unknown);

                results.push(response); */

        }

        const results: ({ status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown })[] | unknown[] = await Promise.allSettled(promises);
        console.log("forgeStream!!!>>>", await Promise.allSettled(promises));

        const failedDependencies: string[] = [];
        for (const [name, iAction] of this._iActions) {

            const dependencies: { task?: string, action?: string }[] = iAction.dependencies; 

            if (dependencies.length == 0) {

                failedDependencies.push(`${iAction.task.name}\\${iAction.name}`);
                continue;

            }

            let dependenciesResolved: boolean = true;
            for (const dependencyObj of dependencies) {

                // find all dependent `iAction` then test if been executed, otherwise `dependenciesResolved` is false
                const dependentAction: IAction = this.find(dependencyObj.task, dependencyObj.action);
                if (this._executions.has(dependentAction) === false) dependenciesResolved = false;

            }

            // if the current iAction passed the previous `dependenciesResolved` test
            if (dependenciesResolved && this._executions.has(iAction) === false) {

                console.log("resolving", iAction.name);

                const implement: string = iAction.implement();
                await iAction.$signal(implement, data)
                    .catch(function (error: unknown) {

                        console.parse(error);
                        return error;    

                    });
                executedActions.add(iAction);
                

            }
            

        }

        console.parse(`<red>no dependencies :</red> "${failedDependencies.join(", ")}"`);

        // const results: ({ status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown })[] | unknown[] = await Promise.allSettled(promises);
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