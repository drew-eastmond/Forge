import { Serialize } from "../core/Core";
import { GenericAction, IAction } from "./GenericAction";
import { ForgeStream } from "./ForgeStream";
import { IServiceAdapter, ServiceAdpaterConfig } from "./service/AbstractServiceAdapter";
import { ExecService } from "./service/ExecService";
import { ForkService } from "./service/ForkService";
import { SpawnService } from "./service/SpawnService";

export class ForgeTask {

    private readonly _iActions: Map<string, IAction> = new Map();

    private _enabled: boolean;

    private _data: any;

    private _spawnServices: Map<string, IServiceAdapter> = new Map();
    private _forkServices: Map<string, IServiceAdapter> = new Map();
    private _workerServices: Map<string, IServiceAdapter> = new Map();

    private _iServices: Map<string, IServiceAdapter> = new Map();

    public name: string;

    constructor(config?: any) {

        if (config === undefined) return;

        this.parse(config);

    }

    private _buildService(services: { spawn?: Record<string, ServiceAdpaterConfig>, fork?: Record<string, ServiceAdpaterConfig>, exec?: Record<string, ServiceAdpaterConfig> }, errors: string[]): void {

        if (services === undefined) throw new Error(`No services assigned to "${this.name}"`);

        const spawnObj: Record<string, ServiceAdpaterConfig> = services.spawn;
        if (spawnObj) {

            for (const [key, serviceConfig] of Object.entries(spawnObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for SPAWN service "${key}"`);
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for SPAWN service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.spawn(key, serviceConfig);

            }

        }

        const forkObj: Record<string, ServiceAdpaterConfig> = services.fork;
        if (forkObj) {
            for (const [key, serviceConfig] of Object.entries(forkObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for FORK service "${key}"`);
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for FORK service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.fork(key, serviceConfig);

            }
        }

        const execObj: Record<string, ServiceAdpaterConfig> = services.exec;
        if (execObj) {
            for (const [key, serviceConfig] of Object.entries(execObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for EXEC service "${key}"`);
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for EXEC service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.exec(key, serviceConfig);

            }
        }

    }

    public data(): any {

        return this._data;

    }

    public actions(): Map<string, IAction> {

        return this._iActions;

    }

    public spawn(key: string): IServiceAdapter;
    public spawn(key: string, config: ServiceAdpaterConfig): IServiceAdapter;
    public spawn(key: string, config?: ServiceAdpaterConfig): IServiceAdapter {

        // no duplicate entries
        if (this._spawnServices.has(key)) throw new Error(`Task(${this.name}) : IServiceAdapter (spawn) already exists "${key}"`);

        const spawnService: SpawnService = new SpawnService(config);
        this._spawnServices.set(key, spawnService);

        return spawnService;

    }

    public fork(key: string): any;
    public fork(key: string, config: ServiceAdpaterConfig): any;
    public fork(key: string, config?: ServiceAdpaterConfig): any {

        if (this._forkServices.has(key) && config === undefined) throw new Error(`Task(${this.name}) : IServiceAdapter (fork) already exists "${key}"`);

        const forkService: ForkService = new ForkService(config);
        this._forkServices.set(key, forkService);
        
        return this._forkServices;

    }

    public worker(key: string): any;
    public worker(key: string, config: ServiceAdpaterConfig): any;
    public worker(key: string, config?: ServiceAdpaterConfig): any {

        if (this._workerServices.has(key) && config === undefined) throw new Error(`Task has no Worker by the key : "${key}"`);

        return this._workerServices;

    }

    public exec(key: string): any;
    public exec(key: string, config: ServiceAdpaterConfig): any;
    public exec(key: string, config?: ServiceAdpaterConfig): any {

        if (this._iServices.has(key) && config === undefined) throw new Error(`Task has no Exec by the key : "${key}"`);

        const execService: ExecService = new ExecService(config);
        this._iServices.set(key, execService);

        return this._iServices;

    }

    public async $reset(data: Serialize): Promise<Serialize[]> {

        const startTime = Date.now();

        const promises: Promise<unknown>[] = [];
        for (const [name, iProcess] of this._spawnServices) {

            promises.push(iProcess.$reset(data));

        }

        const results: unknown[] = await Promise.allSettled(promises);

        console.log(results, Date.now() - startTime);

        return results;

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

        /*
        *
        * 1. 
        *   instantiate all the spawn processes from this data structure
        * 
        * "spawn" : {
        *   "{name: string}": {
        *           "command": "{string}",
        *           "race": {number},
        *           "reboot" : {boolean}
        *           ...{extra_data_passed_to_process}
        *       } 
        *   },
        *   ...
        * }
        * 
        */
        this._buildService(this._data.services, errors);
        

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
                    if (this._spawnServices.has(serviceName) === false) errors.push(`No Spawn Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const spawnService: IServiceAdapter = this._spawnServices.get(serviceName);

                    this.add(new GenericAction(spawnService, implement, actionConfig));

                } else if ("_fork_" in actionConfig) {

                    const serviceName: string = actionConfig._fork_;

                    // retrieve the service. Enforce that the Service exists or add en error
                    if (this._forkServices.has(serviceName) === false) errors.push(`No Spawn Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const forkService: IServiceAdapter = this._forkServices.get(serviceName);

                    this.add(new GenericAction(forkService, implement, actionConfig));

                } else if ("_worker_" in actionConfig) {



                } else if ("_exec_") {

                    const serviceName: string = actionConfig._exec_;

                    // retrieve the service. Enforce that the Service exists or add en error
                    if (this._iServices.has(serviceName) === false) errors.push(`No Execute Service has been registered for ${this.constructor.name} : "${this.name}"`);
                    const execService: IServiceAdapter = this._iServices.get(serviceName);

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