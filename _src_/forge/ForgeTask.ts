import { Serialize } from "../core/Core";
import { IAction, IServiceAdapter } from "./action/AbstractAction";
import { ForkAction } from "./action/ForkAction";
import { SpawnAction, SpawnService } from "./action/SpawnAction";
import { ForgeStream } from "./ForgeStream";

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
        if (this._spawnServices.has(key)) throw new Error(`Task(${this.name}) : Spawn process already exists "${key}"`);

        // validate then sanitize the config
        

        // sanitize the config paramter
        const race: number = config.race;
        const reboot: boolean = config.reboot || true;

        const spawnService: SpawnService = new SpawnService(config);

            

            // const commands: string[] = command.split(/\s+/g);
            // const child = spawn(commands[0], commands.slice(1), { stdio: "pipe" });

            // process.stdin.pipe(this._child.stdin);
            // this._child.stdin.setEncoding("utf-8");

            /* child.on("exit", function () {

                console.log("spawn exited");

            }); */

        this._spawnServices.set(key, spawnService);



        return spawnService;

    }

    public fork(key: string): any;
    public fork(key: string, command: string): any;
    public fork(key: string, command?: string): any {

        if (this._forkServices.has(key) && command === undefined) throw new Error(`Task has no Fork by the key : "${key}"`);

        if (command) {

            const commands: string[] = command.split(/\s+/g);
            const child = fork(commands[0], commands.slice(1), { stdio: "pipe" });

            child.on("exit", function () {

                console.log("spawn exited");

            });

            this._forkServices.set(key, child);


        }

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

        console.log("configObj", configObj);
        this._data = configObj;

        this.name = configObj.name;
        this._enabled = configObj.enabled;

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
                const errors: string[] = [];
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
        *       "name" : {name},
        *       "{spawn|fork|worker}" : {string}
        *   },
        *   ...
        * ]
        * 
        */

        const actions: Record<string, { name: string, race?: number, spawn?: string, fork?: string, worker?: string }> = this._data.actions;
        if (actions) {

            for (const [key, actionConfig] of Object.entries(actions)) {

                let iAction: IAction;
                if ("spawn" in actionConfig) {

                    const name: string = actionConfig.spawn;
                    

                    // todo Replace these queries with `Enforce`
                    // Validate the data first
                    const errors: string[] = [];
                    if (actionConfig.spawn === undefined) errors.push(`Invalid name provided for SpawnAction : "${this.name}" for Task : "${this.name}""`);
                    if (this._spawnServices.has(name) === false) errors.push(`No Spawn Service has been registered for "${name}"`);

                    // ! Note: race needs to be sanitized
                    if (errors.length) throw new Error("\n\n" + errors.join("\n") + "\n");

                    // Each action wrap the process.                    
                    const spawnService: IServiceAdapter = this._spawnServices.get(name);

                    // get the race from the current or inherit from `actionConfig`
                    const race: number = actionConfig.race || spawnService.race;
                    iAction = new SpawnAction(spawnService, name, { ...actionConfig, race: race });

                } else if ("fork" in actionConfig) {


                } else if ("worker" in actionConfig) {



                }

                // add the action and off to the next one
                this.add(iAction);

            }

        }
        
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