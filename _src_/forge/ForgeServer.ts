const express = require("express");
const url = require("url");
const path = require("path");
const $fs = require("fs").promises;

import { $UsePromise, $Promise } from "../core/Core";
import { IAction } from "./action/AbstractAction";
import { Forge } from "./Forge";
import { ForgeTask } from "./ForgeTask";

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

interface IForgeServerRoute {

    $install(express): Promise<void>;

    $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }>;

}

export class AbstractRoute implements IForgeServerRoute {

    protected _route: Route;
    protected _method: RequestMethod = RequestMethod.All;
    protected _$delegate: RequestDelegate;

    constructor(route: Route,  ...rest: unknown[]) {

        this._route = route;

    }

    public method(method: RequestMethod): this {

        this._method = method;

        return this;

    }

    protected async _$parseRequest(request) {

        return new Promise(function (resolve: Function, reject: Function) {

            const buffers: Buffer[] = [];
            request
                .on("data", (chunk: Buffer) => {

                    buffers.push(chunk);

                })
                .on('end', () => {

                    // at this point, `body` has the entire request body stored in it as a string
                    const result: string = Buffer.concat(buffers).toString();

                    const post = JSON.parse(result);
                    const get = request.query;

                    resolve({ get, post, request: { post, ...get } });

                });

        })

    }

    public async $install(express): Promise<void> {

        switch (this._method) {
            case RequestMethod.Get:
                express.get(this._route, this._$delegate);
                break;
            case RequestMethod.Post:
                express.post(this._route, this._$delegate);
                break;
            case RequestMethod.All:
                express.all(this._route, this._$delegate);
                break;
        }

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        return;

    }

}

export class ActionRoute extends AbstractRoute {

    private _iAction: IAction;
    constructor(route: string, iAction: IAction) {

        super(route);

        this._iAction = iAction;
        this._$delegate = this.$resolve.bind(this);

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        // extract GET and POST params, then combine into `request` property
        return await this._iAction.$route(this._route, this._$parseRequest(request));

    }

}

export class DelegateRoute extends AbstractRoute {

    constructor(route: string, $delegate: RequestDelegate, simplifyParams?: boolean) {

        super(route);

        if (simplifyParams === true) {

            this._$delegate = function (request, response, next: Function) {

                return $delegate(this._$parseRequest(request));

            }

        } else {

            this._$delegate = $delegate;

        }

    }

}

export class RedirectRoute extends AbstractRoute {

    private _base: string;
    private _timeout: number;

    constructor(route: string, base: string, timeout?: number) {

        super(route);

        this._base = base;
        this._timeout = timeout;

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        const queryString: string = url.parse(request.url).query;
        const redirectURL: string = this._base + this._route + queryString;

        return fetch(redirectURL, {
            method: request.method,
            headers: {
                "Content-Type": request.get("Content-Type"),
                body: request.body,
            }
        })
            .then(function (response: Response) {

                return { mime: "text/html", buffer: new Buffer() };

            })
            .catch(function () {

                return { mime: "text/html", buffer: new Buffer() };

            }) as unknown as { mime: string, buffer: Buffer };

    }

}


type StoreEntry = { mime: string, buffer: Buffer };

export class ForgeServer {

    private _forge: Forge;

    private _app;

    private readonly _requestBodyParser: RequestBodyParser = new RequestBodyParser();

    private readonly _routeSet: Set<IForgeServerRoute> = new Set();


    // temporary for now. Connect to ether
    private readonly _database: Map<string, Map<string, { mime, buffer }>> = new Map();

    constructor(forge: Forge, port: number) {

        if (isNaN(port)) throw new Error("No valid port assigned");

        this._forge = forge;

        this._setupServer(port);

    }

    private _setupServer(port: number): void {

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
                response.setHeader("content-type", mime).end(buffer);

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
                    .setHeader("content-type", "application/json")
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
                .setHeader("content-type", mime)
                .end(buffer);

        }.bind(this));

        this._app.all("/", async function (request, response, next: Function) {

            $fs.readFile("./.src/.templates/html/index.html")
                .then(function (buffer: Buffer) {

                    response.setHeader("content-type", "text/html").end(buffer);

                })
                .catch(function (error: unknown) {

                    console.log("GOT HIM");
                    return "404";

                });

        });

        this._app.listen(port);

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

        console.log("save", this._database.keys());
        console.log("save", partition.keys());

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