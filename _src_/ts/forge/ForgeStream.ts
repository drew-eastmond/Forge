import { resolve } from "dns";
import { Serialize } from "../core/Core";
import { IAction } from "./action/ForgeAction";
import { ForgeTask } from "./ForgeTask";

export class ForgeStream {

    private readonly _tasks: Map<string, ForgeTask> = new Map();
    private readonly _iActions: Map<string, IAction> = new Map();
    private readonly _bindings: Map<Function, unknown> = new Map();

    private _signal: string;
    private _data: Serialize;


    public readonly settled: Set<IAction> = new Set();
    public readonly resolves: Set<IAction> = new Set();
    public readonly rejections: Set<IAction> = new Set();

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

        this.settled.clear();
        this.resolves.clear();
        this.rejections.clear();

        const promises: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            promises.push(iAction.$reset({}));

        }

        return { reset: await Promise.allSettled(promises) };

    }

    public async $signal(signal: string, data?: Serialize, race?: number): Promise<Serialize> {

        this._signal = signal;
        this._data = data;

        // collectiosn of all responses
        const resolves: Set<IAction> = this.resolves;
        const rejects: Set<IAction> = this.rejections;
        const executions: Set<IAction> = this.settled;
        

        const signalStatus: Record<string, unknown> = {};
        let reboundSignal: boolean = true;
        let reboundCount: number = 0;

        

        while (reboundSignal) {

            reboundSignal = false;

            const triggeredActions: IAction[] = [];
            const $executions: Promise<Serialize>[] = [];

            for (const [name, iAction] of this._iActions) {

                // only one execution per reset and action must implement the signal
                // const errors: string[] = [];
                // if (this._executions.has(iAction)) continue; // errors.push(`${name} already executed`);
                // if (iAction.implement() != signal) errors.push(`${name}->"${iAction.implement()}" does not implement signal : "${signal}"`);;
                // f (iAction.dependencies.length) errors.push(`${name} has dependencies`);


                if (await iAction.$trigger(this)) {

                    triggeredActions.push(iAction);

                }

            }


            for (const iAction of triggeredActions) {

                executions.add(iAction);

                $executions.push(iAction.$signal(signal, data, race)
                    .then(function (data: Serialize) {

                        resolves.add(iAction);

                        return {
                            name: iAction.name,
                            resolve: data
                        }

                    })
                    .catch(function (error: unknown) {

                        rejects.add(iAction);

                        // console.parse(error.message);
                        throw {
                            name: iAction.name,
                            reject: error
                        };

                    }));

            }

            const allSettled: PromiseSettledResult<Serialize>[] = await Promise.allSettled($executions);

            if (allSettled.length) {

                reboundSignal = true;

                if (reboundCount == 0) {

                    signalStatus.executions = allSettled;
                    signalStatus.resolves = resolves;
                    signalStatus.reject = rejects;

                } else {

                    if (reboundCount == 1) {

                        signalStatus.rebound = allSettled;

                    } else {

                        signalStatus[`rebound(${reboundCount})`] = allSettled;

                    }
                    

                }

                reboundCount++;

            }
        }

        console.group(signal);
        console.log(data);
        // console.log (signalStatus.executions, { depth: 1 });
        // console.log(JSON.stringify(signalStatus, null, 4));
        console.groupEnd();

        return signalStatus;
        

    }

}

            /*





        const failedDependencies: string[] = [];
        const $rebounds: Promise<Serialize>[] = [];
        for (const [name, iAction] of this._iActions) {

            // const dependencies: { task?: string, action?: string }[] = iAction.dependencies;

            /*if (dependencies.length == 0) {

                failedDependencies.push(`${iAction.task.name}\\${iAction.name}`);
                continue;

            }

            let dependenciesResolved: boolean = true;
            for (const dependencyObj of dependencies) {

                // find all dependent `iAction` then test if been executed, otherwise `dependenciesResolved` is false
                const dependentAction: IAction = this.find(dependencyObj.task || iAction.task.name, dependencyObj.action);
                if (this._executions.has(dependentAction) === false) dependenciesResolved = false;

            } * /

// if the current iAction passed the previous `dependenciesResolved` test
// if (dependenciesResolved && this._executions.has(iAction) === false) {
if (await iAction.$trigger(this)) {

    console.log("rebounding", iAction.name);
    executedActions.add(iAction);

    $rebounds.push(iAction.$signal(signal, data)
        .then(function (data: Serialize) {

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

console.log(signal, data, {
    executions,
    rebounds
});

return {
    executions,
    rebounds
}; */