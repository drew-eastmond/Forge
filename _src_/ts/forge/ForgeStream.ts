import { Serialize } from "../core/Core";
import { IAction } from "./action/ForgeAction";
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

    get actions(): Iterable<[string, IAction]> {

        return this._iActions;

    }

    get signal(): string {

        return this._signal;

    }

    get data(): Serialize {

        return this._data;

    }

    get executions(): Set<IAction> {

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

    public async $reset(): Promise<Serialize> {

        this._signal = undefined;
        this._data = undefined;

        this._executions.clear();

        const promises: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            promises.push(iAction.$reset({}));

        }

        return { reset: await Promise.allSettled(promises) };

    }

    public async $signal(signal: string, data?: Serialize): Promise<Serialize> {

        this._signal = signal;
        this._data = data;

        // collectiosn of all responses
        
        const executedActions: Set<IAction> = this._executions;


        const $executions: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            // only one execution per reset and action must implement the signal
            // const errors: string[] = [];
            if (this._executions.has(iAction)) continue; // errors.push(`${name} already executed`);
            // if (iAction.implement() != signal) errors.push(`${name}->"${iAction.implement()}" does not implement signal : "${signal}"`);;
            // f (iAction.dependencies.length) errors.push(`${name} has dependencies`);

            if (await iAction.$trigger(this)) {

                $executions.push(iAction.$signal(signal, data)
                    .then(function (data: Serialize) {

                        executedActions.add(iAction);

                        return {
                            name: iAction.name,
                            resolve: data
                        }

                    })
                    .catch(function (error: unknown) {

                        console.parse(error);
                        return {
                            name,
                            reject: error
                        };

                    }));

            }

            /* if (errors.length) {

                $executions.push(Promise.reject({
                    name,
                    reject: errors
                }));
                continue;

            } else {

                

            } */

        }

        const executions: ({ status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown })[] | unknown[] = await Promise.allSettled($executions);
        // console.log("forgeStream executions !!!>>>", executions);

        const failedDependencies: string[] = [];
        const $rebounds: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            const dependencies: { task?: string, action?: string }[] = iAction.dependencies; 

            if (dependencies.length == 0) {

                failedDependencies.push(`${iAction.task.name}\\${iAction.name}`);
                continue;

            }

            let dependenciesResolved: boolean = true;
            for (const dependencyObj of dependencies) {

                // find all dependent `iAction` then test if been executed, otherwise `dependenciesResolved` is false
                const dependentAction: IAction = this.find(dependencyObj.task || iAction.task.name, dependencyObj.action);
                if (this._executions.has(dependentAction) === false) dependenciesResolved = false;

            }

            // if the current iAction passed the previous `dependenciesResolved` test
            if (dependenciesResolved && this._executions.has(iAction) === false) {

                console.log("rebounding", iAction.name);

                $rebounds.push(iAction.$signal(signal, data)
                    .then(function (data: Serialize) {

                        executedActions.add(iAction);

                        return {
                            name: iAction.name,
                            resolve: data
                        }

                    })
                    .catch(function (error: unknown) {

                        console.parse(error);
                        return {
                            name,
                            reject: error
                        };

                    }));
                
                

            }
            

        }

        const rebounds: ({ status: "fulfilled", value: unknown } | { status: "rejected", reason: unknown })[] | unknown[] = await Promise.allSettled($rebounds);

        console.log({
            executions,
            rebounds
        });

        return {
            executions,
            rebounds
        };

    }

}