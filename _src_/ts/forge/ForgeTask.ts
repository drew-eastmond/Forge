import { Serialize } from "../core/Core";
import { Forge } from "./Forge";
import { ActionConfig, ActionData, ForgeAction, IAction } from "./action/ForgeAction";
import { IServiceAdapter } from "./service/AbstractServiceAdapter";

export type TaskConfig = {

    name: string,
    enabled: boolean,

    actions: ActionConfig[]

}

export class ForgeTask {

    private _forge: Forge;

    private readonly _iActions: Map<string, IAction> = new Map();

    private _enabled: boolean;

    private _data: Record<string, unknown>;

    public name: string;
    

    constructor(forge: Forge, config?: Record<string, unknown>) {

        if (forge === undefined) throw new Error(`Forge Instance must be passed into ForgeTask`);
        this._forge = forge;

        if (config === undefined) return; 
        // throw new Error(`Config data must be passed into ForgeTask`);
        

        this.parse(config);

    }

    public data(): any {

        return this._data;

    }

    public actions(): Map<string, IAction> {

        return this._iActions;

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        /* const startTime = Date.now();

        const promises: Promise<unknown>[] = [];
        for (const [name, iProcess] of this._spawnServices) {

            promises.push(iProcess.$reset(data));

        }

        const results: unknown[] = await Promise.allSettled(promises);

        console.log(results, Date.now() - startTime); */

        return { resolve: "not implemented" };

    }

    public add(iAction: IAction): this {

        iAction.task = this;
        this._iActions.set(iAction.name, iAction);

        return this;

    }

    public parse(configObj): void {

        this._data = configObj;

        this.name = configObj.name;

        this._enabled = configObj.enabled;

        const errors: string[] = [];

        const iServices: Map<string, IServiceAdapter> = this._forge.services;
       
        /*
        *
        * 1. 
        *   Instantiate all the actions from this data structure! Boom chica wow wow!!
        *   All data is serialized the to the process via CLI interface
        *   
        * "actions": [
        *   {
        *       "_name_" : {name},
        *       "{_spawn_|_fork_|_worker_|_exec_}" : {string}
        *   },
        *   ...
        * ]
        * 
        */

        const actionData: [ActionData, Record<string, unknown>][] = this._data.actions as [ActionData, Record<string, unknown>][];
        if (actionData) {

            for (const [actionObj, data] of actionData) {

                //try {

                const service: string = actionObj.service;

                if (service === undefined) errors.push(`Action "service" is undefined for ${this.constructor.name} : ${this.name}"`);
                
                // todo Replace these queries with `Enforce`
                // retrieve the service. Assert that the Service exists or add en error
                if (iServices.has(service) === false) errors.push(`No Service has been registered for "${service}" by "${this.name}"`);
                const iServiceAdapter: IServiceAdapter = iServices.get(service);

                if (iServiceAdapter === undefined) {

                    console.log(`hmmmmmmmmmmmm no service found, ${service}`);
                    process.exit();

                }

                this.add(ForgeAction.Parse(iServiceAdapter, actionObj, data));


                //} catch (error: unknown) {

                    // handle this properly later
                //    throw error;

                //}

                

                

            }

        }

        // ! Note: race needs to be sanitized
        if (errors.length) throw new Error("\n\n" + errors.join("\n") + "\n");

    }

}