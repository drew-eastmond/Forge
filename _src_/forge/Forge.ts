const { spawn, fork, exec, execSync } = require("child_process");
const chokidar = require("chokidar");
const $fs = require("fs").promises;;
const glob = require("glob");
const express = require("express");
const url = require("url");
const path = require("path");

import { EncodeBase64, FlattenObject, IntervalClear, Serialize, TimeoutClear } from "../core/Core";
import { IAction } from "./action/AbstractAction";
import { ForgeStream } from "./ForgeStream";
import { ForgeTask } from "./ForgeTask";
import { ForgeServer } from "./server/ForgeServer";

// relay class defitions



export class Forge {

    private _app; // i have no what type express() returns;

    private _debounceTimeout;
    private _debounceDelay: number = 1000;
    private _lastUpdate: number = Date.now();

    private _forgeServer: ForgeServer;

    private readonly _workerMap: Map<string, Worker> = new Map();

    private readonly _taskMap: Map<string, ForgeTask> = new Map();

    private readonly _ignoreArr = [/(^|[\/\\])\../];

    private readonly _fileSet: Set<string> = new Set();

    private readonly _forgeStream: ForgeStream = new ForgeStream();

    constructor(port: number) {

        if (isNaN(port)) throw new Error("No port assigned");

        this._forgeServer = new ForgeServer(this, port);

    }

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

    private parse(config: string): void {

        const variables = JSON.parse(config).variables;

        const entries: { access: string, value: unknown }[] = FlattenObject(variables);

        for (const { access, value } of entries) {

            config = config.replace(new RegExp(`{${access}}`, "g"), String(value));

        }

        // reparse the new config string 
        const configObj = JSON.parse(config);

        for (const taskObj of configObj.forge) {

            const forgeTask: ForgeTask = new ForgeTask(taskObj);
            // this.$add(forgeTask);

        }

    }

    public tasks(): Map<string, ForgeTask> {

        return this._taskMap;

    }

    public add(forgeTask: ForgeTask): this {

        const name: string = forgeTask.name;

        if (this._taskMap.has(name)) throw new Error(`task with "${name}" name already exist`);

        this._taskMap.set(forgeTask.name, forgeTask);

        this._forgeStream.add(forgeTask);

        return this;

    }

    public search(): void {

        const files: string[] = glob.sync("**/.forge");
        for (const file of files) {
            
            this.parse($fs.readFileSync(file, "utf8"));

        }

    }

    public watch(): void {

        const _update: Function = this._update;

        const watcher = chokidar.watch(["**/*"], [".src/**/*"], { 'ignored': this._ignoreArr });

        watcher.on("ready", function () {

            console.log("watch is ready!");
            watcher.on("all", function (event, file) {

                this.$signal("watch", file);

            }.bind(this));

        }.bind(this));

    }

    public async $reset(): Promise<void>;
    public async $reset(data: Serialize): Promise<void>;
    public async $reset(data?: Serialize): Promise<void> {

        data = data || {};

        for (const [name, forgeTask] of this._taskMap) {

            await forgeTask.$reset(data);

        }

    }

    public async $signal(signal: string, data: Serialize): Promise<(Serialize | Error)[]> {

        const results: (Serialize | Error)[] = await this._forgeStream.$signal(signal, data);

        return results;

    }

    public abort(): void {

        // oh fuck! Hurry up and clean up...



    }

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