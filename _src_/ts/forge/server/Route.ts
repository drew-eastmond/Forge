const url = require("url");

import { IAction } from "../ForgeAction";

type Route = string;
type RequestDelegate = Function; //  ((params: { get: any, post: any, request: any }) => any) | ((req: Request, res: Response, next: Function) => any);

enum RequestMethod {
    Post,
    Get,
    All
}

export interface IForgeServerRoute {

    $install(express): Promise<void>;

    $resolve(request, response, next: Function): Promise<{ mime: string, buffer: Buffer }>;

}

export class AbstractRoute implements IForgeServerRoute {

    protected _route: Route;
    protected _method: RequestMethod = RequestMethod.All;
    protected _$delegate: RequestDelegate;

    constructor(route: Route, ...rest: unknown[]) {

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

                return { mime: "text/html", buffer: Buffer.from([]) };

            })
            .catch(function () {

                return { mime: "text/html", buffer: Buffer.from([]) };

            }) as unknown as { mime: string, buffer: Buffer };

    }

}