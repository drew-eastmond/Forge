import { Attributes } from "../core/Core";
import { IPoolable, PoolManager } from "../core/pool/PoolManager";
import { ISubscription, Subscription } from "../core/subscription/Subscription";
import { IWaitingQuery, WaitingQueryManager } from "./wait/WaitingQueryManager"

export class AttributesQuery {

    public static Intersect(objectA: Attributes, objectB: Attributes): boolean {

        const entries: [string, any][] = Object.entries(objectA);
        for (const [key, value] of entries) {

            if (value instanceof Object) {

                if (AttributesQuery.Intersect(value, objectB[key]) === false) {

                    return false;

                }

            } else if (value != objectB[key]) {

                return false;

            }

        }

        // `objectA` passed the intersetion test
        return true;

    }

    public static And(objectA: Attributes, objectB: Attributes): boolean {

        const entriesA: [string, any][] = Object.entries(objectA);
        for (const [key, value] of entriesA) {

            if (value instanceof Object) {

                if (AttributesQuery.And(value, objectB[key]) === false) {

                    return false;

                }

            } else if (value != objectB[key]) {

                return false;

            }

        }

        // now do the attributesB, both attributes must match recursively
        const entriesB: any = Object.entries(objectB);
        for (const [key, value] of entriesB) {

            if (value instanceof Object) {

                if (AttributesQuery.And(value, objectA[key]) === false) {

                    return false;

                }

            } else if (value != objectA[key]) {

                return false;

            }

        }

        // ! `objectA` and `objectA` have all the same attributes
        return true;

    }

    public static Or(objectA: Attributes, objectB: Attributes): boolean {

        const entriesA: [string, unknown][] = Object.entries(objectA);
        for (const [key, value] of entriesA) {

            if (value instanceof Object) {

                if (AttributesQuery.Or(value, objectB[key]) === true) {

                    return true;

                }

            } else if (value == objectB[key]) {

                return true;

            }

        }

        // pass the intersetion test. Both Attributes 
        return false;

    }

    public static Not(objectA: Attributes, objectB: Attributes): boolean {

        const entriesA: any = Object.entries(objectA);

        for (const [key, value] of entriesA) {

            if (value instanceof Object) {

                if (AttributesQuery.Not(value, objectB[key]) === false) {

                    return false;

                }

            } else if (value == objectB[key]) {

                return false;

            }

        }

        // `objectA` and `objectA` have all the same attributes
        return false;

    }

    public static All(objectA: Attributes, objectB: Attributes): boolean {

        return true;

    }

    public static Composite(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean {

        const entriesA: any = Object.entries(objectA);

        for (const [key, value] of entriesA) {

            if (value instanceof Object) {

                if (AttributesQuery.Composite(value, objectB[key]) === false) {

                    return false;

                }

            } else if (value == objectB[key]) {

                return true;

            } else if (value instanceof Function) {

                return value(key, objectB[key], ...rest);

            } else if (value instanceof RegExp) {

                return value.test(objectB);

            }

        }

        // `objectA` and `objectA` have all the same attributes
        return false;

    }

    public static Custom(objectA: Attributes, objectB: Attributes): boolean {

        const entriesA: [string, any][] = Object.entries(objectA);
        for (const [key, value] of entriesA) {

            if (value instanceof Object) {

                if (AttributesQuery.And(value, objectB[key]) === false) {

                    return false;

                }

            } else if (value != objectB[key]) {

                return false;

            }

        }

        // now do the attributesB, both attributes must match recursively
        const entriesB: any = Object.entries(objectB);
        for (const [key, value] of entriesB) {

            if (key instanceof Object) {

                if (AttributesQuery.And(value, objectA[key]) === false) {

                    return false;

                }

            } else if (value != objectA[key]) {

                return false;

            }

        }

    }

}

export type QueryCallback<T = unknown> = (component: T, attributes: Attributes, ...rest: unknown[]) => boolean;

export interface IQuery<T = unknown> extends IPoolable {

    [Symbol.iterator](): IterableIterator<[T, Attributes]>;

    size(): number;
    entries(): Map<T, Attributes>;
    
    last(): T;
    first(): T;
    get(start: Number, end?: Number): T | T[];
    
    has(callback: Function, ...rest: unknown[]): boolean;
    add(component: T, attribute: Attributes): T;
    remove(component: T): T;
    clear(): void;
    attributes(component: T): Attributes;
    merge(queryManager: QueryManager<T>): void;

    intersect(attributes: Attributes): IQuery<T>;
    or(attributes: Attributes): IQuery<T>;
    and(attributes: Attributes): IQuery<T>;
    not(attributes: Attributes): IQuery<T>;
    group(attributes: Attributes): Map<string, IQuery<T>>;
    all(calback: Function, ...rest: unknown[]): IQuery<T>;
    $all(calback: Function, ...rest: unknown[]): Promise<IQuery<T>>;

    wait(): IWaitingQuery<T>;

    subscription(): ISubscription;
     
    // $export(networkDataPackage: NetworkDataPackage): void;

}

export class QueryManager<T = unknown> implements IQuery<T> {

    protected _componentMap: Map<T, Attributes> = new Map();
    protected readonly _subscription: Subscription = PoolManager.Instantiate(Subscription);

        /*
         * IPoolable implementation
         */

    public subscription(): ISubscription {

        return this._subscription;

    }

    public init(): void {

        this._subscription.clear();

        this._componentMap.clear();

    }

    public reclaim(): void{

        this._subscription.clear();

        this._componentMap.clear();

        PoolManager.Reclaim(this);

    }

        /*
         * IQuery implementation
         */

    public *[Symbol.iterator] (): IterableIterator<[T,Attributes]> {

        for (const entry of this._componentMap) {

            yield entry;

        }

    }

    size(): number {

        return this._componentMap.size;

    }

    entries(): Map<T, Attributes> {

        return this._componentMap;

    }


    public last(): T {

        const componentArr: T[] = Array.from(this._componentMap.keys());
        return componentArr.pop();

    }

    public first(): T {

        const componentArr: T[] = Array.from(this._componentMap.keys());
        return componentArr.pop();

    }

    public get(start: number, end?: number): T | T[] {

        const componentArr: T[] = Array.from(this._componentMap.keys());
        return (end === undefined) ? componentArr[start] : componentArr.slice(start, end);

    }

    public has(callback: Function, ...rest: unknown[]): boolean {

        const componentMap = this._componentMap;
        for (const [component, attributes] of componentMap) {

            if (callback(component, attributes, ...rest) === false) {
                return false;
            }

        }

        return true;

    }

    public add(component: T, attributes: Attributes): T {

        this._componentMap.set(component, attributes);

        this._subscription.notify(this, component, attributes);

        return component;

    }

    public remove(component: T): T {

        this._componentMap.delete(component);

        this._subscription.notify(this, component);

        return component;

    }

    public clear(): void {

        this._componentMap.clear();

    }

    public attributes(component: T): Attributes {

        return this._componentMap.get(component);

    }

    public merge(queryManager: QueryManager<T>): void {

        for (const [component, attributes] of queryManager) {

            this._componentMap.set(component, attributes);

        }

        this._subscription.notify(this);

    }

    public intersect(attributes: Attributes): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (AttributesQuery.Intersect(attributes, resolvedAttributes)) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public or(attributes: Attributes): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (AttributesQuery.Or(attributes, resolvedAttributes)) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public and(attributes: Attributes): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (AttributesQuery.And(attributes, resolvedAttributes)) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public not(attributes: Attributes): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (AttributesQuery.Not(attributes, resolvedAttributes)) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public composite(attributes: Attributes): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (AttributesQuery.Composite(attributes, resolvedAttributes)) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public all(): IQuery<T>
    public all(callback: Function): IQuery<T>;
    public all(callback: Function, ...rest: unknown[]): IQuery<T>;
    public all(callback?: Function, ...rest: unknown[]): IQuery<T> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        if (callback === undefined) {

            for (const [component, attributes] of this._componentMap) {

                queryManager.add(component, attributes);

            }

        } else {

            const componentMap: Map<T, Attributes> = this._componentMap;
            for (const [component, componentAttributes] of componentMap) {

                const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

                if (callback(component, resolvedAttributes) === true) {

                    queryManager.add(component, componentAttributes);

                }

            }

        }

        return queryManager;

    }

    public async $all(callback: Function): Promise<IQuery<T>>;
    public async $all(callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
    public async $all(callback: QueryCallback, ...rest: unknown[]): Promise<IQuery<T>> {

        const queryManager: QueryManager<T> = PoolManager.Instantiate(QueryManager<T>);

        const componentMap: Map<T, Attributes> = this._componentMap;
        for (const [component, componentAttributes] of componentMap) {

            const resolvedAttributes: Attributes = (componentAttributes instanceof Function) ? componentAttributes() : componentAttributes;

            if (await callback(component, resolvedAttributes) === true) {

                queryManager.add(component, componentAttributes);

            }

        }

        return queryManager;

    }

    public wait(): IWaitingQuery<T> {

        const waitQueryManager: WaitingQueryManager<T> = PoolManager.Instantiate(WaitingQueryManager<T>, this);

        waitQueryManager.root(this);

        return waitQueryManager;

    }

    public group(key: string): Map<string, IQuery<T>> {

        const groupMap: Map<string, IQuery<T>> = new Map();

        for (const [component, attributes] of this._componentMap) {

            const groupKey: string = attributes[key];

            if (attributes[key] !== undefined) {

                if (groupMap.has(groupKey) === false) {

                    groupMap.set(groupKey, PoolManager.Instantiate(QueryManager<T>));

                }

                const queryMap = groupMap.get(groupKey);
                queryMap.add(component, attributes);

            }

        }

        return groupMap;

    }

    public transform(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => [T, Attributes], ...rest: unknown[]): IQuery<T> {

        // we need to copy a Array from the `this._componentMap` because this function is mutable.
        const entries: [T, Attributes][] = Array.from(this._componentMap);
        for (const [component, attributes] of entries) {

            // resolve the attributes and transform the compoennt and newly resolved attributes.
            const resolvedAttributes: Attributes = (attributes instanceof Function) ? attributes() : attributes;
            const [transformedComponent, transformedAttributes]: [T, Attributes] = callback(component, resolvedAttributes, ...rest);

            // delete the old entry just in case the new tranformed entry is new.
            this._componentMap.delete(component);
            this._componentMap.set(transformedComponent, transformedAttributes);

        }

        return this;

    }

}