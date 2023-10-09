import { Serialize } from "../core/Core";
import { GenericAction, IAction } from "./GenericAction";
import { ForgeStream } from "./ForgeStream";
import { IServiceAdapter, ServiceAdpaterConfig } from "./service/AbstractServiceAdapter";
import { Forge } from "./Forge";

export class ForgeTask {

    private _forge: Forge;

    private readonly _iActions: Map<string, IAction> = new Map();

    private _enabled: boolean;

    private _data: any;

    public name: string;
    

    constructor(forge: Forge, config?: any) {

        if (forge === undefined) throw new Error(`Forge Instance must be passed into ForgeTask`);
        if (config === undefined) throw new Error(`Config data must be passed into ForgeTask`);

        this._forge = forge;

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

        return {"please" : "implement or subcalss"};

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

        const actionConfigs: { _name_: string, _implement_: string, _race_?: number, _spawn_?: string, _fork_?: string, _exec_?: string, worker?: string }[] = this._data.actions;
        if (actionConfigs) {

            for (const actionConfig of actionConfigs) {

                let iAction: IAction;

                //try {

                    const name: string = actionConfig._name_;
                    const implement: string = actionConfig._implement_;

                    if (name === undefined) errors.push(`Action "_name_" is undefined for ${this.constructor.name} : ${this.name}"`);
                    if (implement === undefined) errors.push(`Action "_implement_" is undefined for ${this.constructor.name} : ${this.name}"`);
                    
                if ("_spawn_" in actionConfig) {

                    const serviceName: string = actionConfig._spawn_;

                    // todo Replace these queries with `Enforce`
                    // retrieve the service. Assert that the Service exists or add en error
                    if (iServices.has(serviceName) === false) errors.push(`No Spawn Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const spawnService: IServiceAdapter = iServices.get(serviceName);

                    this.add(new GenericAction(spawnService, implement, actionConfig));

                } else if ("_fork_" in actionConfig) {

                    const serviceName: string = actionConfig._fork_;

                    // retrieve the service. Enforce that the Service exists or add en error
                    if (iServices.has(serviceName) === false) errors.push(`No Spawn Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const forkService: IServiceAdapter = iServices.get(serviceName);

                    this.add(new GenericAction(forkService, implement, actionConfig));

                } else if ("_worker_" in actionConfig) {



                } else if ("_exec_") {

                    const serviceName: string = actionConfig._exec_;

                    // retrieve the service. Enforce that the Service exists or add en error
                    if (iServices.has(serviceName) === false) errors.push(`No Execute Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const execService: IServiceAdapter = iServices.get(serviceName);

                    this.add(new GenericAction(execService, implement, actionConfig));

                } else {

                    console.error("total failure");
                    process.exit(1);

                }

                    


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