const { spawn, fork, exec, execSync } = require("child_process");
const chokidar = require("chokidar");
const $fs = require("fs").promises;
const glob = require("glob");
const express = require("express");
const url = require("url");
const path = require("path");

import { EncodeBase64, FlattenObject, IntervalClear, Serialize, TimeoutClear } from "../core/Core";
import { Debouncer } from "../core/timing/Debounce";
import { ForgeIO } from "../io/ForgeIO";
import { ForgeStream } from "./ForgeStream";
import { ForgeTask } from "./ForgeTask";
import { ForgeServer } from "./server/ForgeServer";
import { IServiceAdapter, ServiceAdpaterConfig } from "./service/AbstractServiceAdapter";
import { ExecService } from "./service/ExecService";
import { ForkService } from "./service/ForkService";
import { SpawnService } from "./service/SpawnService";

// relay class defitions

class WatchManager {

    private _forge: Forge;

    private _delay: number;
    private _debouncer: Debouncer = new Debouncer();

    private readonly _watchEntries: Set<{ event: string, file: string }> = new Set(); 

    constructor(forge: Forge, delay: number) {

        this._forge = forge;
        this._delay = delay;

    }

    private async _debounceWatch (): Promise<void> {

        const watchEntries: { file: String, event: string }[] = Array.from(this._watchEntries);
        this._watchEntries.clear();
        for (const watchEntry of watchEntries) {

            await this._forge.$signal("watch", watchEntry);

        }

    }

    public add(file: string, event: string): void {

        this._watchEntries.add({ file, event });

        this._debouncer.debounce(this._debounceWatch, [], this._delay);

    }

}

export class Forge {

    public static Search(pattern: string) : void {
        
        
        
    }

    private _lastUpdate: number = Date.now();

    private _forgeServer: ForgeServer;

    private readonly _taskMap: Map<string, ForgeTask> = new Map();

    private readonly _ignoreArr = [/(^|[\/\\])\../];

    private readonly _forgeStream: ForgeStream = new ForgeStream();

    public readonly services: Map<string, IServiceAdapter> = new Map();

    constructor() {

    }

    private _buildService(services: { spawn?: Record<string, ServiceAdpaterConfig>, fork?: Record<string, ServiceAdpaterConfig>, exec?: Record<string, ServiceAdpaterConfig> }, errors: string[]): void {

        if (services === undefined) throw new Error(`No services assigned`);

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

    public parse(input: string): void {

        const variables = JSON.parse(input).variables;

        const entries: { access: string, value: unknown }[] = FlattenObject(variables);

        /*
        * 1. Replace all `static variables` : {var} 
        */
        for (const { access, value } of entries) {

            input = input.replace(new RegExp(`{${access}}`, "g"), String(value));

        }

        /*
        * 2. Reparse the new config string and add all the supplied forege task
        */
        const configObj = JSON.parse(input);

        /*
        *
        * 3. 
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
        this._buildService(configObj.services, []);


        for (const taskObj of configObj.tasks) {

            const forgeTask: ForgeTask = new ForgeTask(this, taskObj);
            this.add(forgeTask);

        }

    }

    public tasks(): Map<string, ForgeTask> {

        return this._taskMap;

    }

    public add(forgeTask: ForgeTask): this {

        const name: string = forgeTask.name;

        if (this._taskMap.has(name)) throw new Error(`task with "${name}" name already exist`);

        this._taskMap.set(name, forgeTask);

        this._forgeStream.add(forgeTask);

        return this;

    }

    public spawn(name: string, config?: ServiceAdpaterConfig): IServiceAdapter {

        // no duplicate entries
        if (this.services.has(name)) throw new Error(`IServiceAdapter (spawn) already exists "${name}"`);

        const spawnService: SpawnService = new SpawnService(name, config);
        this.services.set(name, spawnService);

        return spawnService;

    }

    public fork(name: string, config?: ServiceAdpaterConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (fork) already exists "${name}"`);

        const forkService: ForkService = new ForkService(name, config);
        this.services.set(name, forkService);

        return forkService;

    }

    public worker(name: string, config: ServiceAdpaterConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (worker) already exists "${name}"`);

        // const workerService = {}; // = new ExecService(name, config);
        // this.services.set(name, workerService);

        // return workerService;
        return;

    }

    public exec(name: string, config: ServiceAdpaterConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (exec) already exists "${name}"`);

        const execService: ExecService = new ExecService(name, config);
        this.services.set(name, execService);

        return execService;

    }

//    public search(): void {
//
//        const files: string[] = glob.sync("**/.forge");
//        for (const file of files) {
//            
//            this.parse($fs.readFileSync(file, "utf8"));
//
//        }
//
//    }

    public watch(root: string, options: { ignore: string[], debounce?: number }): void {

        const watcher = chokidar.watch(["./src/**/*"], { 'ignored': this._ignoreArr });

        const forge: Forge = this;
        watcher.on("ready", function () {
            watcher.on("all", async function (event: string, file : string) {

                const resetNow: number = Date.now();
                const resets: Serialize = await forge.$reset({ file, event });
                console.log("resetTime:", Date.now() - resetNow);
                // console.log("ForgeStream reset", resets);

                const watchNow: number = Date.now();
                await forge.$signal("watch", { file, event });
                console.log("watchTime:", Date.now() - watchNow);

            });

        });

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        const $promises: Promise<Serialize>[] = [];
        for (const [name, iService] of this.services) {

            $promises.push(iService.$reset(data));

        }

        // we need to await services for synchronization reasons.
        await Promise.allSettled($promises);

        for (const [name, forgeTask] of this._taskMap) {

            await forgeTask.$reset(data);

        }

        await Promise.allSettled($promises);

        $promises.push(this._forgeStream.$reset());

        return { reset: Promise.allSettled($promises) };

    }

    public async $signal(signal: string, data: Serialize): Promise<Serialize> {

        const results: Serialize = await this._forgeStream.$signal(signal, data);

        return results;

    }



    public abort(): void {

        // oh fuck! Hurry up and clean up...



    }

    public async $serve(port: number, base: string): Promise<ForgeServer> {

        // validate the port
        if (isNaN(port)) throw new Error("No port assigned");

        // validate the base and test if the directory exists
        if (await ForgeIO.$DirectoryExists(base) === false) throw new Error(`Serve base provided is invalid "${base}"`);
        
        // the params will be validated in the  `ForgeServer` constructor
        this._forgeServer = new ForgeServer(this, port, base);

        return this._forgeServer;

    }

    public async $load(): Promise<void> {

    }

    public async $save(): Promise<void> {



    }

}


/*

private _update(file: string) {

        const now: number = Date.now();

        console.log(now, this._lastUpdate + this._debounceDelay);

        if (now < this._lastUpdate + this._debounceDelay) {

            this._lastUpdate = now;

            clearInterval(this._debounceTimeout);
            this._debounceTimeout = setTimeout(this._update, this._debounceDelay);

            return;

        }

        console.log(now - this._lastUpdate);

        this._lastUpdate = now;

        const startTime = Date.now();

        for (const [name, forgeTask] of this._taskMap) {

            // forgeTask.$watch(file);

        }

        console.log(`\n\n\trun time: ${Date.now() - startTime}ms : "${file}"`);

    }

/*


// if (forgeTask.enabled() === false) return;

        // loop through each module/melody
        /* for (const iAction of forgeTask.actions()) {

            // skip all modules that are not enabled
            // if (actionObj.enabled === false) continue;

            // run all construct tasks. Accepts tasks or sequential array
            // const constructorTask = actionObj.construct;
            // await this._$execAction(constructorTask, actionObj);


            // watch triggers for CRUD
            const [ watchData, if ] = iAction.watch();
            if (watchData !== undefined) {

                // used for chokidar in node
                this.watchArr.push(watchData.match);

                // ignore is only implemented globally
                if (watchData.ignore !== undefined) {

                    this.ignoreArr.push(triggerData.ignore);

                }

                if (watchData.fork !== undefined) {

                    this.moduleMap.set(moduleData.name, new ForkTrigger(moduleData, forgeData, this.dependencyMap));

                } else if (triggerData.spawn !== undefined) {



                }

            } 

        }*/

/*

private async _$execAction(command, taskData) {

        // double check that 
        if (command !== undefined) {

            console.group(`construct: ${taskData.name}`);
            const commands = (command instanceof Array) ? command : [command];
            for (let command of commands) {

                console.log("command", command);

                if (command.fork !== undefined) {

                    command = command.fork;

                } else if (command.spawn !== undefined) {

                    command = command.spawn;

                } else {

                    // throw "Command invalid : " + JSON.stringify(command);

                }

                // inject dynamic varaibles
                command = command.replace(/{{melody}}/g, `--task-- ${EncodeBase64(taskData)}`);

                if (taskData.construct) {
                    command = command.replace(/{{construct}}/g, `--construct-- ${EncodeBase64(taskData.construct)}`);
                }



                // try {

                execSync(command, { "stdio": "inherit" });



                // } catch (error) {

                //	console.log("Command Failed", task);

                //}

            }
            console.groupEnd();

        }

    }





/* if (require.main === module && !module.parent) {

    new RenderServer();

    const maestro = new Maestro();
    maestro.$start();

    // console.log("called directly", __dirname);

    const workerfiles = []; // ["./.core/Maestro.js", "./.core/Server.js"];
    for (const workerFile of workerfiles) {

        console.log(path.resolve(__dirname, workerFile));

        workers.push(new Worker(path.resolve(__dirname, workerFile)));

    }

    // const maestor = new Worker("./.core/Maestro.js");

    //new Worker("./.core/Server.js");
    // worker.on('exit', console.log);

} else {

    console.log("required as a module");

} */


/* protected _$reject(delay: number): Promise<unknown>;
protected _$reject(delay: number, reason: unknown): Promise<unknown>;
protected _$reject(delay: number, reason?: unknown): Promise<unknown> {

return new Promise(function (resolve, reject) {

    setTimeout(function () {

        reject(reason);

    }, delay);

});











        return;

        this._app = express();


        this._app.all("/:task/:action/*", async function (request, response, next) {

            // res.setHeader("Access-Control-Allow-Origin", "*");
            // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
            // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            // res.setHeader("Cross-origin-Embedder-Policy", "require-corp");
            // res.setHeader("Cross-origin-Opener-Policy", "same-origin");

            // const path = url.parse(request.url).pathname;

            // const paths: strin = path.split(/.+?\//g);

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            const route: string = request.params[0];
            const file: string = request.params[0] || "index.html";
            const fileName: string = path.resolve(taskName, file);
            const query: any = request.query;

            const forgeTask: ForgeTask = this._taskMap.get(taskName);
            if (forgeTask === undefined) {


                console.parse("<red>NO task</red>", taskName);
                return;

            }



            console.parse("<green>has task</green>", taskName);
            const iAction: IAction = forgeTask.actions().get(actionName);

            if (iAction === undefined) {

                response.sendStatus(404);
                next();

                return;

            }
            console.log("has action", forgeTask.actions().keys(), String(iAction));

            await iAction.$route(route, query);


            // await $fs.readFile(fileName);

            /*fs.open('foo.txt', 'r', (err, fd) => {
                // ...
            });

            const html = fs.readFileSync("./static/task_1/index.html", "utf-8");

            /* fs.access(req.path, (err) => {
                if (err) {
                    res.status(404).send("Sorry can't find that!");
                    return;
                } else { }
            });

// const html = fs.readFileSync("./symphonee/express/index.html", "utf-8"); // root;// path; // fs.readFileSync(root + "index.html", "utf-8");


// app.use(express.static("./symphonee/express/"));



//

console.log(request.params);
console.log(fileName);
console.log(request.params[0]);

// response.send(JSON.stringify(request.params) + "<br />" + JSON.stringify(request.query));

const { mime, buffer } = await iAction.$route(route, query);

console.log(mime, buffer);

// response.setHeader("Content-Type", "text/html");
response.set(mime).end(buffer); // .send(buffer);
            // response.end();

            // next();

        }.bind(this));

this._app.all("/", async function (request, response, next: Function) {

    $fs.readFile("./.src/.templates/html/index.html")
        .then(function (buffer: Buffer) {

            response.set("text/html").end(buffer);

        })
        .catch(function (error: unknown) {

            console.log("GOT HIM");
            return "404";
        })

});

this._app.listen(port);



} */