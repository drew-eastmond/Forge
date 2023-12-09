const path = require("path");
const url = require("url");
const mimeTypes = require("mime-types");

import { IAction } from "../../action/ForgeAction";
import { ForgeIO } from "../../io/ForgeIO";

type RequestDelegate = Function; //  ((params: { get: any, post: any, request: any }) => any) | ((req: Request, res: Response, next: Function) => any);
enum RequestMethod {
    Post,
    Get,
    All
}

export interface IForgeRoute {

    $install(express): Promise<void>;

    authorize(uri: string): boolean;

    $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }>;

}

export class RouteConfig {

    public request: string | RegExp;
    public method: RequestMethod;
    public race: number;

    public action: IAction;
    public remote: { url: string, get: Record<string, string | number>, post: Record<string, string | number> };
    public local: string;
    public $delegate: Function;

    constructor(configData: Record<string, unknown>) {
        
        const errors: Error[] = [];

        this.request = configData.reqeust as string | RegExp;
        
        const method: string = configData.method as string;
        switch (method.toLowerCase()) {

            case "post":
                this.method = RequestMethod.Post;
                break;

            case "get":
                this.method = RequestMethod.Get;
                break;

            case "all":
                this.method = RequestMethod.All;
                break;

            default:
                errors.push(Error(`invalid "method" property provided in RouteConfig`));

        }

        const race: number = configData.race as number;
        if (isNaN(race)) errors.push(new Error(`no "race" property provided in RouteConfig`));
        this.race = configData.race as number;
        
    }
    
}

class RouteResolver {

    private _value: string | RegExp;
    private _cache: { url, groups: Record<string, string> } | false;

    constructor(value: string | RegExp) {

        if (value === undefined) throw new Error(`undefined passed to ForgeRoute`);

        if (value instanceof RegExp) {

            this._value = value as RegExp;

        } else if (value.constructor === String) {

            const matches: RegExpMatchArray = value.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
            this._value = (matches) ? new RegExp(matches[2], matches[3]) : new RegExp(value);

        } else {

            throw new Error(`undefined passed to ForgeRoute`);

        }

    }

    public resolve(uri: string): boolean {

        this._cache = undefined;

        const urlParsed = url.parse(uri);

        switch (this._value.constructor) {

            case String:
                if (this._value == uri) {

                    
                    this._cache = { url, groups: {} };

                    return true;

                }
                break;

            case RegExp:
                const results: RegExpExecArray = (this._value as RegExp).exec(url);
                if (results) {

                    this._cache = { url, groups: results.groups || {} } 

                    return true;

                }
                break;
                
        }

        return false;

    }

}

export class GenericRoute implements IForgeRoute {

    public static Parse(configData: Record<string, unknown>): IForgeRoute {

        const routeConfig: RouteConfig = new RouteConfig(configData);

        if ("action" in configData) {

            return new ActionRoute(routeConfig);

        } else if ("local" in configData) {

            return new LocalRoute(routeConfig);

        } else if ("remote" in configData) {

            return new RemoteRoute(routeConfig);

        } else {

            throw new Error(`Cannot parse RouteConfig: ${JSON.stringify(configData)}`);

        }

    }

    protected _resolver: RouteResolver;
    protected _method: RequestMethod = RequestMethod.All;
    protected _$delegate: RequestDelegate;
    protected _race: number;

    constructor(config: RouteConfig, ...rest: unknown[]) {

        // validate the routeConfig

        this._resolver = new RouteResolver(config.resolver);
        this._race = config.race;
        this._method = config.method;

        if (config.$delegate instanceof Function) this._$delegate = config.$delegate;

    }

    public set $delegate($delegate: Function) {

        this._$delegate = $delegate;

    }

    protected async _$parseRequest(request): Promise<{ get: Record<string, unknown>, post: Record<string, unknown>, request: Record<string, unknown> }> {

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

        });

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

    public authorize(uri: string): boolean {

        return this._resolver.resolve(uri);
        
    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        return this._$delegate(request, response);

    }

}

export class ActionRoute extends GenericRoute {

    private _iAction: IAction;

    public action(iAction: IAction): this {

        this._iAction = iAction;

        return this;

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        // extract GET and POST params, then combine into `request` property
        return this._iAction.$route(request.url, this._$parseRequest(request));

    }

}

export class DelegateRoute extends GenericRoute {

    constructor(config: RouteConfig, $delegate: RequestDelegate, simplifyParams?: boolean) {

        super(config);

        if (simplifyParams === true) {

            this._$delegate = function (request, response, next: Function) {

                return $delegate(this._$parseRequest(request));

            }

        } else {

            this._$delegate = $delegate;

        }

    }

}

export class RemoteRoute extends GenericRoute {

    private _base: string;

    public base(base: string): this {

        this._base = base;

        return this;

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        const urlParsed = url.parse(request.url);
        const queryString: string = urlParsed.query;
        const filePath: string = this._base + urlParsed.path; // + queryString;

        const fetchResponse: Response = await ForgeIO.Web.$Fetch(filePath, {
            method: request.method,
            headers: {
                "Content-Type": request.get("Content-Type"),
                body: request.body,
            }
        });

        return { mime: fetchResponse.headers.get("Content-Type"), buffer: Buffer.from(fetchResponse.arrayBuffer()) };

    }

}

export class LocalRoute extends GenericRoute {

    private _base: string;

    public base (route: RouteConfig, base: string): this{

        this._base = base;

        return this;

    }

    public async $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }> {

        const urlParsed: URL = url.parse(request.url);
        const pathResolved: string = path.resolve(this._base, urlParsed);

        const buffer: Buffer = await ForgeIO.File.$Read(pathResolved);
        const mime: string = mimeTypes.lookup(pathResolved);

        return { mime, buffer };
    }

}



class ForgeRouter {

    protected _routes: Set<IForgeRoute> = new Set();

    public add(route: IForgeRoute): void {

        this._routes.add(route);

    }

    public async $resolve(request, response, next): Promise<{ mime: string, buffer: Buffer }> {

        for (const iForgeRoute of this._routes) {

            if (iForgeRoute.authorize(request.uri)) {

                return iForgeRoute.$resolve(request, response, next);

            }

        }

    }

}