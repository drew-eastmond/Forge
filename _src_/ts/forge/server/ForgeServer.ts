const express = require("express");
const compression = require("compression");
const url = require("url");
const path = require("path");
const $fs = require("fs").promises;
const mimeTypes = require("mime-types");

import { $Promise, $UsePromise, DecodeBase64, Serialize, TimeoutClear } from "../../core/Core";
import { DebugFormatter } from "../../core/Debug";
import { Debouncer } from "../../core/timing/Debounce";
import { IAction } from "../action/ForgeAction";
import { Forge } from "../Forge";
import { ForgeTask } from "../ForgeTask";
import { ForgeModel, ForgeStore, IForgeModel } from "../model/ForgeModel";
import { GenericRoute, ActionRoute, DelegateRoute, IForgeRoute, RemoteRoute } from "./route/ForgeRoute";

DebugFormatter.Init({ platform: "node" });

/*
*   
*   Private Members for current Module
*
*/


/*
*
* Types / Enums
*
*/
type StoreEntry = { mime: string, buffer: Buffer };

export async function $ParseRequestBody(request): Promise<{ mime: string, buffer: Buffer}> {

    return new Promise(function (resolve: Function, reject: Function) {

        const buffers: Buffer[] = [];
        request
            .on("data", (chunk: Buffer) => {

                buffers.push(chunk);

            })
            .on('end', () => {

                // at this point, `body` has the entire request body.
                const mime: string = request.get("Content-Type");
                const buffer: Buffer = Buffer.concat(buffers);
                resolve({ mime, buffer });

            });

    })

}

/*
* class
*/



export class RequestBodyParser {

    private _buffers: Buffer[];
    private _request;
    private _$buffer: $Promise<{ mime: string, buffer: Buffer }>;
    private _onData = function (data: Buffer): void {

        this._buffer.push(data);

    }.bind(this);

    constructor(request) {

        this._buffers = [];
        this._$buffer = $UsePromise();

        this._request = request;
        this._request
            .on("data", this._onData)
            .on("end", this._onEnd);
            
    }

    private _onEnd = function (data: Buffer): void {

        this._request
            .off("data", this._onData)
            .off("end", this._onEnd);
        

        const mime: string = this._request.get("Content-Type");
        const buffer: Buffer = Buffer.concat(this._buffers);
        this._$buffer[1]({ mime, buffer });

        this._buffers = undefined;
        this._request = undefined;

    }.bind(this);

    public $resolve(): Promise<{ mime: string, buffer: Buffer }> {

        return this._$buffer[0];

    }

}

export class ForgeRouteRequest {

    private _uri: string;
    private _urlParsed;
    private _header;
    private _body;

    contructor(uri: string, header, body) {

    }

}

export class ForgeServer {

    private _forge: Forge;

    private _app;

    private _base: string;

    private _debouncer: Debouncer = new Debouncer();

    private readonly _routeSet: Set<IForgeRoute> = new Set();

    // temporary for now. Connect to `ether` or `ForgeStorage`
    private readonly _database: Map<string, Map<string, StoreEntry>> = new Map();
    private _iForgeStorage: IForgeModel;

    constructor(forge: Forge, port: number, base : string) {

        this._forge = forge;

        // validate the port
        if (isNaN(port)) throw new Error("No port assigned");

        this._base = path.resolve(base);
        
        this._$setupServer(port);

    }

    private _saveBackup = function (...rest: unknown[]) {

        const saveObj = {};
        for (const [partitionName, partition] of this._database) {

            saveObj[partitionName] = {};

            for (const [key, { mime, buffer }] of partition) {

                saveObj[partitionName][key] = { mime, buffer: buffer.toString("base64") };

            }

        }

        $fs.writeFile("./backup.json", JSON.stringify(saveObj));
        console.parse("<red>saved backup/session file (<yellow>./backup.json</yellow>)</red>")

    }.bind(this);

    private async _$setupServer(port: number): Promise<void> {

        this._app = express();

        this._app.use(compression());

        this._app.use(function (request, response, next: Function) {

            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            response.setHeader("Cross-Prigin-Opener-Policy", "same-origin");

            next();

        });

        this._app.all("/:task/:action/storage/save/*", async function (request, response, next: Function) {

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            const key: string = request.params[0];
            
            try {

                // const requestBody: string = String(await this._requestBodyParser.$parse(request));
                const { mime, buffer } = await $ParseRequestBody(request);
                await this.$save(`${taskName}/${actionName}`, key, mime, buffer);

                response
                    .sendStatus(200)
                    .end();

            } catch (error: unknown) {

                if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

                response.sendStatus(404).end();

            }

        }.bind(this));

        this._app.all("/:task/:action/storage/load/*", async function (request, response, next: Function) {

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            const key: string = request.params[0];

            try {

                // localize the access to the task/action
                const { mime, buffer } = await this.$load(`${taskName}/${actionName}`, key);
                response.setHeader("Content-Type", mime).end(buffer);

            } catch (error: unknown) {

                if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

                response.sendStatus(404).end();

            }

        }.bind(this));

        this._app.all("/:task/:action/storage/keys", async function (request, response, next: Function) {

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;

            try {

                const partitionName: string = `${taskName}/${actionName}`;
                const keys: string[] = await this.$keys(partitionName);

                const output: string = JSON.stringify(keys);
                response
                    .setHeader("Content-Type", "application/json")
                    .end(Buffer.from(output));

            } catch (error: unknown) {

                if (error instanceof Error) console.parse(`<red>${error.message}</red>`);

                response.sendStatus(404).end();

            }

        }.bind(this));

        this._app.all("/:task/*", async function (request, response, next: Function) {

            console.log(`\nTASK ROUTE\n`);

            const route: string = request.params[0];

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            
            const file: string = request.params[0] || "index.html";
            const fileName: string = path.resolve(taskName, file);
            const query: any = request.query;

            const tasks: Map<string, ForgeTask> = this._forge.tasks();

            console.log(tasks.keys(), taskName);

            const forgeTask: ForgeTask = tasks.get(taskName);
            if (forgeTask === undefined) {

                console.parse("<red>NO task</red>", taskName);
                response.sendStatus(404);
                next();

                return;

            }
            
            const iAction: IAction = forgeTask.actions().get(actionName);

            console.parse(`<green>has :task/:actions > <cyan>"${taskName}"</cyan>/<cyan>"${actionName}"</cyan> from <cyan>[ ${Array.from(forgeTask.actions().keys())} ]</cyan></green>\n\n`);

            if (iAction === undefined) {

                console.parse(`<red>No Action for ${actionName}</red>\n\n`);

                response.sendStatus(404);

                return;

            } else if (iAction.route === false) {

                console.parse(`<red>Action does not have a route ${actionName}</red>\n\n`);

                response.sendStatus(404);

                return;

            }

            // console.log(request.params);
            // console.log(fileName);
            // console.log(request.params[0]);

            // response.send(JSON.stringify(request.params) + "<br />" + JSON.stringify(request.query));

            const { mime, buffer } = await iAction.$route(route, query);

            response
                .setHeader("Content-Type", mime)
                .end(buffer);

            

        }.bind(this));

        this._app.all("*", async function (request, response, next: Function) {

            const file: string = (request.params[0] == "/") ? "index.html" : "." + request.params[0];
            const route: string = path.resolve(this._base, file);

            console.log("ForgeServer *", request.params, route);
            // console.log("base", this._base);
            // console.log("all routes", route);
            // console.log("");

            $fs.readFile(route)
                .then(function (buffer: Buffer) {

                    response.setHeader("Content-Type", mimeTypes.lookup(route)).end(buffer);

                })
                .catch(function (error: unknown) {

                    return "404";

                });

        }.bind(this));


        this._app.listen(port);

        const database: Map<string, Map<string, StoreEntry>> = this._database;
        $fs.readFile("./backup.json")
            .then(function (buffer: Buffer) {

                

                database.clear();

                const loadObj: Record<string, Record<string, { mime: string, buffer: string }>> = JSON.parse(String(buffer));
                for (const [partitionName, storeEntries] of Object.entries(loadObj)) {

                    if (database.has(partitionName) === false) {

                        database.set(partitionName, new Map());

                    }

                    const partition: Map<string, StoreEntry> = this._database.get(partitionName);
                    for (const [key, { mime, buffer }] of Object.entries(storeEntries)) {

                        partition.set(key, { mime, buffer: Buffer.from(DecodeBase64(buffer)) });

                    }                    

                }

                console.parse(`<magenta>BACK UP FILE LOADED database { ${Array.from(database.keys())} }\n</magenta>`);


                /* for (const [partitionName, partition] of this._database) {

                    saveObj[partitionName] = {};

                    for (const [key, { mime, buffer }] of partition) {

                        saveObj[partitionName][key] = { mime, buffer: buffer.toString("base64") };

                    }

                } */

            }.bind(this))
            .catch(function (error: unknown) {

                console.parse(`<cyan>back up file failed\n<yellow>${(error as Error).message}`);

            })
            .finally(function () {

                console.parse(`<green>Server start at ${port}</green>`);
                

            }.bind(this));

        

    }

    public async $keys(partitionName: string): Promise<string[]> {
        
        if (this._database.has(partitionName) === false) {

            this._database.set(partitionName, new Map());

        }

        const partition: Map<string, StoreEntry> = this._database.get(partitionName);

        return Array.from(partition.keys());

    }

    public async $save(partitionName: string, key: string, mime: string, buffer: Buffer): Promise<void> {

        if (this._database.has(partitionName) === false) {

            this._database.set(partitionName, new Map());

        }

        const partition: Map<string, StoreEntry> = this._database.get(partitionName);
        partition.set(key, { mime, buffer });


        this._debouncer.debounce(this._saveBackup, [this._database], 2500);

    }

    public async $load(partitionName: string, key: string): Promise<StoreEntry> {

        if (this._database.has(partitionName) === false) {

            this._database.set(partitionName, new Map());

        }

        const partition: Map<string, StoreEntry> = this._database.get(partitionName);
        if (partition.has(key) === false) throw new Error(`No Entry found for "${key}"`);

        return partition.get(key);

    }

    public add(overload: IForgeRoute | IForgeModel) : this {

        if (overload instanceof GenericRoute) {
            
            const iForgeServerRoute: IForgeRoute = overload as IForgeRoute;
            this._routeSet.add(iForgeServerRoute);
        
        } else if (overload instanceof ForgeModel) {

            const forgeStorage: IForgeModel = overload as IForgeModel;
            this._iForgeStorage = forgeStorage;
            this._iForgeStorage.connect(this);

        } else {

            throw new Error(`Unknown parameter added ${overload && overload.constructor}`);
            
        }
         
        return this;

    }

    public use(delegate: Function): void {
        
        this._app.use(delegate);

    }

}

/* private async _$parseRequestBody(request) {

return new Promise(function (resolve: Function, reject: Function) {

const buffers: Buffer[] = [];
request
    .on("data", (chunk: Buffer) => {

        buffers.push(chunk);

    })
    .on('end', () => {

        // at this point, `body` has the entire request body.
        const mime: string = request.get("Content-Type");
        const buffer: Buffer = Buffer.concat(buffers);
        resolve({ mime, buffer });

    });

})

} */