const express = require("express");
const url = require("url");
const path = require("path");
const $fs = require("fs").promises;
const mimeTypes = require("mime-types");

import { $UsePromise, $Promise, TimeoutClear } from "../../core/Core";
import { IAction } from "../action/AbstractAction";
import { Forge } from "../Forge";
import { ForgeTask } from "../ForgeTask";
import { ActionRoute, DelegateRoute, IForgeServerRoute, RedirectRoute } from "./Route";

/*
*   
*   Private Members for current Module
*
*/

/*
* Enums
*/
enum RequestMethod {
    Post,
    Get,
    All
}

/*
* Types
*/
type Route = string;
type RequestDelegate = Function; //  ((params: { get: any, post: any, request: any }) => any) | ((req: Request, res: Response, next: Function) => any);



class RequestBodyParser {

    private _buffers: Buffer[];
    private _request;
    private _$buffer: $Promise<Buffer>;
    private _onData = function (data: Buffer): void {

        this._buffer.push(data);

    }.bind(this);

    private _onEnd = function (data: Buffer): void {

        this._request
            .off("data", this._onData)
            .off("end", this._onEnd);
        

        this._$buffer[1](Buffer.concat(this._buffers));

        this._buffers = undefined;
        this._request = undefined;

    }.bind(this);

    public $parse(request) {

        this._buffers = [];

        this._request = request;
        this._request
            .on("data", this._onData)
            .on("end", this._onEnd);

        this._$buffer = $UsePromise();

        return this._$buffer[0];

    }

}




type StoreEntry = { mime: string, buffer: Buffer };

export class ForgeServer {

    private _forge: Forge;

    private _app;

    private _saveTimeout: TimeoutClear;

    private readonly _requestBodyParser: RequestBodyParser = new RequestBodyParser();

    private readonly _routeSet: Set<IForgeServerRoute> = new Set();

    // temporary for now. Connect to `ether` or `ForgeStorage`
    private readonly _database: Map<string, Map<string, StoreEntry>> = new Map();

    constructor(forge: Forge, port: number, options?: { base ?: string, load ?: string }) {

        if (isNaN(port)) throw new Error("No valid port assigned");

        this._forge = forge;

        this._$setupServer(port);

    }

    private async _$setupServer(port: number): Promise<void> {

        this._app = express();

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
                const { mime, buffer } = await this._$parseRequestBody(request);
                await this.$save(`${taskName}/${actionName}`, key, mime, buffer);

                response
                    .sendStatus(200)
                    .end();

            } catch (error: unknown) {

                console.parse(`<red>${error.message}</red>`);
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

                console.parse(`<red>${error.message}</red>`);
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

                console.parse(`<red>${error.message}</red>`);
                response.sendStatus(404).end();

            }

        }.bind(this));

        this._app.all("/:task/:action/*", async function (request, response, next: Function) {

            const route: string = request.params[0];

            const taskName: string = request.params.task;
            const actionName: string = request.params.action;
            
            const file: string = request.params[0] || "index.html";
            const fileName: string = path.resolve(taskName, file);
            const query: any = request.query;

            const tasks = this._forge.tasks();

            const forgeTask: ForgeTask = tasks.get(taskName);
            if (forgeTask === undefined) {

                console.parse("<red>NO task</red>", taskName);
                response.sendStatus(404);
                next();

                return;

            }

            console.parse("<green>has task</green>", taskName);
            const iAction: IAction = forgeTask.actions().get(actionName);

            console.parse("<green>actions</green>\n\n", forgeTask.actions().keys());

            if (iAction === undefined) {

                response.sendStatus(404);
                next();

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

            console.log("Home items");

            const file: string = request.params[0] || "index.html";

            $fs.readFile(`./_src_/_templates_/html/${file}`)
                .then(function (buffer: Buffer) {

                    response.setHeader("Content-Type", mimeTypes.lookup(file)).end(buffer);

                })
                .catch(function (error: unknown) {

                    return "404";

                });

        });

        $fs.readFile("./backup.json")
            .then(function (buffer: Buffer) {

                const loadedData = JSON.parse(String(buffer));
                for (const [partitionName, partitionData] of Object.entries(loadedData)) {

                    const partition: Map<string, StoreEntry> = new Map();

                    for (const [key, { mime, buffer }] of Object.entries(partitionData)) {

                        partition.set(key, { mime, buffer: Buffer.from(buffer, "base64") });

                    }

                    this._database.set(partitionName, partition);

                }

            }.bind(this))
            .catch(function (error: unknown) {

                console.error(error);

            })
            .finally(function () {

                console.parse(`<green>Server start at ${port}</green>`);
                this._app.listen(port);

            }.bind(this));

        

    }

    private async _$parseRequestBody(request) {

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

        clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(function () {

            const saveObj = {};
            for (const [partitionName, partition] of this._database) {

                saveObj[partitionName] = {};

                for (const [key, { mime, buffer }] of partition) {

                    saveObj[partitionName][key] = { mime, buffer: buffer.toString("base64") };

                }

            }

            $fs.writeFile("./backup.json", JSON.stringify(saveObj));
            console.parse("<red>saved</red>")

        }.bind(this), 2500);

    }

    public async $load(partitionName: string, key: string): Promise<StoreEntry> {

        if (this._database.has(partitionName) === false) {

            this._database.set(partitionName, new Map());

        }

        const partition: Map<string, StoreEntry> = this._database.get(partitionName);
        if (partition.has(key) === false) throw new Error(`No Entry found for "${key}"`);

        return partition.get(key);

    }

    public add(overload: IForgeServerRoute) : this {

        switch (overload.constructor) {
            case ActionRoute:
            case RedirectRoute:
            case DelegateRoute:
                this._routeSet.add(overload);
                break;

        }

        return this;

    }

}

/* this._app.all("/", async function (request, response, next: Function) {

console.log("Home");

$fs.readFile("./_src_/_templates_/html/index.html")
.then(function (buffer: Buffer) {

    response.setHeader("Content-Type", "text/html").end(buffer);

})
.catch(function (error: unknown) {

    console.log("GOT HIM", error);
    return "404";

});

}); */