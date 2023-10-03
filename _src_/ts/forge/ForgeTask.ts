import { Serialize } from "../core/Core";
import { IAction } from "./action/AbstractAction";
import { ForkAction } from "./action/ForkAction";
import { SpawnAction } from "./action/SpawnAction";
import { ForgeStream } from "./ForgeStream";
import { IServiceAdapter } from "./service/AbstractServiceAdapter";
import { SpawnService } from "./service/SpawnService";

export class ForgeTask {

    private readonly _iActions: Map<string, IAction> = new Map();

    private _enabled: boolean;

    private _data: any;

    private _spawnServices: Map<string, IServiceAdapter> = new Map();
    private _forkServices: Map<string, IServiceAdapter> = new Map();
    private _workerServices: Map<string, IServiceAdapter> = new Map();

    public name: string;

    constructor(config?: any) {

        if (config === undefined) return;

        this.parse(config);

    }

    public data(): any {

        return this._data;

    }

    public actions(): Map<string, IAction> {

        return this._iActions;

    }

    public spawn(key: string, config: { command: string, race: number, reboot?: boolean }): IServiceAdapter {

        // no duplicate entries
        if (this._spawnServices.has(key)) throw new Error(`Task(${this.name}) : IServiceAdapter (spawn) already exists "${key}"`);

        const spawnService: SpawnService = new SpawnService(config);
        this._spawnServices.set(key, spawnService);

        return spawnService;

    }

    public fork(key: string): any;
    public fork(key: string, command: string): any;
    public fork(key: string, command?: string): any {

        if (this._forkServices.has(key) && command === undefined) throw new Error(`Task(${this.name}) : IServiceAdapter (fork) already exists "${key}"`);

        
        
        return this._forkServices;

    }

    public worker(key: string): any;
    public worker(key: string, command: string): any;
    public worker(key: string, command?: string): any {

        if (this._workerServices.has(key) && command === undefined) throw new Error(`Task has no Worker by the key : "${key}"`);

        return this._workerServices;

    }

    public async $reset(data: Serialize): Promise<(Serialize | Error)[]> {

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

        if (this._data.services === undefined) throw new Error(`No services assigned to "${this.name}"`);

        const spawnObj: Record<string, { command: string, race: number, reboot?: boolean }> = this._data.services.spawn;
        if (spawnObj) {

            for (const [key, spawnConfig] of Object.entries(spawnObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race
                
                if (spawnConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for Spawn service "${key}"`);
                if (isNaN(spawnConfig.race)) errors.push(`Invalid \`race\` parameter provided for Spawn service "${key}"`);

                // if there are any errors throw them so develops can fix there config data
                if (errors.length) throw new Error(errors.join("\n"));

                // truthfully, we dont really use the return value
                const spawnService: IServiceAdapter = this.spawn(key, spawnConfig);

            }

        }

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

        const actionConfigs: { _name_: string, _implement_: string, _race_?: number, _spawn_?: string, fork?: string, worker?: string }[] = this._data.actions;
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

                    // get the race from the current or inherit from `actionConfig`

                    this.add(new SpawnAction(spawnService, implement, actionConfig));

                } else if ("_fork_" in actionConfig) {


                } else if ("_worker_" in actionConfig) {



                } else if ("_exec_") {

                }

                    


                //} catch (error: unknown) {

                    // handle this properly later
                //    throw error;

                //}

                

                

            }

        }

        // ! Note: race needs to be sanitized
        console.log("errors", errors);
        if (errors.length) throw new Error("\n\n" + errors.join("\n") + "\n");
        
        // 

        // process all the 
        //
        /* for (const [key, command] of Object.entries(configObj.spawns) as Iterable<[string, string]>) {

            const commands: string[] = command.split(/\s+/g);
            const args: string[] = [...commands.slice(1), "--key--", key];
            const child = spawn(commands[0], args, { stdio: "pipe" });

            child.on("exit", function () {

                console.log("exited");

            });

            this._spawnActions.set(key, child);

        }

        /* return;

        for (const implement of ["start", "watch", "broadcast", "observe", "destruct"]) {

            if (implement in configObj) {

                let iAction: IAction;

                if ("spawn" in configObj) {

                    iAction = new SpawnAction(implement, configObj);

                } else if ("fork") {

                    iAction = new ForkAction(implement, configObj);

                } else if ("exec") {

                    // iAction = new ExecAction(key, configObj);

                } else if ("worker") {

                    // iAction = new WorkerAction(key, configObj);

                } else {

                    throw new Error(`Action has no implementation ${configObj[implement]}`);

                }

                this.add(iAction);

            }

        } */

    }

}


/* public async $signal(forgeStream: ForgeStream): Promise<void> {

        for (const iAction of this._iActionArr) {

            iAction.$signal(forgeStream.signal(), forgeStream.data());

        }

        this.$resolve(forgeStream);

    } */

/* public $resolve(forgeStream: ForgeStream, race?: number): Promise<unknown> {

        console.log("resolving....");

        for (const [string, iAction] of forgeStream.actions()) {

            let resolved: boolean = true;
            for (const dependencyObj of iAction.dependencies) {

                const dependentAction = forgeStream.find(dependencyObj.task, this.name);
                if (forgeStream.executions().has(dependentAction) === false) resolved = false;

            }

            if (resolved === false) continue;

            iAction.$resolve(this);

        }

        

            

            // if no action was provided then the check if all 

            


        /* for (const dependencyObj of this._dependencies) {

            const forgeName: string = (dependencyObj.task === undefined) ? this.task.name : dependencyObj.task;
            const iAction = forgeStream.find(forgeName, this.name);

            // if no action was provided then the check if all 

            if (forgeStream.executions().has(iAction) === false)

        } 
        

        return false;

    } */