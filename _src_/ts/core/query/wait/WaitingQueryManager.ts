import { $Promise, $UsePromise, Attributes } from "../../core/Core";
import { ExpiryError } from "../../core/error/Error";
import { PoolManager } from "../../core/pool/PoolManager";
import { Expiry } from "../../core/time/Expiry";
import { TimerComposite } from "../../core/time/Timer";
import { AttributesQuery, IQuery, QueryManager } from "../QueryManager";

export type WaitConfirmation<T> = (networkModelComponent: T, attributes: Attributes, iQuery: IQuery, ...rest: unknown[]) => boolean;
type WaitFilter = (attributesA: Attributes, attributesB: Attributes) => boolean;

const __AllAttributes = {};

export interface IWaitingQuery<T = unknown> {

    root(): IQuery<T>;
    root(root?: IQuery<T>): IQuery<T>

    $async(): Promise<IQuery<T>>;

    expiry(expiry: Expiry): this;
    expiry(time: number): this;

    interval(interval: number): this;

    confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this;

    intersect(attributes: Attributes): IWaitingQuery<T>;
    or(attributes: Attributes): IWaitingQuery<T>;
    and(attributes: Attributes): IWaitingQuery<T>;
    not(attributes: Attributes): IWaitingQuery<T>;
    all(calback: WaitFilter): IWaitingQuery<T>;
    // $all(calback: Function, ...rest: unknown[]): Promise<IQuery<T>>;

}

export class WaitingQueryManager<T> implements IWaitingQuery<T> {

    private readonly _thenResolve = function (resolve: unknown) {

        this._$wait[1](this);

    }.bind(this);

    private readonly _catchReject = function (resolve: unknown) {

        this._$wait[2](this);

    }.bind(this);

    protected _root: IQuery<T>;
    protected _parent: { [Symbol.iterator](): IterableIterator<[T, Attributes]> };
    protected _filter: { callback: WaitFilter, attributes: Attributes };

    protected _$async: $Promise<IQuery<T>>;

    protected _expiry: Expiry;
    protected _timer: TimerComposite;

    protected _callback: WaitConfirmation<T>;
    protected _rest: unknown[];
    protected _queryManager: IQuery<[T, Attributes]>;

    public *[Symbol.iterator](): IterableIterator<[T, Attributes]> {

        if (this._filter.callback && this._filter.attributes) {

            for (const entry of this._parent) {

                const [component, attributes]: [T, Attributes] = entry;

                const resolvedAttributes: Attributes = (attributes instanceof Function) ? attributes() : attributes;

                if (this._filter.callback(this._filter.attributes, resolvedAttributes) === true) {

                    yield entry;

                } 

            }

        } else {

            for (const entry of this._parent) {

                yield entry;

            }

        }

    }

    protected _finally$Expired = function (): void {

        const filter: { callback: WaitFilter, attributes: Attributes } = this._filter;

        if (filter.callback === undefined && filter.attributes === undefined && this._confirmation === undefined) return;

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        let confirmed: boolean = false;
        for (const [component, componentAttributes] of this._parent) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (filter.callback !== undefined && filter.callback(filter.attributes, resolvedAttributes) === false) continue;

            if (this._confirmation === undefined || this._confirmation(component, resolvedAttributes, this, ...this._rest)) {

                confirmed = true;
                queryManager.add(component, componentAttributes);

            }

        }

        if (confirmed) {

            console.log("%cExpired CONFIRMED", "background: #f00");

            this._$async[1](queryManager);

        } else {

            console.log("%cExpired", "background: #f00");

            queryManager.reclaim();
            this._$async[2](new ExpiryError("expired"));
            
        }

        

    }.bind(this);

    protected readonly _onSynchronize = function (): void {

        const filter: { callback: WaitFilter, attributes: Attributes } = this._filter;

        // console.error("_onSynchronize", rest); //, filter.callback, filter.attributes, this._confirmation);

        if (filter.callback === undefined && filter.attributes === undefined && this._confirmation === undefined) return;

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        let confirmed: boolean = false;
        for (const [component, componentAttributes] of this._parent) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (filter.callback && filter.callback(filter.attributes, resolvedAttributes) === false) continue;

            if (this._confirmation === undefined || this._confirmation(component, resolvedAttributes, this, ...this._rest)) {

                confirmed = true;
                queryManager.add(component, componentAttributes);

            }

        }

        if (confirmed) {

            console.log("%cASYNCED CONFIRMED", "background: #f00", Date.now());
            console.log(filter);
            console.log("_confirmation", this._confirmation);
            console.log("");

            this._$async[1](queryManager);

        } else { 

            queryManager.reclaim();

        }

    }.bind(this);

    public root(root?: IQuery<T>): IQuery<T> {

        if (root !== undefined) {

            this._root = root;
            this._root.subscription().subscribe(root, this._onSynchronize);

        }

        return this._root;

    }

    public init(...rest: unknown[]): void;
    public init(parent: { [Symbol.iterator](): IterableIterator<[T, Attributes]> }, attributes?: Attributes, filter?: WaitFilter): void {

        this._parent = parent;

        this._filter = { callback : filter, attributes: attributes };

        this._$async = $UsePromise<IQuery<T>>();
        this._$async[0]
            .then(function (iQuery: IQuery<T>) {

                console.group("!!!")
                console.log("%c.then done complete results", "background: white; color: black;");
                console.log(iQuery);
                console.groupEnd();


            })
            .finally(function () {

                console.log("%c.then done complete results", "background: white; color: black;", Date.now());
                this._root.subscription().unsubscribe(this._root, this._onSynchronize);

                if (this._timer) {

                    this._timer.stop();

                }


            }.bind(this));

        this._onSynchronize();

    }

    public $async(): Promise<IQuery<T>> {

        return this._$async[0];

    }

    public expiry(expiry: Expiry): this;
    public expiry(time: number): this;
    public expiry(value: Expiry | number): this {

        if (this._expiry) {

            this._expiry.reclaim();

        }

        switch (value.constructor) {
            case Expiry:
                this._expiry = value as Expiry;
                break;
            case Number:
                this._expiry = Expiry.Delay(value as number);
                break;

        }

        this._expiry.use$()
            .finally$(this._finally$Expired);


        return this;

    }

    public interval(interval: number): this {

        if (this._timer) {

            this._timer.reclaim();

        }

        this._timer = PoolManager.Instantiate(TimerComposite, Date.now(), interval);
        this._timer.add(this._onSynchronize, 0);
        this._timer.start();

        return this;

    }

    public confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this {

        this._callback = callback;
        this._rest = rest;

        return this;

    }

    public intersect(attributes: Attributes): IWaitingQuery<T> {

        const iWaitingQuery: IWaitingQuery<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this, attributes, AttributesQuery.Intersect);

        iWaitingQuery.root(this._root);

        return iWaitingQuery;

    }

    public or(attributes: Attributes): IWaitingQuery<T> {

        const iWaitingQuery: IWaitingQuery<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this, attributes, AttributesQuery.Or);

        iWaitingQuery.root(this._root);

        return iWaitingQuery;

    }

    public and(attributes: Attributes): IWaitingQuery<T> {

        const iWaitingQuery: IWaitingQuery<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this, attributes, AttributesQuery.And);

        iWaitingQuery.root(this._root);

        return iWaitingQuery;

    }

    public not(attributes: Attributes): IWaitingQuery<T> {

        const iWaitingQuery: IWaitingQuery<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this, attributes, AttributesQuery.Not);

        iWaitingQuery.root(this._root);

        return iWaitingQuery;

    }

    public all(): IWaitingQuery<T>
    public all(callback: WaitFilter): IWaitingQuery<T>;
    public all(callback?: WaitFilter): IWaitingQuery<T> {

        const iWaitingQuery: IWaitingQuery<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this, __AllAttributes, callback || AttributesQuery.All);

        iWaitingQuery.root(this._root);

        return iWaitingQuery;

    }

    /* public async $all(callback: Function): Promise<IQuery<T>>;
    public async $all(callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
    public async $all(callback: Function, ...rest: unknown[]): Promise<IQuery<T>> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            if (await callback(component, componentAttributes) === true) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    } */

}

/* class OrQueryManager<T> extends WaitingQueryManager<T> {

    public attributes: Attributes;

    public add(component: T, attributes: Attributes): T {

        console.log("added", component, attributes(), this._componentMap);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (let [component, componentAttributes] of componentMap) {

            const resolveAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            console.error("%cchecking", "background: white;", component, resolveAttributes, this._componentMap);

            if (AttributesQuery.Or(this.attributes, resolveAttributes)) {

                if (this._confirmation) {

                    if (this._confirmation(component, attributes, this, this._rest)) this._$wait[1](this);

                } else {

                    this._$wait[1](this);

                }

            }

        }

        const resolveAttributes: Attributes = (attributes instanceof Function) ? attributes() : attributes;
        if (AttributesQuery.Or(this.attributes, resolveAttributes)) {

            console.error("%added", "background: white;", component, resolveAttributes, this._componentMap);

            super.add(component, attributes);

            if (this._confirmation) {

                if (this._confirmation(component, attributes, this, this._rest)) this._$wait[1](this);

            } else {

                this._$wait[1](this);

            }

        }

        return component;

    }

} */