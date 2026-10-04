

// @ts-nocheck

declare module "@onyx-ignition/forge" {

	/**
	 * Levels of Verbosity when outputting to logs
	 * @readonly
	 * @enum {string}
	 */
	export enum Verbosity {
	    all = "all",
	    log = "log",
	    warn = "warn",
	    error = "error",
	    silent = "silent"
	}
	/**
	 * Enviroment variables
	 */
	export const EnviromentVariables: {
	    DRY_RUN: boolean;
	    VERBOSITY: Verbosity;
	    RACE: number;
	};
	
	
	export class Accessor {
	    static Fetch(accessor: string[], attributes: Attributes): unknown;
	    static Mount(accessor: string[], attributes: Attributes): Attributes | undefined;
	    static Mount(accessor: string[], attributes: Attributes, options: {
	        root?: Attributes;
	        implode?: ImplodeAttributesOptions;
	    }): Attributes | undefined;
	    private _source;
	    private _entries;
	    constructor(source: Attributes);
	    /**
	     * Iterates via Object.entries(...) on the internal _args property
	     *
	     * @generator
	     * @yields {[string, unknown]}
	     */
	    [Symbol.iterator](): Iterator<{
	        access: string;
	        value: unknown;
	    }>;
	    has(accessor: string[]): boolean;
	    intersect(intersect: unknown, source: unknown): Attributes;
	    fetch(accessor: string[]): unknown;
	    parse(query: string, seperator: string): unknown;
	    inject(input: string, regExp: RegExp, options?: {
	        splitter?: RegExp;
	        delegate?: (match: string, access: string) => string;
	    }): string;
	}
	
	global {
	    interface Console {
	        forge(context: Partial<ForgeConsoleContextType>): void;
	        parse(...rest: unknown[]): void;
	        red(...rest: unknown[]): void;
	        green(...rest: unknown[]): void;
	        yellow(...rest: unknown[]): void;
	        blue(...rest: unknown[]): void;
	        magenta(...rest: unknown[]): void;
	        cyan(...rest: unknown[]): void;
	        white(...rest: unknown[]): void;
	        black(...rest: unknown[]): void;
	        move(x: number, y: number): string;
	    }
	}
	export enum DebugForeground {
	    Black = "\u001B[30m",
	    Red = "\u001B[31m",
	    Green = "\u001B[32m",
	    Yellow = "\u001B[33m",
	    Blue = "\u001B[34m",
	    Magenta = "\u001B[35m",
	    Cyan = "\u001B[36m",
	    White = "\u001B[37m",
	    Bright = "\u001B[1m",
	    Dim = "\u001B[2m",
	    Underscore = "\u001B[4m",
	    Blink = "\u001B[5m",
	    Reverse = "\u001B[7m",
	    Hidden = "\u001B[8m",
	    BrightBlack = "\u001B[30m;1m",
	    BrightRed = "\u001B[31m;1m",
	    BrightGreen = "\u001B[32m;1m",
	    BrightYellow = "\u001B[33m;1m",
	    BrightBlue = "\u001B[34m;1m",
	    BrightMagenta = "\u001B[35m;1m",
	    BrightCyan = "\u001B[36m;1m",
	    BrightWhite = "\u001B[37m;1m"
	}
	export enum DebugBackground {
	    Black = "\u001B[40m",
	    Red = "\u001B[41m",
	    Green = "\u001B[42m",
	    Yellow = "\u001B[43m",
	    Blue = "\u001B[44m",
	    Magenta = "\u001B[45m",
	    Cyan = "\u001B[46m",
	    White = "\u001B[47m",
	    Grey = "\u001B[40m",
	    BrightBlack = "\u001B[40;1m",
	    BrightRed = "\u001B[41;1m",
	    BrightGreen = "\u001B[42;1m",
	    BrightYellow = "\u001B[43;1m",
	    BrightBlue = "\u001B[44;1m",
	    BrightMagenta = "\u001B[45;1m",
	    BrightCyan = "\u001B[46;1m",
	    BrightWhite = "\u001B[47;1m"
	}
	export const ColourFormattingReset: string;
	type ForgeConsoleContextType = {
	    reset: string;
	    foreground: string;
	};
	class ColourFormatting<T> {
	    private _debugFormatter;
	    private stack;
	    private _defaultColour;
	    constructor(debugFormatter: DebugFormatter);
	    constructor(debugFormatter: DebugFormatter, defaultColour: string);
	    size(): number;
	    current(): string | T;
	    clear(): void;
	    push(value: T | "\u001b[0m"): DebugFormatter;
	    pop(): DebugFormatter;
	}
	export class DebugFormatter {
	    static Init(options: {
	        platform: "node" | "browser";
	        "default"?: {
	            "foreground"?: string;
	            background?: string;
	        };
	    }): void;
	    foreground: ColourFormatting<DebugForeground>;
	    fg: ColourFormatting<DebugForeground>;
	    background: ColourFormatting<DebugBackground>;
	    bg: ColourFormatting<DebugBackground>;
	    resetFormatting: string;
	    stream: string;
	    constructor();
	    clear(): this;
	    write(value: string): this;
	    reset(): this;
	    parse(input: string): this;
	}
	
	
	
	/** A nested hash to store values */
	export type Attributes = {
	    [name: string | symbol | number]: unknown | Attributes;
	};
	export type AttributeFragment = {
	    accessor: string[];
	    value: unknown;
	};
	export type IntervalClear = ReturnType<typeof setInterval>;
	export type TimeoutClear = ReturnType<typeof setTimeout>;
	export type SerializeData = undefined | string | number | boolean | ArrayBuffer | (string | boolean | ArrayBuffer)[];
	export type Serialize = {
	    [name: string]: SerializeData | Serialize | Serialize[];
	};
	export type $Serialize = Promise<Serialize>;
	export type Capture<T = unknown> = boolean | string | Error | ((error: unknown) => unknown) | Promise<T> | undefined;
	export type ImplodeAttributesOptions = "last" | "first" | "collect";
	export const EmptyAttributes: Attributes;
	export const EmptyData: ArrayBuffer;
	export function GetRange(start: number, end: number): number;
	export function IsObject(item: unknown): boolean;
	export function CatchThrowError(error: unknown): unknown;
	export function CatchCapture<T = unknown>(capture: Capture): (error: unknown) => T;
	export function EmptyFunction(): void;
	export function EncodeBase64(json: Record<string, unknown>): string;
	export function DecodeBase64(value: string): any;
	export function TokenizeAttributes(attributes: Attributes): string;
	export function TokenizeAttributeFragments(attributes: Attributes): string[];
	export function MountAttributes(attributes: Attributes[], mounts: Attributes[]): Attributes[];
	export function CollateAttributes<T = Attributes>(sources: Attributes[], grouping: Attributes[]): T[];
	export function CollateAttributes<T = Attributes>(sources: Attributes[], grouping: Attributes[], mounts: Attributes[]): T[];
	export function ExplodeAttributes(entries: Attributes): AttributeFragment[];
	/**
	 * Finds the nested intersection between the _intersect_ parameter and _source_ parameter.
	 *
	 * If no interection exists. An empty object will be returned
	 * @param {Attributes} intersect Attribute value that will be used to test the intersection
	 * @param {Attributes} source Attribute value use for the source of the operation
	 * @returns {Attributes} Attribute value that is the result of the intersection
	 */
	export function IntersectAttributes(intersect: Attributes, source: Attributes): Attributes;
	/**
	 *
	 * Combines multiple nested objects where each source is first intersected, then overlapping key:values are resolved using the _{ implode }_ options
	 *
	 * For example _[{ value: "forge" }, { value: 777 }, { enabled: true }]_ will become:
	 * * **ImplodeAttributesOptions.collect** : { value: ["forge", 777 ], enabled: true }
	 * * **ImplodeAttributesOptions.first** : { value: "forge", enabled: true }
	 * * **ImplodeAttributesOptions.last** : { value: 777, enabled: true }
	 * @param {Object} sources An array of attributes to merge togther
	 * @param {Object} [options] Optional parameters for "squashing" and mount the result
	 * @param {Attributes} [options.intersect="last"] Optional intersection for "squashing" all components
	 * @param {ImplodeAttributesOptions} [options.implode] - Optional enum for resolving overlapping pairs during "squashing" all components
	 *
	 * @returns { Attributes } the results of the **squash** operation
	 *
	 */
	export function SquashAttributes(sources: Attributes[]): Attributes;
	export function SquashAttributes(sources: Attributes[], options: {
	    intersect?: Attributes;
	    implode?: ImplodeAttributesOptions;
	}): Attributes;
	/**
	 * Convenience function Combines all object using the `...` spread operator
	 * @param {Attributes} sources An array of attributes sources
	 * @returns {Attributes} the results of the **collapse** operation
	 */
	export function CollapseAttributes(sources: Attributes[]): Attributes;
	/**
	 * Appends a `AttributeFragment` to the input by using ancestry as a template
	 *
	 * For example _[ "forge", "child", "grand-child" ]_, will become:
	 * { forge: { child: { "grand-child": <value param> } }
	 * { forge: { child: 1337 } }
	 *
	 * * **ImplodeAttributesOptions.collect** : { forge: { child: [ 1337, { "grand-child": value } ] }
	 * * **ImplodeAttributesOptions.first** : { forge: { child: 1337 }
	 * * **ImplodeAttributesOptions.last** : { forge: { child: { "grand-child": value } }
	 * @param {string[]} ancestry an array of strings to build ancestry for a AttributeFragment
	 * @param {unknown} value the value to set the end node
	 * @param {Attributes} input the source to append the _AttributeFragment_ onto
	 * @param {object} [options] _Optional_ object for defing implosion and cloning
	 * @param {ImplodeAttributesOptions} [options.implode="last"] _"collect" | "first" | "last"_ : algorithm for resolving collisions
	 * @param {boolean} [options.clone=false] if the input is cloned as the source
	 * @returns {Attributes} returns Attribute with the new
	 */
	export function ImplodeAttributes(ancestry: string[], value: unknown, input: Attributes): Attributes;
	export function ImplodeAttributes(ancestry: string[], value: unknown, input: Attributes, options: {
	    implode?: ImplodeAttributesOptions;
	    clone?: boolean;
	}): Attributes;
	export function TransformAttributes(attributes: Attributes, callback: (fragment: AttributeFragment) => unknown): Attributes;
	export function QuickHash(): string;
	export function QuickHash(options: {
	    join?: string;
	    repeat?: number;
	    range?: [number, number];
	}): string;
	export type $Promise<Resolve = unknown, Reject = unknown> = [Promise<Resolve>, Function | ((resolve?: Resolve) => unknown), Function | ((resolve?: Reject) => unknown)];
	export function $UsePromise<Resolve = unknown, Reject = unknown>(): $Promise<Resolve, Reject>;
	export function $UsePromise<Resolve = unknown, Reject = unknown>(options: {
	    capture: Capture;
	}): $Promise<Resolve, Reject>;
	export function $RacePromise<T = unknown>($promise: Promise<T>, race: number): Promise<T>;
	export function $RacePromise<T = unknown>($promise: Promise<T>, race: number, capture: Capture): Promise<T>;
	export function $UseRace<Resolve = unknown, Reject = unknown>(race: number): $Promise<Resolve, Reject>;
	export function $UseRace<Resolve = unknown, Reject = unknown>(race: number, options: {
	    capture: Capture;
	}): $Promise<Resolve, Reject>;
	/**
	 *
	 * @template S, T
	 * @param {number} race timeoutin milliseconds before resolving or rejecting the return Promise<S | T>
	 * @param {object} [options] an object that decide if the wait operation will resolve or reject
	 * @param {object} [options.reject] an object that decide if the wait operation will resolve or reject
	 * @param {object} [options.resolve] an object that decide if the wait operation will resolve or reject
	 * @returns {Promise<S | T>}
	 */
	export function $Wait<S, T>(race: number, options?: {
	    reject?: T;
	    resolve?: S;
	}): Promise<S | T>;
	export function EscapeHTML(value: string): string;
	export function Capitalize(value: string): string;
	
	
	export interface ICollection<T = unknown, U = unknown> {
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    get size(): number;
	    get sources(): T[];
	    get entries(): [T, Attributes][];
	    attributes(source: T): Attributes | undefined;
	    add(source: T, attributes: Attributes): U;
	    remove(source: T): U;
	    clear(): void;
	    find(callback: (source: T, attributes: Attributes) => boolean): T[];
	    get(index: number): T | undefined;
	    index(source: T): number;
	    exchange(source: T): U;
	    clone(): ICollection<T>;
	}
	export interface ICollectionIterator<T> {
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	}
	export interface IAsyncCollection<T = unknown> {
	    [Symbol.asyncIterator](): AsyncIterableIterator<[T, Attributes]>;
	}
	export class MapCollection<T = unknown> implements ICollection<T, T> {
	    private readonly _map;
	    constructor();
	    constructor(map: Map<T, Attributes>);
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    get size(): number;
	    get sources(): T[];
	    get entries(): [T, Attributes][];
	    attributes(source: T): Attributes | undefined;
	    get(index: number): T | undefined;
	    index(source: T): number;
	    find(delegate: (source: T, attributes: Attributes) => boolean): T[];
	    add(source: T, attributes: Attributes): T;
	    remove(source: T): T;
	    exchange(source: T): T;
	    clear(): void;
	    clone(): ICollection<T>;
	}
	export class ArrayCollection<T = unknown> implements ICollection<T, T> {
	    private readonly _array;
	    constructor();
	    constructor(array: [T, Attributes][]);
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    get size(): number;
	    get sources(): T[];
	    get entries(): [T, Attributes][];
	    attributes(source: T): Attributes;
	    get(index: number): T;
	    index(source: T): number;
	    find(delegate: (source: T, attributes: Attributes) => boolean): T[];
	    add(source: T, attributes: Attributes): T;
	    remove(source: T): T;
	    exchange(source: T): T;
	    clear(): void;
	    clone(): ICollection<T>;
	}
	
	export const Reactivity: unique symbol;
	export const HaltReactivity: unique symbol;
	export type ReactiveDelegate<T> = (value: T, previous?: T) => unknown;
	export interface IReactor<I, O = I> {
	    [Symbol.asyncIterator](): AsyncIterableIterator<O>;
	    abort(): void;
	    setter(value: I): O;
	    $setter(value: I): Promise<O>;
	    getter(): O;
	    subscribe(delegate: ReactiveDelegate<O>): unknown;
	    unsubscribe(delegate: ReactiveDelegate<O>): unknown;
	    finally?(delegate: (iReactor: this, state: O) => unknown): unknown;
	    clear(): void;
	    frame(): unknown;
	    frame(...rest: unknown[]): unknown;
	    flush(): unknown;
	    flush(...rest: unknown[]): unknown;
	}
	export type ReactorTransform<S, T> = {
	    getter?: (state: S | undefined) => T;
	    setter?: (newState: S, oldState: S | undefined) => S;
	};
	export class Reactor<S, T = S> implements IReactor<S, T> {
	    protected _state: S | undefined;
	    protected _setter: ((state: S, previous: S | undefined) => S) | undefined;
	    protected _getter: ((state: S | undefined) => T) | undefined;
	    protected readonly _delegates: Set<ReactiveDelegate<T>>;
	    protected _abortController: AbortController | undefined;
	    protected _signal: AbortSignal | undefined;
	    constructor();
	    constructor(state: S);
	    constructor(state: S, transform: ReactorTransform<S, T>);
	    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
	    [Symbol.dispose](): void;
	    protected _transformSet(state: S, previous: S | undefined): S;
	    protected _transformGet(state: S | undefined): T;
	    protected _equals(state: S, previous: S | undefined): boolean;
	    getter(): T;
	    setter(value: S): T;
	    /**
	     * Update the current state and returns
	     */
	    $setter(value: S): Promise<T>;
	    subscribe(delegate: ReactiveDelegate<T>): this;
	    unsubscribe(delegate: ReactiveDelegate<T>): this;
	    once(delegate: ReactiveDelegate<T>): this;
	    clear(): void;
	    frame(): void;
	    flush(): void;
	    abort(): void;
	}
	export function reactive<T = unknown>(value: T & {
	    [Reactivity]: unknown;
	}): IReactor<T>;
	
	
	
	
	export class QueryManagerReactor<T> extends Reactor<[T, Attributes][]> {
	    private _query;
	    constructor(query: IQuery<T>);
	}
	
	
	
	/**
	 * Allows you to sequence _AttributeQuery_ operations for complex querying
	 * @class
	 */
	export class QuerySequence {
	    /**
	     * Helper to queue a **And** operation and return a QuerySequence instance to chain more operations
	     * @param {Attributes} attributes Attrbutes passed to **And** operation
	     * @returns {QuerySequence}
	     */
	    static And(attributes: Attributes): QuerySequence;
	    /**
	     * Helper to queue a **Or** operation and return a QuerySequence instance to chain more operations
	     * @param {Attributes} attributes Attrbutes passed to **Or** operation
	     * @returns {QuerySequence}
	     */
	    static Or(attributes: Attributes): QuerySequence;
	    /**
	     * Helper to queue a **Not** operation and return a QuerySequence instance to chain more operations
	     * @param {Attributes} attributes Attrbutes passed to **Not** operation
	     * @returns {QuerySequence}
	     */
	    static Not(attributes: Attributes): QuerySequence;
	    /**
	     * Helper to queue a **Filter** operation and return a QuerySequence instance to chain more operations
	     * @param {QueryDelegate} delegate
	     * @param {Attributes} attributes Attrbutes passed to **Not** operation
	     * @param {unknown[]} [rest]
	     * @returns {QuerySequence}
	     */
	    static Filter(delegate: QueryDelegate): QuerySequence;
	    static Filter(delegate: QueryDelegate, attributes: Attributes): QuerySequence;
	    static Filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): QuerySequence;
	    static Composite(attributes: Attributes, ...rest: unknown[]): QuerySequence;
	    static Greater(attributes: Attributes): QuerySequence;
	    static Less(attributes: Attributes): QuerySequence;
	    static Traverse(attributes: Attributes): QuerySequence;
	    private _sequence;
	    constructor(iterable?: Iterable<[QueryDelegate, Attributes] | [QueryDelegate, Attributes, unknown[]]>);
	    /**
	     * Add an **And** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **And** operation
	     * @returns {this}
	     */
	    and(attributes: Attributes): this;
	    /**
	     * Add an **Or** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **Or** operation
	     * @returns {this}
	     */
	    or(attributes: Attributes): this;
	    /**
	     * Add an **Not** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **Not** operation
	     * @returns {this}
	     */
	    not(attributes: Attributes): this;
	    /**
	     * Add an _delegate_, _attributes_, and ...rest parameters to the sequence
	     * @param {QueryDelegate} delegate A custom callback to match each attributes
	     * @param {Attributes} [attributes] Attributes used for the _delegate_ operation
	     * @param {unknown[]} [rest] Rest parameters for _delegate_
	     * @returns {this}
	     */
	    filter(delegate: QueryDelegate): this;
	    filter(delegate: QueryDelegate, attributes: Attributes): this;
	    filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): this;
	    /**
	     * Add an **Composite** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **Composite** operation
	     * @param {unknown[]} [rest] Rest parameters for _Composite_ operation
	     * @returns {this}
	     */
	    composite(attributes: Attributes): this;
	    composite(attributes: Attributes, ...rest: unknown[]): this;
	    /**
	     * Add an **Greater** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **Greater** operation
	     * @returns {this}
	     */
	    greater(attributes: Attributes): this;
	    /**
	     * Add an **Less** operation and _attributes_ to the sequence
	     * @param {Attributes} attributes Attributes used for the **Less** operation
	     * @returns {this}
	     */
	    less(attributes: Attributes): this;
	    /**
	     * Performs the sequence on the _query_ parameter that should implements _IQuery_
	     * @template [T=unknown]
	     * @param {IQuery<T>} query An interface that implements the IQuery
	     * @returns {IQuery<T>}
	     */
	    query<T>(query: IQuery<T>): IQuery<T>;
	    /**
	     * Performs the sequence of operation on the _attributes_ parameter and return a boolean if all operation match
	     * @param {Attributes} attributes Attributes to perform the sequence of operations on
	     * @returns {boolean}
	     */
	    match(attributes: Attributes): boolean;
	    /**
	     * Return a user readable representation of the sequence
	     * @returns {string}
	     */
	    toString(): string;
	}
	
	
	
	
	
	
	/**
	 * An symbol to used to mark to a key/value should be present when proforming a query.
	 */
	export const Intersects: Symbol;
	/**
	 * Generic **type** signature for **synchronous** delegates used by _QueryManager_
	 * @param {Attributes} objectA Attributes used for the query operation
	 * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	 * @param {unknown[]} rest extra parameters passed
	 * @returns {boolean}
	 */
	export type QueryDelegate = (objectA: Attributes, objectB: Attributes, ...rest: unknown[]) => boolean;
	/**
	 * Generic **type** signature for **asynchronous** delegates used by _QueryManager_
	 * @param {Attributes} objectA Attributes used for the query operation
	 * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	 * @param {unknown[]} rest extra parameters passed
	 * @returns {boolean}
	 */
	export type $QueryDelegate = (objectA: Attributes, objectB: Attributes, ...rest: unknown[]) => Promise<boolean>;
	/**
	 * Generic **type** for a callback to confirm a entity exists within the current _QueryManager_ instance
	 * @template [T=unknown]
	 * @param {IQuery<T>} query Attributes used for the query operation
	 * @returns {boolean | Promise<boolean>}
	 */
	export type $WaitQueryDelegate<T> = (query: IQuery<T>) => boolean | Promise<boolean>;
	/**
	 * Static class to Group all built-in query operations. Here's a summary of all supported operations:
	 * * And: All nested key/value pairs should match
	 * * Or: Any nested key/value pairs should match
	 * * Not: No nested key/value pairs should match
	 * * All: All value match and will be return
	 * * Composite: A special query that will use values as dispatcher. Function as callbacks, RegExp to match, values must match
	 * * Greater: Tries a "greater then" operation on both values
	 * * Less: Tries a "greater then" operation on both values
	 * * Traverse: Does both parameters match at least one matching hierarchy key/values
	 * @class
	 */
	export class AttributesQuery {
	    /**
	     * @static
	     * @public
	     *
	     */
	    static readonly Intersects: Symbol;
	    /**
	     * Queries that **ALL** of the nested key/value pairs in the _objectA_ parameter match against the _objectB_ parameter
	     * Note: Using _Intersects_ as value, will instead check that any value not undefined
	     * @param {Attributes} objectA Attributes used for the **AND** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @returns {boolean}
	     */
	    static And(objectA: Attributes, objectB: Attributes): boolean;
	    /**
	     * Queries that **ANY** of the nested key/value pairs in the _objectA_ parameter match against the _objectB_ parameter
	     * Note: Using _Intersects_ as value, will instead check that any value not undefined
	     * @param {Attributes} objectA Attributes used for the **Or** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @returns {boolean}
	     */
	    static Or(objectA: Attributes, objectB: Attributes): boolean;
	    /**
	     * Queries that **NONE** of the nested key/value pairs in the _objectA_ parameter match against the _objectB_ parameter
	     * Note: Using _Intersects_ as value, will instead check that any value not undefined
	     * @param {Attributes} objectA Attributes used for the **None** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @returns {boolean}
	     */
	    static Not(objectA: Attributes, objectB: Attributes): boolean;
	    /**
	     * Queries that **ALL** key/value pairs in the _objectA_ parameter match against the _objectB_ parameter
	     * @param {Attributes} objectA Not used
	     * @param {Attributes} objectB Not used
	     * @param {unknown[]} rest Not used
	     * @returns {true}
	     */
	    static All(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean;
	    /**
	     * Queries each value in the _objectA_ parameter and will dispatch a different operation based on the following types:
	     * * Function: Dispatches a synchronous callback to compare parameters
	     * * RegExp: Dispatches a _RegExp.match( ... )_ to compare values
	     * * Values: Dispatches a direct match
	     * Note: Using _Intersects_ as value, will instead check that any value not undefined
	     * @param {Attributes} objectA Attributes used for the **Composite** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @param {unknown[]} rest passed along to any callbacks encountered
	     * @returns {boolean}
	     */
	    static Composite(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean;
	    /**
	     * Queries that each of the nested key/value pairs in the _objectA_ parameter is greater then the nested _objectB_ parameter
	     * @param {Attributes} objectA Attributes used for the **Greater** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @returns {boolean}
	     */
	    static Greater(objectA: Attributes, objectB: Attributes): boolean;
	    /**
	     * Queries that each of the nested key/value pairs in the _objectA_ parameter is less then the nested _objectB_ parameter
	     * @param {Attributes} objectA Attributes used for the **Less** operation
	     * @param {Attributes} objectB Attributes used to test _objectA_ parameter against
	     * @returns {boolean}
	     */
	    static Less(objectA: Attributes, objectB: Attributes): boolean;
	    static Traverse(objectA: Attributes, objectB: Attributes): boolean;
	}
	export interface IQuery<T = unknown> {
	    /**
	     * Reactor that generates a array of entities
	     * @returns {IReactor<[T, Attributes][]>}
	     */
	    [Reactivity](): IReactor<[T, Attributes][]>;
	    /**
	     * Iterator that return a component/attribute pair ( entity )
	     * @template [T=unknown]
	     * @returns {IterableIterator<[T, Attributes]>}
	     */
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    /**
	     * Getter to access the amount of ( entities ) component/attributes
	     * @type {number}
	     */
	    get size(): number;
	    /**
	     * Getter to access a the internal collection instance
	     * @template [T=unknown]
	     * @type {ICollection<T>}
	     */
	    get collection(): ICollection<T>;
	    /**
	     * Getter to access all components
	     * @template [T=unknown]
	     * @type {T[]}
	     */
	    get all(): T[];
	    /**
	     * Getter to access the last component within the internal collection
	     * @template [T=unknown]
	     * @type {T}
	     */
	    get last(): T;
	    /**
	     * Getter to access the first component within the internal collection
	     * @template [T=unknown]
	     * @type {T}
	     */
	    get first(): T;
	    /**
	     * Returns the component at the index from the internal collection
	     * @template [T=unknown]
	     * @returns {T}
	     */
	    get(index: number): T;
	    /**
	     * Constructs a sliced array of components from the internal collection of entities
	     * @template [T=unknown]
	     * @param {number} start Starting index to start the slice
	     * @param {number} [end] Optional - The end index of the slice
	     * @returns {T}
	     */
	    slice(start: Number): T[];
	    slice(start: Number, end: Number): T[];
	    /**
	     * Attempts Finds at least one component that matches the delegate passed
	     * @param {(component: T, attributes: Attributes, ...rest: unknown[]) => boolean} callback Called each iteration with following signature (component: T, attributes: Attributes, ...rest: unknown[]) => boolean
	     * @param {...unknown[]} [rest]
	     * @returns {boolean}
	     */
	    has(sequence: QuerySequence): boolean;
	    has(callback: Function, ...rest: unknown[]): boolean;
	    /**
	     * Returns the attributes binded the _component_ paramter
	     * @template [T=unknown]
	     * @param {T} component
	     * @returns {T|undefined}
	     */
	    attributes(component: T): Attributes | undefined;
	    /**
	     * Add a new entity entry creating a new component/attributes pairing
	     * @template [T=unknown]
	     * @param {T} component Data assigned to the entity
	     * @param {Attributes} attributes Attributes binded to the _component_ parameter
	     * @returns {this}
	     */
	    add(component: T, attributes: Attributes): this;
	    /**
	     * Removes the component ( and the binded attributes ) from the internal collection
	     * @template [T=unknown]
	     * @param component Data assigned to the entity
	     * @returns {this}
	     */
	    remove(component: T): this;
	    /**
	     * Clears the collection removing all entites
	     * @returns {this}
	     */
	    clear(): this;
	    /**
	     * Merges components from other instance that implements IQuery<T>
	     * @template [T=unknown]
	     * @param {IQuery<T>[]} queries An array of _IQuery<T>_ instances
	     * @returns {this}
	     */
	    merge(...queries: IQuery<T>[]): this;
	    /**
	     * Will change the component source without affecting the internal collection or binded attributes
	     * @template [T=unknown]
	     * @param {T} source Source component to be replaced
	     * @param {T} target New Component that will replace the old component
	     * @returns {this}
	     */
	    mutate(source: T, target: T): this;
	    /**
	     * Performs a **Or** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Or** operation
	     * @returns {IQuery<T>}
	     */
	    or(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **And** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **And** operation
	     * @returns {IQuery<T>}
	     */
	    and(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Not** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Not** operation
	     * @returns {IQuery<T>}
	     */
	    not(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Greater** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Greater** operation
	     * @returns {IQuery<T>}
	     */
	    greater(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Less** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Less** operation
	     * @returns {IQuery<T>}
	     */
	    less(attributes: Attributes): IQuery<T>;
	    /**
	     * Check if there is a matching nested hierarchy and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Traverse** operation
	     * @returns {IQuery<T>}
	     */
	    traverse(attributes: Attributes): IQuery<T>;
	    /**
	     * Calls the _delegate_ parameter on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {QueryDelegate} delegate A callback to match each entity
	     * @param {Attributes} [attributes] Attributes to pass to the delegate
	     * @param {unknown[]} [rest] Rest parameters to pass to the delegate
	     * @returns {IQuery<T>}
	     */
	    filter(delegate: QueryDelegate): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): IQuery<T>;
	    /**
	     * Asynchronously Calls the _delegate_ parameter on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {QueryDelegate} delegate A callback to match each entity
	     * @param {Attributes} [attributes] Attributes to pass to the delegate
	     * @param {unknown[]} [rest] Rest parameters to pass to the delegate
	     * @returns {IQuery<T>}
	     */
	    $filter(delegate: QueryDelegate): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): Promise<IQuery<T>>;
	    /**
	     * Groups components based on matching attributes. Returns an object that has
	     * @param {Attributes} attributes
	     * @returns {Attributes}
	     */
	    group(attributes: Attributes): Attributes;
	    /**
	     * Return a promise that will resolve when the _listener_ parameter returns true after a update.
	     * Note: This is useful for waiting for specific entities to be present before proceeding.
	     * @template [T=unknown]
	     * @param {$WaitQueryDelegate<T>} listener a callback to resolve the returned promise
	     * @param {Object} [options] a callback to resolve the returned promise
	     * @param {number} [options.race] a callback to resolve the returned promise
	     * @returns {Promise<this>}
	     */
	    $wait(listener: $WaitQueryDelegate<T>): Promise<this>;
	    $wait(listener: $WaitQueryDelegate<T>, options: {
	        race: number;
	    }): Promise<this>;
	    /**
	     * Produces a clone of the current instance.
	     * @template [T=unknown]
	     * @returns {IQuery<T>}
	     */
	    clone(): IQuery<T>;
	}
	export class QueryManager<T = unknown> implements IQuery<T> {
	    static From<T = unknown>(overload: Iterable<[T, Attributes]>): QueryManager<T>;
	    protected _collection: ICollection<T>;
	    protected _listeners: Map<((query: IQuery<T>) => boolean | Promise<boolean>), $Promise<this>> | undefined;
	    protected _reactor: QueryManagerReactor<T> | undefined;
	    constructor();
	    constructor(collection: ICollection<T>);
	    /**
	     * Reactor that generates a array of entities
	     * @returns {IReactor<[T, Attributes][]>}
	     */
	    [Reactivity](): IReactor<[T, Attributes][]>;
	    /**
	     * Iterator that return a component/attribute pair ( entity )
	     * @template [T=unknown]
	     * @returns {IterableIterator<[T, Attributes]>}
	     */
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    /**
	     * Getter to access the amount of ( entities ) component/attributes
	     * @type {number}
	     */
	    get size(): number;
	    /**
	     * Getter to access a the internal collection instance
	     * @template [T=unknown]
	     * @type {ICollection<T>}
	     */
	    get collection(): ICollection<T>;
	    /**
	     * Getter to access all components
	     * @template [T=unknown]
	     * @type {T[]}
	     */
	    get all(): T[];
	    /**
	     * Getter to access the last component within the internal collection
	     * @template [T=unknown]
	     * @type {T}
	     */
	    get last(): T;
	    /**
	     * Getter to access the first component within the internal collection
	     * @template [T=unknown]
	     * @type {T}
	     */
	    get first(): T;
	    /**
	     * Returns the component at the index from the internal collection
	     * @template [T=unknown]
	     * @returns {T}
	     */
	    get(index: number): T;
	    /**
	     * Constructs a sliced array of components from the internal collection of entities
	     * @template [T=unknown]
	     * @param {number} start Starting index to start the slice
	     * @param {number} [end] Optional - The end index of the slice
	     * @returns {T}
	     */
	    slice(start: number): T[];
	    slice(start: number, end: number): T[];
	    /**
	     * Finds at least one component that matches the parameters passed using QuerySequence.match
	     * @param {QuerySequence} sequence an instance of QuerySequence that will match against each attributes
	     * @returns {boolean}
	     */
	    has(sequence: QuerySequence): boolean;
	    /**
	     * Attempts Finds at least one component that matches the delegate passed
	     * @param {(component: T, attributes: Attributes, ...rest: unknown[]) => boolean} callback called each iteration with following signature (component: T, attributes: Attributes, ...rest: unknown[]) => boolean
	     * @param {...unknown[]} [rest]
	     * @returns {boolean}
	     */
	    has(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => boolean, ...rest: unknown[]): boolean;
	    /**
	     * Add a new entity entry creating a new component/attributes pairing
	     * @template [T=unknown]
	     * @param {T} component Data assigned to the entity
	     * @param {Attributes} attributes Attributes binded to the _component_ parameter
	     * @returns {this}
	     */
	    add(component: T, attributes: Attributes): this;
	    /**
	     * Removes the component ( and the binded attributes ) from the internal collection
	     * @template [T=unknown]
	     * @param component Data assigned to the entity
	     * @returns {this}
	     */
	    remove(component: T): this;
	    /**
	     * Will change the component source without affecting the internal collection or binded attributes
	     * @template [T=unknown]
	     * @param {T} source Source component to be replaced
	     * @param {T} target New Component that will replace the old component
	     * @returns {this}
	     */
	    mutate(source: T, target: T): this;
	    /**
	     * Clears the collection removing all entites
	     * @returns {this}
	     */
	    clear(): this;
	    /**
	     * Returns the attributes binded the _component_ paramter
	     * @template [T=unknown]
	     * @param {T} component
	     * @returns {T|undefined}
	     */
	    attributes(component: T): Attributes | undefined;
	    /**
	     * Merges components from other instance that implements IQuery<T>
	     * @template [T=unknown]
	     * @param {IQuery<T>[]} queries An array of _IQuery<T>_ instances
	     * @returns {this}
	     */
	    merge(...queries: IQuery<T>[]): this;
	    /**
	     * Performs a **Greater** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Greater** operation
	     * @returns {IQuery<T>}
	     */
	    greater(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Less** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Less** operation
	     * @returns {IQuery<T>}
	     */
	    less(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Or** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Or** operation
	     * @returns {IQuery<T>}
	     */
	    or(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **And** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **And** operation
	     * @returns {IQuery<T>}
	     */
	    and(attributes: Attributes): IQuery<T>;
	    /**
	     * Performs a **Not** operation on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Not** operation
	     * @returns {IQuery<T>}
	     */
	    not(attributes: Attributes): IQuery<T>;
	    /**
	     * Check if there is a matching nested hierarchy and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {Attributes} attributes Attributes used in the **Traverse** operation
	     * @returns {IQuery<T>}
	     */
	    traverse(attributes: Attributes): IQuery<T>;
	    /**
	     * Calls the _delegate_ parameter on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {QueryDelegate} delegate A callback to match each entity
	     * @param {Attributes} [attributes] Attributes to pass to the delegate
	     * @param {unknown[]} [rest] Rest parameters to pass to the delegate
	     * @returns {IQuery<T>}
	     */
	    filter(delegate: QueryDelegate): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): IQuery<T>;
	    /**
	     * Asynchronously Calls the _delegate_ parameter on each entity and returns a new _IQuery<T>_ with all matched entity
	     * @template [T=unknown]
	     * @param {QueryDelegate} delegate A callback to match each entity
	     * @param {Attributes} [attributes] Attributes to pass to the delegate
	     * @param {unknown[]} [rest] Rest parameters to pass to the delegate
	     * @returns {IQuery<T>}
	     */
	    $filter(delegate: QueryDelegate): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): Promise<IQuery<T>>;
	    composite(attributes: Attributes): IQuery<T>;
	    /**
	     * Return a promise that will resolve when the _listener_ parameter returns true after a update.
	     * Note: This is useful for waiting for specific entities to be present before proceeding.
	     * @template [T=unknown]
	     * @param {$WaitQueryDelegate<T>} listener a callback to resolve the returned promise
	     * @param {Object} [options] a callback to resolve the returned promise
	     * @param {number} [options.race] a callback to resolve the returned promise
	     * @returns {Promise<this>}
	     */
	    $wait(listener: $WaitQueryDelegate<T>): Promise<this>;
	    $wait(listener: $WaitQueryDelegate<T>, options: {
	        race?: number;
	    }): Promise<this>;
	    /**
	     * Groups components based on matching attributes. Returns an object that has
	     * @param {Attributes} attributes
	     * @returns {Attributes}
	     */
	    group(grouping: Attributes): Attributes;
	    transform(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => [T, Attributes], ...rest: unknown[]): IQuery<T>;
	    /**
	    * Produces a clone of the current instance.
	    * @template [T=unknown]
	    * @returns {IQuery<T>}
	    */
	    clone(): IQuery<T>;
	}
	
	
	export interface IArgumentPackageMount {
	    mount(component: Attributes, attributes: Attributes): [Attributes, Attributes] | undefined;
	}
	export class AttributesArgumentPackageMount implements IArgumentPackageMount {
	    private _componentMounts;
	    private _attributesMounts;
	    constructor(component: Attributes);
	    constructor(component: Attributes, attributes: Attributes);
	    protected _mountAttributes(accessors: string[][], target: Attributes): Attributes | undefined;
	    mount(component: Attributes, attributes: Attributes): [Attributes, Attributes] | undefined;
	}
	export class DelegateArgumentPackageMount {
	    private _componentDelegate;
	    private _attributesDelegate;
	    constructor(component: (attributes: Attributes) => Attributes);
	    constructor(component: (attributes: Attributes) => Attributes, attributes: (attributes: Attributes) => Attributes);
	    _mountAttributes(delegate: (attributes: Attributes) => Attributes, target: Attributes): Attributes;
	    mount(component: Attributes, attributes: Attributes): [Attributes, Attributes];
	}
	
	
	
	export class ArgumentValidationComponent {
	    message: string;
	    cause: unknown;
	    constructor(message: string);
	}
	export class ArgumentValidationWarning extends ArgumentValidationComponent {
	}
	export class ArgumentValidationSuccess extends ArgumentValidationComponent {
	}
	export class ArgumentValidationError extends ArgumentValidationComponent {
	    error: unknown;
	}
	type ValidationConstructor = {
	    new (message: string): ArgumentValidationComponent;
	};
	class ArgumentValidationResults {
	    private _classRef;
	    private _attributes;
	    private readonly _validations;
	    private readonly _results;
	    frame: Map<ArgumentValidationComponent, Attributes>;
	    constructor(classRef: ValidationConstructor, validations: ArgumentValidations, attributes: Attributes);
	    [Symbol.iterator](): IterableIterator<[ArgumentValidationComponent, Attributes]>;
	    get size(): number;
	    add(message: string): ArgumentValidationComponent;
	    add(message: string, attributes: Attributes): ArgumentValidationComponent;
	    remove(entry: ArgumentValidationComponent): boolean;
	    clear(): void;
	    merge(results: ArgumentValidationResults): void;
	}
	export class ArgumentValidations {
	    cause: unknown;
	    attributes: Attributes | undefined;
	    readonly errors: ArgumentValidationResults;
	    readonly warnings: ArgumentValidationResults;
	    readonly successes: ArgumentValidationResults;
	    [Symbol.iterator](): IterableIterator<[ArgumentValidationComponent, Attributes]>;
	    get size(): number;
	    frame(): void;
	    flush(): {
	        errors: Map<ArgumentValidationComponent, Attributes>;
	        warnings: Map<ArgumentValidationComponent, Attributes>;
	        successes: Map<ArgumentValidationComponent, Attributes>;
	    };
	    clear(): void;
	    has(sequence: QuerySequence): boolean;
	    all(sequence: QuerySequence): ArgumentValidationComponent[];
	    first(sequence: QuerySequence): ArgumentValidationComponent | undefined;
	    last(sequence: QuerySequence): ArgumentValidationComponent | undefined;
	    purge(sequence: QuerySequence): ArgumentValidationComponent[];
	    merge(validation: ArgumentValidations): this;
	}
	
	
	
	
	export interface IResult<T> extends IQuery<T> {
	    success: boolean;
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get $async(): Promise<this>;
	    resolve(): this;
	    reject(): this;
	}
	export type $IResult<T> = Promise<IResult<T>>;
	export class Result<T> extends QueryManager<T> implements IResult<T> {
	    private readonly _$promise;
	    success: boolean;
	    constructor();
	    constructor(capture: Capture);
	    get $async(): Promise<this>;
	    resolve(): this;
	    reject(): this;
	}
	
	export interface IPoolable {
	    init(...rest: unknown[]): void;
	    reclaim(): void;
	}
	export class PoolManager {
	    private static __ClassMap;
	    static Instantiate<T>(constructor: Function | (new () => T), ...rest: unknown[]): T;
	    static Reclaim(instance: any): void;
	}
	
	
	export type Notification = string | RegExp | unknown | string[] | unknown[];
	export interface ISubscription {
	    hasSubscription(value: Notification): boolean;
	    subscribe(notify: Notification, callback: Function, once?: number): void;
	    unsubscribe(callback: Function): void;
	    notify(notify: Notification, ...rest: unknown[]): void;
	    $notify(notify: Notification, ...rest: unknown[]): Promise<void>;
	    clear(): void;
	    $listen(notify: unknown, callback: Function, race: number): Promise<unknown>;
	}
	/**
	 * If this class is returned from any notifcation dispatch then unsubscribe.
	 *
	 * @class
	 */
	export const Unsubscribe: Symbol;
	/**
	 * The Subscription class is a core class for implementing the notification pattern via `subscribe` and `notify` members.
	 * This class also has other utility members like $listen for waiting for an notification, and async versions of critical members
	 *
	 * @class
	 */
	export class Subscription implements ISubscription, IPoolable {
	    private readonly _subscriberMap;
	    private readonly _countMap;
	    private readonly _unsubscribeSet;
	    /**
	     * Called by the `PoolManager.instantiate(...) to retrieve an instance
	     *
	     * @param rest {...unknown[]} I used the ...rest parameter for inheritance
	     * @implements {IPoolable}
	     */
	    init(...rest: unknown[]): void;
	    /**
	     * Allows the intsance to be return to a pool.
	     *
	     * @param rest {...unknown[]} I used the ...rest parameter for inheritance
	     * @implements {IPoolable}
	     */
	    reclaim(): void;
	    /**
	     * Checks the subscriber store for the
	     * `hasSubscription` is mindful of subclasses that use `has` member
	     *
	     * @param value {Notification} Value to cast to string and compare.
	     * @returns {boolean}
	     */
	    hasSubscription(value: Notification): boolean;
	    /**
	     *
	     *
	     * @param notify {Notification} A key used to invoke the supplied delegate.
	     * @param delegate {Function} The delegate called
	     * @param once {boolean} Deletes the notication entry once it been dispatched
	     */
	    subscribe(notify: Notification, delegate: Function, count?: number): void;
	    unsubscribe(delegate: Function): void;
	    notify(notify: Notification, ...rest: unknown[]): void;
	    $notify(notify: Notification, ...rest: unknown[]): Promise<void>;
	    clear(): void;
	    $listen(notify: unknown, callback: Function): Promise<unknown>;
	    $listen(notify: unknown, callback: Function, race: number): Promise<unknown>;
	}
	
	export type ForgeParsedPath = {
	    root: string;
	    dir: string;
	    base: string;
	    ext: string;
	    name: string;
	};
	export type ForgePathStatus = {
	    isSubdirectory: boolean;
	    exists: boolean;
	    contains: boolean;
	};
	export class ForgePath {
	    static IsAbsolute(file: string): boolean;
	    static Parse(file: string): ForgeParsedPath;
	    static Resolve(...rest: string[]): string;
	    static Relative(source: string, target: string): string;
	    static Contains(source: string, target: string): boolean;
	    static $Status(root: string, target: string): Promise<ForgePathStatus>;
	    static Sanitize(...rest: string[]): string;
	    static Join(...rest: string[]): string;
	}
	
	
	
	export interface ForgeFileStats {
	    isFile(): boolean;
	    isDirectory(): boolean;
	    isBlockDevice(): boolean;
	    isCharacterDevice(): boolean;
	    isSymbolicLink(): boolean;
	    isFIFO(): boolean;
	    isSocket(): boolean;
	    dev: number;
	    ino: number;
	    mode: number;
	    nlink: number;
	    uid: number;
	    gid: number;
	    rdev: number;
	    size: number;
	    blksize: number;
	    blocks: number;
	    atimeMs: number;
	    mtimeMs: number;
	    ctimeMs: number;
	    birthtimeMs: number;
	    atime: Date;
	    mtime: Date;
	    ctime: Date;
	    birthtime: Date;
	}
	export class ForgeFile {
	    static Stream: {
	        Write: (file: string, options?: {}) => {
	            write: (contents: string | Buffer | ArrayBuffer) => void;
	            $end: () => Promise<string>;
	        };
	    };
	    static $Stat(target: string): Promise<ForgeFileStats>;
	    static $FileExist(file: string): Promise<boolean>;
	    static $DirectoryExists(path: string): Promise<boolean>;
	    static $MakeDirectory(path: string): Promise<boolean>;
	    static Read(path: string, options?: Record<string, unknown>): ArrayBufferLike;
	    static $ReadDecoded(path: string, encoding?: 'utf8' | string): Promise<string>;
	    static $Read(path: string): Promise<ArrayBufferLike>;
	    static Write(path: string, contents: string | Buffer | ArrayBuffer): void;
	    static Write(path: string, contents: string | Buffer | ArrayBuffer, options: {
	        recursive?: boolean;
	    }): void;
	    static $Write(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	    static $Write(path: string, contents: string | Buffer | ArrayBuffer, options: {
	        recursive?: boolean;
	        encoding?: string;
	    }): Promise<void>;
	    static $Append(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	    static $Append(path: string, contents: string | Buffer | ArrayBuffer, options: {}): Promise<void>;
	    static $Copy(source: string, target: string): Promise<void>;
	    static $CopyGlob(sources: string[], target: string): Promise<void>;
	    static $Glob(paths: string[], options?: {
	        resolve?: boolean;
	        ignores?: string[];
	    }): Promise<string[]>;
	    static $GlobExist(paths: string[]): Promise<Result<string>>;
	    static $Walk(root: string): Promise<string[]>;
	    static $Walk(root: string, options: {
	        recursive?: boolean;
	        file?: boolean;
	        directory?: boolean;
	        resolve?: boolean;
	    }): Promise<string[]>;
	    static $WalkStats(root: string): Promise<Map<string, ForgeFileStats>>;
	    static $WalkStats(root: string, recursive: false): Promise<Map<string, ForgeFileStats>>;
	    static $WalkStats(root: string, files: Map<string, ForgeFileStats>): Promise<Map<string, ForgeFileStats>>;
	}
	class ForgeWeb {
	    static $Fetch(url: string, options: Record<string, unknown>): Promise<Response>;
	}
	export class ForgeIO {
	    static readonly File: typeof ForgeFile;
	    static readonly Web: typeof ForgeWeb;
	    static $Fetch(source: string): Promise<ArrayBuffer>;
	    static $Fetch(source: string, options: {
	        request?: RequestInit;
	        capture?: Capture;
	    }): Promise<ArrayBuffer | Capture>;
	    static $Download(url: string, file: string): Promise<boolean>;
	}
	
	
	export interface IValueSanitizer {
	    frame: (values: unknown[]) => void;
	    sanitize?: (value: unknown) => unknown;
	    flush?: (values: unknown[]) => void;
	}
	export interface IAsyncValueSanitizer {
	    $frame?: (values: unknown[]) => Promise<void>;
	    $sanitize?: (value: unknown) => Promise<unknown>;
	    $flush?: (values: unknown[]) => Promise<void>;
	}
	export type ValueSanitizeOptions = {
	    help?: string;
	    default?: unknown;
	    sanitizers?: IValueSanitizer[];
	};
	export type AsyncValueSanitizeOptions = {
	    help?: string;
	    default?: unknown;
	    sanitizers?: IAsyncValueSanitizer[];
	};
	export class ArgumentValueSanitize {
	    readonly options: ValueSanitizeOptions;
	    constructor(options?: ValueSanitizeOptions);
	    /**
	     * Iterate through all components, attributes passed from the Argument package.
	     * @param {Attributes} value this value is processed in the following order:
	     * 1. matched against a `QuerySequence` before proceeding
	     * 2. cloned and possibly intersected against `SanitationOptions`
	     * 3. merged with default values
	     * 4. passed through a delegate( ... )
	     * @param {Attributes} attributes used to identify the current component
	     * @return {SanitizedPackageValue} returns a  {
	     * value: the new value to replace
	     * errors: any errors encountered during sanitation
	     * warnings: any warnings encounters during sanitation
	     */
	    frame(values: unknown[]): void;
	    flush(values: unknown[]): void;
	    santize(value: unknown): unknown;
	}
	export class AsyncArgumentValueSanitize {
	    readonly options: AsyncValueSanitizeOptions;
	    constructor(options?: AsyncValueSanitizeOptions);
	    $frame(values: unknown[]): Promise<void>;
	    $flush(values: unknown[]): Promise<void>;
	    $sanitize(value: unknown): Promise<unknown>;
	}
	
	
	
	
	
	export class ArgumentValues<T = unknown> {
	    static From<T = unknown>(query: IQuery<Attributes>, intersect?: Attributes): ArgumentValues<T>;
	    protected _values: T[];
	    validations: ArgumentValidations;
	    constructor(options: {
	        values: T[];
	        validations?: ArgumentValidations;
	    });
	    [Symbol.iterator](): IterableIterator<T>;
	    get first(): T;
	    get last(): T;
	    get all(): T[];
	    get(index: number): unknown;
	    $glob(ignores?: string[]): Promise<string[]>;
	    $glob(ignores?: string[]): Promise<string[]>;
	    split(splitter?: string | RegExp): this;
	    sanitize(sanitizer: IValueSanitizer): this;
	    $sanitize(sanitizer: IAsyncValueSanitizer): Promise<this>;
	}
	
	
	
	
	export function ExplodeString(value: string): string[];
	export function ExplodeString(value: string[]): string[];
	export function $ExplodeGlob(value: string | string[]): Promise<string[]>;
	export function $ExplodeGlob(value: string | string[]): Promise<string[]>;
	export class AbstractPackageQuerySequence {
	    protected _intersect: Attributes | undefined;
	    protected _mounts: string[][];
	    protected _remounts: string[][];
	    queries: QuerySequence;
	    or(attributes: Attributes): this;
	    and(attributes: Attributes): this;
	    not(attributes: Attributes): this;
	    filter(delegate: QueryDelegate): this;
	    filter(delegate: QueryDelegate, attributes: Attributes): this;
	    filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): this;
	    intersect(intersection: Attributes): this;
	    mount(attributes: Attributes): this;
	    mount(attributes: Attributes, remount: Attributes): this;
	    localize(component: Attributes): Attributes | undefined;
	    globalize(attributes: Attributes): Attributes;
	}
	
	
	
	
	
	interface IAbstractPackageSanitizer {
	    localize?: (component: Attributes) => Attributes | undefined;
	    globalize?: (component: Attributes) => Attributes;
	    validate?: (packaging: IArgumentPackage) => void;
	    authorize?: (packaging: IArgumentPackage) => boolean;
	}
	export interface IPackageSanitizer extends IAbstractPackageSanitizer {
	    options?: PackageSanitizeOptions;
	    frame?: (query: IQuery<ArgumentPackageComponent>, intersect?: Attributes) => void;
	    sanitize?: (component: Attributes, attributes: Attributes) => Attributes | undefined;
	    flush?: (query: IQuery<ArgumentPackageComponent>, intersect?: Attributes) => void;
	}
	export interface IAsyncPackageSanitizer extends IAbstractPackageSanitizer {
	    options?: AsyncPackageSanitizeOptions;
	    $frame?: (query: IQuery<ArgumentPackageComponent>, intersect?: Attributes) => Promise<void>;
	    $sanitize?: (component: Attributes, attributes: Attributes) => Promise<Attributes | undefined>;
	    $flush?: (query: IQuery<ArgumentPackageComponent>, intersect?: Attributes) => Promise<void>;
	}
	export type PackageSanitizeOptions = {
	    authorize?: (packaging: IArgumentPackage) => boolean;
	    default?: {
	        component: Attributes;
	        attributes: Attributes;
	    };
	    sanitizers?: IPackageSanitizer[];
	};
	export type AsyncPackageSanitizeOptions = {
	    authorize?: (packaging: IArgumentPackage) => boolean;
	    default?: {
	        component: Attributes;
	        attributes: Attributes;
	    };
	    sanitizers?: IAsyncPackageSanitizer[];
	};
	export class ArgumentPackageSanitize extends AbstractPackageQuerySequence implements IPackageSanitizer {
	    readonly options: PackageSanitizeOptions;
	    constructor();
	    constructor(options: PackageSanitizeOptions);
	    authorize(packaging: IArgumentPackage): boolean;
	    frame(query: IQuery<ArgumentPackageComponent>): void;
	    flush(query: IQuery<ArgumentPackageComponent>): void;
	    /**
	     * Iterate through all components, attributes passed from the Argument package.
	     * @param {Attributes} component this value is processed in the following order:
	     * 1. matched against a `QuerySequence` before proceeding
	     * 2. cloned and possibly intersected against `SanitationOptions`
	     * 3. merged with default values
	     * 4. passed through a delegate( ... )
	     * @param {Attributes} attributes used to identify the current component
	     * @return {SanitizedPackageValue} returns a  {
	     * value: the new value to replace
	     * errors: any errors encountered during sanitation
	     * warnings: any warnings encounters during sanitation
	     */
	    sanitize(component: ArgumentPackageComponent, attributes: Attributes): Attributes | undefined;
	    validate(packaging: IArgumentPackage): void;
	}
	export class AsyncArgumentPackageSanitize extends AbstractPackageQuerySequence implements IAsyncPackageSanitizer {
	    readonly options: AsyncPackageSanitizeOptions;
	    constructor();
	    constructor(options: AsyncPackageSanitizeOptions);
	    authorize(packaging: IArgumentPackage): boolean;
	    $frame(query: IQuery<ArgumentPackageComponent>): Promise<void>;
	    $flush(query: IQuery<ArgumentPackageComponent>): Promise<void>;
	    /**
	     * Iterate through all components, attributes passed from the Argument package.
	     * @param {Attributes} component this value is processed in the following order:
	     * 1. matched against a `QuerySequence` before proceeding
	     * 2. cloned and possibly intersected against `SanitationOptions`
	     * 3. merged with default values
	     * 4. passed through a delegate( ... )
	     * @param {Attributes} attributes used to identify the current component
	     * @return {SanitizedPackageValue} returns a  {
	     * value: the new value to replace
	     * errors: any errors encountered during sanitation
	     * warnings: any warnings encounters during sanitation
	     */
	    $sanitize(component: ArgumentPackageComponent, attributes: Attributes): Promise<Attributes | undefined>;
	    validate(packaging: IArgumentPackage): void;
	}
	
	
	
	
	
	
	
	export interface IPackageValidator {
	    localize?: (component: Attributes) => Attributes | undefined;
	    frame?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations) => void;
	    validate?: (component: Attributes, attributes: Attributes, results: ArgumentValidations) => void;
	    flush?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations) => void;
	}
	export interface IAsyncPackageValidator {
	    localize?: (component: Attributes) => Attributes | undefined;
	    $frame?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations) => Promise<void>;
	    $validate?: (component: ArgumentPackageComponent, attributes: Attributes, results: ArgumentValidations) => Promise<void>;
	    $flush?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations) => Promise<void>;
	}
	export type PackageValidateOptions = {
	    help?: string;
	    error?: string;
	    required?: boolean;
	    validators?: IPackageValidator[];
	};
	export type AsyncPackageValidateOptions = {
	    help?: string;
	    error?: string;
	    required?: boolean;
	    validators?: IAsyncPackageValidator[];
	};
	export class AbstractPackageValidate extends AbstractPackageQuerySequence {
	    help: string;
	    required: boolean;
	    constructor(options?: {
	        help?: string;
	        error?: string;
	        required?: boolean;
	    });
	}
	export class ArgumentPackageValidate extends AbstractPackageValidate implements IPackageValidator {
	    protected _validators: IPackageValidator[];
	    constructor();
	    constructor(options: PackageValidateOptions);
	    frame(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations): void;
	    flush(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations): void;
	    validate(component: Attributes, attributes: Attributes, results: ArgumentValidations): void;
	}
	export class AsyncArgumentPackageValidate extends AbstractPackageValidate implements IAsyncPackageValidator {
	    protected _validators: IAsyncPackageValidator[];
	    constructor();
	    constructor(options: AsyncPackageValidateOptions);
	    $frame(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations): Promise<void>;
	    $flush(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidations): Promise<void>;
	    $validate(component: ArgumentPackageComponent, attributes: Attributes, results: ArgumentValidations): Promise<void>;
	}
	
	
	
	
	
	
	
	
	
	export type ArgumentPackageComponent = Attributes | Promise<Attributes>;
	export interface IArgumentPackage {
	    /**
	     * Generates all entities
	     * @generator
	     * @yields {[ArgumentPackageComponent, Attributes]} The next component and attributes in the sequence.
	     */
	    [Symbol.iterator](): Iterator<[ArgumentPackageComponent, Attributes]>;
	    validations: ArgumentValidations;
	    get size(): number;
	    /**
	     * Adds a component and attributes for querying. Return a this for chaining calls
	     * @param {ArgumentPackageComponent} component - Attributes or Promise<Attributes> that defines the current component
	     * @param {Attributes} attributes - Attributes used for querying the current component
	     * @returns {this} returns self for chaining calls
	     */
	    add(value: Attributes, attributes: Attributes): this;
	    /**
	     * Removes the entity component associated with the component
	     * @param {ArgumentPackageComponent} component - Attributes or Promise<Attributes> that defines the current component
	     * @returns {this} returns self for chaining calls
	     */
	    remove(value: Attributes): this;
	    /**
	     * Check if any entity exists using a QuerySequence to match the entity's attributes
	     * @param {QuerySequence} sequence - sequence to match against each entity's attribute
	     * @returns {boolean} if any entities match the {QuerySequence}
	     */
	    has(sequence: QuerySequence): boolean;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Or( ... )
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    or(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.And( ... )
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    and(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Not( ... )
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    not(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Traverse( ... )
	     * @param {QueryDelegate} callback - callback to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    traverse(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by a callback
	     * @param {QueryDelegate} callback - callback to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    filter(callback: QueryDelegate): IArgumentPackage;
	    /**
	     * Return all components combined by iteratively merging each component using the `...` operator.
	     * Also includes an optional parameter to only include the intersection of each component
	     * @template [T=Attributes]
	     * @param {Attributes} [intersect] - attributes value used as an intersection of each component
	     * @returns {T} A value that is the combination of components which type extends Attributes
	     */
	    collapse<T extends Attributes>(): T;
	    collapse<T extends Attributes>(intersect: Attributes): T;
	    /**
	     * Return all components combined by iteratively merging each component using the SquashAttributes( ... ).
	     * Also includes an optional parameter to only include the intersection of each component
	     * @template [T=Attributes]
	     * @param {Object} [options] - Optional parameters for "squashing" and mount the result
	     * @param {Attributes} [options.intersect] - Optional intersection for "squashing" all components
	     * @param {ImplodeAttributesOptions} [options.implode] - Optional enum for resolving overlapping pairs during "squashing" all components
	     * @param {Attributes} [options.mount] - Optional root for mounting result from squashing all components
	     * @returns {T} A value that is the combination of components which type extends Attributes
	     */
	    squash<T extends Attributes>(): T;
	    squash<T extends Attributes>(options: {
	        intersect?: Attributes;
	        implode?: ImplodeAttributesOptions;
	        mount?: Attributes;
	    }): T;
	    /**
	     * Returns a _ArgumentValues<T>_ instance containing all values of from each components and it non-nested values
	     * @method explode
	     * @template [T=unknown]
	     * @param {?Attributes} intersect The attributes to use as a intersection to filter (optional)
	     * @returns {ArgumentValues<T>}
	     */
	    explode<T>(): ArgumentValues<T>;
	    explode<T>(intersect: Attributes): ArgumentValues<T>;
	    /**
	     * Attempt to santize the package using the _sanitizer_ parameter. This includes creating, modifying, or deleting entities
	     * @param {IPackageSanitizer} sanitizer an instance the implements the _IPackageSanitizer_ interface
	     * @returns {this} The current instance
	     */
	    sanitize(sanitize: IPackageSanitizer): IArgumentPackage;
	    /**
	     * Asynchronously Attempt to santize the package using the _sanitizer_ parameter. This includes creating, modifying, or deleting entities
	     * @param {IAsyncPackageSanitizer} sanitizer an instance the implements the _IAsyncPackageSanitizer_ interface
	     * @returns {this} The current instance
	     */
	    $sanitize(sanitize: IAsyncPackageSanitizer): Promise<IArgumentPackage>;
	    /**
	     * Synchronously validate the current package using the _validator_ parameter
	     * **Skips all entities that have components that `Promises`**
	     * @param {IPackageValidator} validator an instance that implements _IAsyncPackageValidator_
	     * @returns {this} The current instance
	     */
	    validate(validate: IPackageValidator): IArgumentPackage;
	    /**
	     * Asynchronously validate the current package using the _validator_ parameter
	     * @param validator an instance that implements _IAsyncPackageValidator_
	     * @returns The current instance
	     */
	    $validate(validate: IAsyncPackageValidator): Promise<IArgumentPackage>;
	    /**
	     * Clones a new package where each entity has been processed by the _$callback( ... )_ parameters
	     * @param $callback a callback processes each entity
	     * @returns A new instance where each entity was processed
	     */
	    $mutate($callback: (component: Attributes, attributes: Attributes) => [ArgumentPackageComponent, Attributes]): Promise<IArgumentPackage>;
	    /**
	     * Uses the mount interface _IArgumentPackage_ to determine how to traverse and mount each entity component and attributes
	     * **Only processes entities with components that are not a _Promise_**
	     * @param mount an instance that implements the _IArgumentPackage_ to "remount" each entity
	     *
	     * @returns {IArgumentPackage} A new _IArgumentPackage_ that been process by the _mount_ parameter
	     */
	    mount(mount: IArgumentPackageMount): IArgumentPackage;
	    /**
	     * Uses the mount interface _IArgumentPackage_ to determine how to traverse and mount each entity component and attributes
	     * **will resolve any component that is a _Promise_**
	     * @param mount an instance that implements the _IArgumentPackage_ to "remount" each entity
	     * @returns {IArgumentPackage} A new _IArgumentPackage_ that been process by the _mount_ parameter
	     */
	    $mount(mount: IArgumentPackageMount): Promise<IArgumentPackage>;
	    collect<T = Attributes>(sequence: QuerySequence): T;
	    $collect<T = Attributes>(sequence: QuerySequence): Promise<T>;
	    after(iterable: Iterable<[ArgumentPackageComponent, Attributes]> | IArgumentPackage): this;
	    before(iterable: Iterable<[ArgumentPackageComponent, Attributes]> | IArgumentPackage): this;
	    $help(): Promise<string>;
	}
	export function SquashPackages<T = Attributes>(packages: IArgumentPackage[], sequence?: QuerySequence): T;
	export function MergeValidations(packages: IArgumentPackage[]): ArgumentValidations;
	export class PackageError extends Error {
	    errors: string[];
	    warnings: string[];
	    constructor(message: string, { errors, warnings }: {
	        errors: string[];
	        warnings?: string[];
	    });
	    toString(): string;
	}
	/**
	 * An utility class for packaging data from one source to transfer to another target including validating and sanitizing data.
	 * ArgumentPackage holds all components collected and validations
	 * @class
	 * @implements {IArgumentPackage}
	 */
	export class ArgumentPackage implements IArgumentPackage {
	    /**
	     * Holds all components
	     */
	    protected _query: IQuery<ArgumentPackageComponent>;
	    /**
	     * Holds all validation results
	     */
	    validations: ArgumentValidations;
	    /**
	     * Creates an instance with the options to use references as the internal data
	     * @param {Object} [options] - Optional parameter to instantiate internal state from
	     * @param {IQuery<ArgumentPackageComponent>} [options.query] - Optional reference to use an internal state of components
	     * @param {ArgumentValidations} [options.validations] - Optional reference to another ArgumentPackage.validations
	     */
	    constructor();
	    constructor(options: {
	        query?: IQuery<ArgumentPackageComponent>;
	        validations?: ArgumentValidations;
	    });
	    /**
	     * Generates all entities
	     * @generator
	     * @yields {[ArgumentPackageComponent, Attributes]} The next component and attributes in the sequence.
	     */
	    [Symbol.iterator](): IterableIterator<[ArgumentPackageComponent, Attributes]>;
	    /**
	     * The amount of entities within this instance
	     * @readonly
	     * @type {number}
	     */
	    get size(): number;
	    /**
	     * The internal QueryManager instance
	     * @readonly
	     * @type {IQuery<ArgumentPackageComponent>}
	     */
	    get query(): IQuery<ArgumentPackageComponent>;
	    /**
	     * Adds a component and attributes for querying. Return a this for chaining calls
	     * @method add
	     * @param {ArgumentPackageComponent} component - Attributes or Promise<Attributes> that defines the current component
	     * @param {Attributes} attributes - Attributes used for querying the current component
	     * @returns {this} Returns self for chaining calls
	     */
	    add(component: ArgumentPackageComponent, attributes: Attributes): this;
	    /**
	     * Clones a new instance with all components resolved, So that only synchronous members are needed.
	     * @method $await
	     * @returns {ArgumentPackage} Returns a new instance of ArgumentPackage
	     */
	    $await(): Promise<ArgumentPackage>;
	    /**
	     * Removes the entity component associated with the component
	     * @method remove
	     * @param {ArgumentPackageComponent} component - Attributes or Promise<Attributes> that defines the current component
	     * @returns {this} Returns self for chaining calls
	     */
	    remove(component: ArgumentPackageComponent): this;
	    /**
	     * Check if any entity exists using a QuerySequence to match the entity's attributes
	     * @method has
	     * @param {QuerySequence} sequence - sequence to match against each entity's attribute
	     * @returns {boolean} If any entities match the {QuerySequence}
	     */
	    has(sequence: QuerySequence): boolean;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Or( ... )
	     * @method or
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    or(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.And( ... )
	     * @method and
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    and(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Not( ... )
	     * @method not
	     * @param {Attributes} attributes - attributes to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    not(attributes: Attributes): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by a callback
	     * @method filter
	     * @param {QueryDelegate} callback - callback to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    filter(callback: QueryDelegate): IArgumentPackage;
	    /**
	     * Clones a new ArgumentPackage but with all entities filtered by QueryManager.Traverse( ... )
	     * @method traverse
	     * @param {QueryDelegate} callback - callback to used to match against each entity
	     * @returns {IArgumentPackage} A new ArgumentPackage instance
	     */
	    traverse(attributes: Attributes): IArgumentPackage;
	    /**
	     * Return all components combined by iteratively merging each component using the `...` operator.
	     * Also includes an optional parameter to only include the intersection of each component
	     * @method collapse
	     * @template [T=Attributes]
	     * @param {Attributes} [intersect] - Attributes value used as an intersection of each component
	     * @returns {T} A value that is the combination of components which type extends Attributes
	     */
	    collapse<T extends Attributes>(): T;
	    collapse<T extends Attributes>(intersect: Attributes): T;
	    /**
	     * Return all components combined by iteratively merging each component using the SquashAttributes( ... ).
	     * Also includes an optional parameter to only include the intersection of each component
	     * @method squash
	     * @template [T=Attributes]
	     * @param {Object} [options] - Optional parameters for "squashing" and mount the result
	     * @param {Attributes} [options.intersect] - Optional intersection for "squashing" all components
	     * @param {ImplodeAttributesOptions} [options.implode] - Optional enum for resolving overlapping pairs during "squashing" all components
	     * @param {Attributes} [options.mount] - Optional root for mounting result from squashing all components
	     * @returns {T} A value that is the combination of components which type extends Attributes
	     */
	    squash<T = Attributes>(): T;
	    squash<T = Attributes>(options: {
	        intersect?: Attributes;
	        implode?: ImplodeAttributesOptions;
	        mount?: Attributes;
	    }): T;
	    /**
	     * Returns a _ArgumentValues<T>_ instance containing all values of from each components and it non-nested values
	     * @method explode
	     * @template [T=unknown]
	     * @param {?Attributes} intersect - The attributes to use as a intersection to filter (optional)
	     * @returns {ArgumentValues<T>}
	     */
	    explode<T = unknown>(): ArgumentValues<T>;
	    explode<T = unknown>(intersect: Attributes): ArgumentValues<T>;
	    /**
	     * Attempt to santize the package using the _sanitizer_ parameter. This includes creating, modifying, or deleting entities
	     * @method sanitize
	     * @param {IPackageSanitizer} sanitizer - An instance the implements the _IPackageSanitizer_ interface
	     * @returns {this} The current instance
	     */
	    sanitize(sanitizer: IPackageSanitizer): ArgumentPackage;
	    /**
	     * Asynchronously Attempt to santize the package using the _sanitizer_ parameter. This includes creating, modifying, or deleting entities
	     * @method $sanitize
	     * @param {IAsyncPackageSanitizer} sanitizer - An instance the implements the _IAsyncPackageSanitizer_ interface
	     * @returns {this} - The current instance
	     */
	    $sanitize(sanitizer: IAsyncPackageSanitizer): Promise<IArgumentPackage>;
	    /**
	     * Synchronously validate the current package using the _validator_ parameter
	     * **Skips all entities that have components that `Promises`**
	     * @method validate
	     * @param {IPackageValidator} validator - An instance that implements _IAsyncPackageValidator_
	     * @returns {this} The current instance
	     */
	    validate(validator: IPackageValidator): this;
	    /**
	     * Asynchronously validate the current package using the _validator_ parameter
	     * @method $validate
	     * @param validator - An instance that implements _IAsyncPackageValidator_
	     * @returns The current instance
	     */
	    $validate(validator: IAsyncPackageValidator): Promise<this>;
	    /**
	     * Clones a new package where each entity has been processed by the _$callback( ... )_ parameters
	     * @method $mutate
	     * @param $callback - A callback processes each entity
	     * @returns A new instance where each entity was processed
	     */
	    $mutate($callback: (component: Attributes, attributes: Attributes) => [ArgumentPackageComponent, Attributes]): Promise<IArgumentPackage>;
	    /**
	     * This is a helper function to add entities to the end of the internal list.
	     * Uses the _iterable_ parameter as a source of entities to add to the start of the packaging
	     * @method after
	     * @param iterable - A source of entities to append
	     * @returns {this} The current instance
	     */
	    after(iterable: Iterable<[ArgumentPackageComponent, Attributes]> | IArgumentPackage): this;
	    /**
	     * This is a helper function to add entities to the start of the internal list.
	     * Uses the _iterable_ parameter as a source of entities to add to the start of the packaging
	     * @method before
	     * @param iterable - A source of entities to prepend
	     * @returns {this} The current instance
	     */
	    before(iterable: Iterable<[ArgumentPackageComponent, Attributes]> | IArgumentPackage): this;
	    /**
	     * Uses the mount interface _IArgumentPackage_ to determine how to traverse and mount each entity component and attributes
	     * **Only processes entities with components that are not a _Promise_**
	     * @method mount
	     * @param mount - An instance that implements the _IArgumentPackage_ to "remount" each entity
	     * @returns {IArgumentPackage} A new _IArgumentPackage_ that been process by the _mount_ parameter
	     */
	    mount(mount: IArgumentPackageMount): IArgumentPackage;
	    /**
	     * Uses the mount interface _IArgumentPackage_ to determine how to traverse and mount each entity component and attributes
	     * **will resolve any component that is a _Promise_**
	     * @method $mount
	     * @param mount - An instance that implements the _IArgumentPackage_ to "remount" each entity
	     * @returns {IArgumentPackage} A new _IArgumentPackage_ that been process by the _mount_ parameter
	     */
	    $mount(mount: IArgumentPackageMount): Promise<IArgumentPackage>;
	    /**
	     * Collects the components of entities that match the sequence parameter. Then squashes all components
	     * **Only processes entities with components that are not a _Promise_**
	     * @method collect
	     * @template [T=Attributes]
	     * @param {QuerySequence} - Sequence a _QuerySequence_
	     * @returns {T} All queries component that been **squashed**
	     */
	    collect<T = Attributes>(sequence: QuerySequence): T;
	    /**
	     * Collects the components of entities that match the sequence parameter. Then squashes all components
	     * **will resolve any component that is a _Promise_**
	     * @method $collect
	     * @template [T=Attributes]
	     * @param {QuerySequence} sequence A _QuerySequence_ instance to match against each component
	     * @returns {T} All queries component that been **squashed**
	     */
	    $collect<T = Attributes>(sequence: QuerySequence): Promise<T>;
	    /**
	     * Renders help content
	     * @method $help
	     * @returns {Promise<string>}
	     */
	    $help(): Promise<string>;
	}
	/**
	 * Checks the _params_ parameters for any errors which will throw a _PackageError_
	 * Otherwise will display the statuses of each parameters
	 * @throws PackageError
	 * @param {object} [param] - The parent wrapper object for user details
	 * @param {(IArgumentPackage | ArgumentValues)[]} [param.args] - An array of _IArgumentPackage_ or _ArgumentValues_ to check for errors or display statuses
	 * @param {string[]} [param.warnings] - An array of warnings to display
	 * @param {string[]} [param.errors] - An array of errors to display. If there any errors then a _PackageError_ is thrown
	 * @param {boolean} [param.silent] - flag to override rendering status
	 */
	export function VerfiyPackageWarnignsAndErrors(params: {
	    args?: (IArgumentPackage | ArgumentValues)[];
	    warnings?: string[];
	    errors?: string[];
	    silent?: boolean;
	}): void;
	
	
	
	export class CLIPromptArgument {
	    $validate: (answer: string) => Promise<boolean>;
	    private _messageCursor;
	    messages: string[];
	    attributes: Attributes;
	    race: number;
	    answer: unknown;
	    defaultValue: string;
	    constructor(attributes: Attributes, messages: string[], options?: {
	        required?: boolean;
	        defaultValue?: string;
	        race?: number;
	        $validate?: (answer: string) => Promise<boolean>;
	    });
	    $prompt(): Promise<unknown>;
	}
	export class CLIArgumentPackage extends ArgumentPackage {
	    static Defaults: {
	        Key: {
	            pair: RegExp[];
	            flag: RegExp[];
	        };
	        Partial: {
	            pair: RegExp[];
	            flag: RegExp[];
	        };
	    };
	    protected _keys: {
	        pair: RegExp[];
	        flag: RegExp[];
	    };
	    protected _partials: {
	        pair: RegExp[];
	        flag: RegExp[];
	    };
	    protected _errors: string[];
	    constructor();
	    constructor(tokens: string[]);
	    parse(tokens: string[]): this;
	    $prompt(name: string, attributes: Attributes, promptOptions: {
	        messages: string[];
	        race?: number;
	        defaultValue?: string;
	        $validate?: (answer: string) => Promise<boolean>;
	    }): Promise<this>;
	}
	
	export class Iterate {
	    static First<T>(iterable: Iterable<T>): T;
	    static Last<T>(iterable: Iterable<T>): T;
	}
	
	
	
	export type ParsedToken = [string, Attributes];
	export const StatementAttributes: {
	    NEWLINE: {
	        newline: boolean;
	        whitespace: boolean;
	    };
	    WHITESPACE: {
	        whitespace: boolean;
	    };
	    COMMENTS_BLOCK: {
	        comments: boolean;
	        "comments-blocks": boolean;
	    };
	    COMMENTS: {
	        comments: boolean;
	    };
	    GENERIC: {
	        generic: boolean;
	    };
	    LITERAL: {
	        literal: boolean;
	    };
	    SEMI_COLON: {
	        "semi-colon": boolean;
	    };
	    CLOSURE: {
	        closure: boolean;
	    };
	    PARENTHESIS: {
	        PARENTHESIS: boolean;
	    };
	};
	export enum SyntaxParsingState {
	    Consuming = 0,
	    Resolved = 1,
	    Rejected = 2
	}
	export interface IForgeSyntaxExpression {
	    get error(): Error;
	    get attributes(): Attributes;
	    get state(): SyntaxParsingState;
	    get tokens(): ParsedToken[];
	    get trackBack(): ParsedToken[];
	    set queryWhitespace(delegate: Function);
	    consume(token: ParsedToken): boolean;
	    clone(): IForgeSyntaxExpression;
	    frame(): void;
	}
	export class ForgeSyntaxStatement {
	    private _consumer;
	    private _success;
	    private _whitespaces;
	    private _ready;
	    private _state;
	    private readonly _expressions;
	    private readonly _activeExpressions;
	    private _queryWhitespace;
	    constructor(options?: {
	        whitespace: RegExp | Function;
	    });
	    private _whitespaceConsume;
	    /**
	     * The first token needs to be consumed and matched.
	     *
	     * @param token
	     * @returns {boolean}
	     */
	    private _firstConsume;
	    private _defaultConsume;
	    private _allReady;
	    get ready(): boolean;
	    get success(): boolean;
	    get attributes(): Attributes;
	    get tokens(): ParsedToken[];
	    get trackBack(): ParsedToken[];
	    get errors(): Error[];
	    get expressions(): IForgeSyntaxExpression[];
	    get whitespaces(): {
	        before: string[];
	        after: string[];
	    };
	    /**
	     * Attempts to consume a token by testing it against the remaining statement queries.
	     * @param  {String} token - The token to consume
	     * @return {Boolean}      - True if the token was consumed, false otherwise.
	     */
	    consume(token: ParsedToken): boolean;
	    resolve(): true;
	    fail(): false;
	    frame(): void;
	    clone(): ForgeSyntaxStatement;
	    add(expression: IForgeSyntaxExpression): this;
	    query(): IQuery<string>;
	}
	
	export class ForgeTokenIterator {
	    private readonly _tokens;
	    constructor(tokenizer: ForgeTokenizer);
	    [Symbol.iterator](): IterableIterator<string>;
	    next(): string;
	    line(): string[];
	    trackback(tokens: string[]): void;
	}
	export class ForgeTokenizer {
	    private _partials;
	    private _ready;
	    private _cursor;
	    private _tokens;
	    private _consumer;
	    private readonly _tokenRegex;
	    constructor();
	    constructor(tokenRegex: RegExp);
	    [Symbol.iterator](): IterableIterator<string>;
	    private _normalConsumer;
	    private _doubleQuoteConsumer;
	    private _singleQuoteConsumer;
	    private _tickQuoteConsumer;
	    private _commentBlockConsumer;
	    consume(content: string): void;
	    slice(): string[];
	    slice(cursor: number): string[];
	    frame(): void;
	}
	
	
	
	
	
	export function ParseAttributes(query: ParsedToken[]): Attributes;
	export function ParseAttributes(query: ParsedToken[], revivor: (this: any, key: string, value: any) => any): Attributes;
	export class ForgeSyntaxParser {
	    private _stream;
	    private readonly _statement;
	    private readonly _tokenizer;
	    readonly result: Result<ParsedToken[]>;
	    constructor(statement: ForgeSyntaxStatement);
	    constructor(statement: ForgeSyntaxStatement, tokenizer: ForgeTokenizer);
	    private _isOnlyWhitespace;
	    consume(content: string): IResult<ParsedToken[]>;
	}
	
	
	
	export class ForgeSyntaxExpression implements IForgeSyntaxExpression {
	    protected _attributes: Attributes;
	    protected _state: SyntaxParsingState;
	    protected _rejections: ParsedToken[];
	    protected _tokens: ParsedToken[];
	    protected _queryWhitespace: (token: string) => boolean;
	    error: Error;
	    constructor(attributes: Attributes);
	    get state(): SyntaxParsingState;
	    get attributes(): Attributes;
	    get tokens(): ParsedToken[];
	    get trackBack(): ParsedToken[];
	    set queryWhitespace(delegate: (token: string, ...rest: unknown[]) => boolean);
	    consume(token: ParsedToken): boolean;
	    clone(): IForgeSyntaxExpression;
	    frame(): void;
	}
	
	
	
	
	export class ScopeExpression extends ForgeSyntaxExpression {
	    private _openToken;
	    private _closeToken;
	    private _consumeStack;
	    constructor(openToken: string, closeToken: string);
	    constructor(openToken: string, closeToken: string, attributes: Attributes);
	    private _defaultConsume;
	    private _scopeConsume;
	    consume(token: ParsedToken): boolean;
	    clone(): IForgeSyntaxExpression;
	    frame(): void;
	}
	
	
	
	
	export type CompositeComponent = RegExp | string | ((token: string) => boolean) | IForgeSyntaxExpression;
	export class SequentialExpression extends ForgeSyntaxExpression {
	    static MatchString: RegExp;
	    private _matcher;
	    private _cursor;
	    private readonly _components;
	    /**
	     * Matches a sequence in sequential order
	     * @param attributes use as descriptor attributes when the expression is parsed
	     */
	    constructor(attributes: Attributes);
	    private _initialMatch;
	    private _consumeMatch;
	    get tokens(): ParsedToken[];
	    consume(token: ParsedToken): boolean;
	    add(component: RegExp | string | ((token: string) => boolean) | IForgeSyntaxExpression, attributes: Attributes): this;
	    add(component: RegExp | string | ((token: string) => boolean) | IForgeSyntaxExpression, attributes: Attributes, modifiers: {
	        required?: boolean;
	        whitespace?: boolean;
	    }): this;
	    frame(): void;
	    clone(): IForgeSyntaxExpression;
	}
	
	export class HTTPLoader {
	    static $Parse<T = unknown>(value: string): Promise<T>;
	    static $Parse<T = unknown>(value: string, requestInit: RequestInit): Promise<T>;
	}
	
	
	export function EncodeNumber(value: number): ArrayBuffer;
	export function EncodeNumber(value: number, data: ArrayBuffer): ArrayBuffer;
	export function DecodeNumber(data: ArrayBuffer): number;
	export function EncodedStringSize(value: string): number;
	export function EncodeString(value: string): ArrayBuffer;
	export function DecodeString(buffer: ArrayBufferLike): string;
	export function DecodeAttributes(buffer: ArrayBufferLike): Attributes | unknown[];
	export function DecodeAttributes(buffer: ArrayBufferLike, reviver: (this: any, key: string, value: unknown) => any): Attributes | unknown[];
	export function EncodeAttributes(attributes: Attributes | unknown[]): ArrayBuffer;
	export function EncodeAttributes(attributes: Attributes | unknown[], replacer: (this: any, key: string, value: unknown) => any): ArrayBuffer;
	export class Base64 {
	    static ArrayBuffer(input: string): ArrayBufferLike;
	    static String(input: string): string;
	    static JSON(input: string, reviver?: (key: string, value: unknown, context?: Record<string, unknown>) => unknown): Record<string, unknown>;
	    static Encode(input: ArrayBuffer | Record<string, unknown> | string, replacer?: (key: string, value: unknown) => unknown): string;
	    static Replacer(key: string, value: unknown): unknown;
	    static Reviver(this: any, key: string, value: unknown): any;
	}
	
	export class JSONLoader {
	    static $Parse<T = unknown>(value: string): Promise<T>;
	}
	
	export class CompositeLoader {
	    static $Parse<T = unknown>(target: string): Promise<T>;
	    static $Parse<T = unknown>(target: string, options: {
	        http: RequestInit;
	    }): Promise<T>;
	}
	
	
	export class StdinArgumentPackage extends ArgumentPackage {
	    $parse(race: number): Promise<void>;
	}
	
	
	export type SessionResult<T> = [T, undefined] | [undefined, unknown];
	export class GenericSession<T> {
	    protected readonly _$promise: $Promise<SessionResult<T>>;
	    protected _timeout: TimeoutClear | undefined;
	    readonly $promise: Promise<SessionResult<T>>;
	    constructor();
	    constructor(options: {
	        race?: number;
	        capture?: Capture;
	    });
	    renew(delay: number): this;
	    stop(): this;
	    resolve(value: T): void;
	    reject(error: unknown): void;
	}
	
	
	
	
	export interface IResponseSocket {
	    setHeader(key: string, value: string): void;
	    status(status: number | string): void;
	    write(data: unknown): void;
	    end(...rest: unknown[]): void;
	}
	export class ForgeResponse {
	    private _socket;
	    private _resolved;
	    private _rejected;
	    authorized: boolean | undefined;
	    private _$end;
	    private _open;
	    readonly headers: ServeHeaders;
	    readonly writes: IQuery<SerializeData>;
	    constructor();
	    constructor(socket: IResponseSocket);
	    get open(): boolean;
	    get resolved(): boolean | undefined;
	    get rejected(): boolean | undefined;
	    end(): void;
	    import(data: Serialize): this;
	    $export(): Promise<Serialize>;
	    sync(response: ForgeResponse): void;
	    resolve(value: boolean): void;
	    reject(value: boolean): void;
	}
	
	
	
	
	
	
	
	export type ForgeServlet = {
	    [Reactivity]: IReactor<{
	        signal: Signal;
	        request: ForgeRequest;
	        response: ForgeResponse;
	    }>;
	};
	type ForgeServletConstructor = {
	    new (port: number): ForgeServlet;
	};
	export class ServeHeaders {
	    readonly query: IQuery<Serialize>;
	    [Symbol.iterator](): IterableIterator<[Serialize, Attributes]>;
	    add(header: Serialize, attributes: Attributes): this;
	    sync(headers: ServeHeaders): void;
	    get<T = SerializeData>(key: string): T | undefined;
	    first<T = SerializeData>(regExp: RegExp): T | undefined;
	    last<T = SerializeData>(regExp: RegExp): T | undefined;
	    all<T = SerializeData>(regExp: RegExp): T[];
	    squash(): Serialize;
	    import(buffer: ArrayBuffer): this;
	    export(): ArrayBuffer;
	}
	export class ForgeServletFactory {
	    private readonly _classRef;
	    private readonly _servers;
	    constructor(classRef: ForgeServletConstructor);
	    [Reactivity]: IReactor<{
	        signal: Signal;
	        request: ForgeRequest;
	        response: ForgeResponse;
	    }>;
	    [Symbol.iterator](): IterableIterator<[number, ForgeServlet]>;
	    create(port: number): ForgeServlet;
	    has(port: number): boolean;
	    get(port: number): ForgeServlet | undefined;
	}
	
	
	
	
	
	
	
	type RequestData = Serialize | $Serialize | (() => $Serialize);
	export type ForgeRequestInit = {
	    headers?: IQuery<Serialize>;
	    payloads?: IQuery<RequestData>;
	    session?: GenericSession<Serialize>;
	};
	export type ForgeRequestExport = {
	    headers: [Serialize, Attributes][];
	    payloads: [Serialize, Attributes][];
	};
	export interface IRequestRead {
	    $read(): ArrayBuffer | Promise<ArrayBuffer>;
	}
	export class LocalRequestRead {
	    private _buffer;
	    constructor(buffer: ArrayBuffer);
	    $read(): Promise<ArrayBuffer>;
	}
	export class ForgeRequest {
	    private _$promise;
	    private _timeout;
	    key: string | undefined;
	    race: number;
	    session: string | undefined;
	    readonly headers: ServeHeaders;
	    readonly reads: IQuery<IRequestRead>;
	    readonly socket: IForgeSocket | undefined;
	    constructor();
	    constructor(socket: IForgeSocket);
	    get $race(): Promise<undefined>;
	    expiry(race: number): void;
	    import(data: Serialize): this;
	    $export(): Promise<Serialize>;
	    sync(request: ForgeRequest): void;
	}
	
	
	
	
	
	
	
	export const ForgeProtocol: string;
	export type Signal = {
	    [name: string]: Signal | string | number | boolean | (string | number | boolean)[];
	};
	export type SignalConstraint = {
	    race: number;
	    capture?: Capture;
	};
	export type SocketSession = GenericSession<[ForgeRequest, ForgeResponse]>;
	export type SignalResult = SessionResult<[ForgeRequest, ForgeResponse]>;
	export type SocketReaction = {
	    socket: IForgeSocket;
	    protocol: string;
	    signal: Signal;
	    request: ForgeRequest;
	    response: ForgeResponse;
	};
	type MultiPartHeader = {
	    multi_part: string;
	    frames: number;
	    race: number;
	};
	export type SocketConfig = {
	    command?: string;
	    debounce?: number;
	    stdio?: string;
	    constraint: {
	        race: number;
	        capture?: Capture;
	    };
	    env?: Record<string, string>;
	    key?: string;
	    reboot?: boolean;
	};
	export class SignalConstraints {
	    private _entries;
	    default: SignalConstraint;
	    constructor(init: SignalConstraint);
	    set(signal: Signal, constraints: SignalConstraint): this;
	    get(signal: Signal): SignalConstraint;
	}
	export interface IForgeSocket {
	    [Reactivity]: IReactor<SocketReaction>;
	    get key(): string;
	    get name(): string;
	    get $ready(): Promise<Serialize>;
	    get constraints(): SignalConstraints;
	    $read(message: [string, Signal, Serialize, Serialize]): Promise<void>;
	    write(protocol: string, ...rest: Serialize[]): void;
	    resolve(request: ForgeRequest, response: ForgeResponse): void;
	    reject(request: ForgeRequest, response: ForgeResponse): void;
	    $connect(data: Serialize): Promise<Serialize>;
	    $frame(data: Serialize): Promise<SignalResult>;
	    $flush(data: Serialize): Promise<SignalResult>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    $send(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $reboot(): Promise<void>;
	}
	class MultiPartCollector {
	    private readonly _$complete;
	    private readonly _$parts;
	    constructor(header: MultiPartHeader, capture: Capture);
	    get $complete(): Promise<ArrayBuffer>;
	    add(index: number, buffer: ArrayBuffer): void;
	}
	export class AbstractForgeSocket implements IForgeSocket {
	    protected _name: string;
	    protected _key: string;
	    protected _reboot: boolean;
	    protected _$local: $Promise<Serialize>;
	    protected _$remote: $Promise<Serialize>;
	    constraints: SignalConstraints;
	    protected readonly _sessions: Map<string, SocketSession>;
	    protected readonly _bindings: Map<Function, Function>;
	    protected readonly _collectors: Map<string, MultiPartCollector>;
	    [Reactivity]: IReactor<SocketReaction>;
	    constructor(name: string, config: SocketConfig);
	    protected _reserveSession(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    protected _$thenConnect(data: Serialize): Promise<SignalResult>;
	    protected _readDecoded(buffer: ArrayBuffer): void;
	    get key(): string;
	    get name(): string;
	    get $ready(): Promise<{
	        local: Serialize;
	        remote: Serialize;
	    }>;
	    /**
	     * Starts the pairing process to socket for bi-direcrional communication
	     *
	     * @param {Attributes} data data used on the remote side to help init the connection process.
	     * @returns {Serialize} returns data sent from remote ForgeSocket.$connect( ... ) instance
	     */
	    $connect(data: Serialize): Promise<Serialize>;
	    $read(message: [string, Signal, Serialize, Serialize]): Promise<void>;
	    resolve(request: ForgeRequest, response: ForgeResponse): void;
	    reject(request: ForgeRequest, response: ForgeResponse): void;
	    $frame(data: Serialize): Promise<SignalResult>;
	    $flush(data: Serialize): Promise<SignalResult>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    $send(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    write(protocol: string, signal: Signal | Serialize, ...rest: Serialize[]): void;
	    $reboot(): Promise<void>;
	}
	
	
	
	
	
	
	export const ForgePackageSanitizeSuccessAttributes: {
	    forge: boolean;
	    sanitize: boolean;
	    success: boolean;
	};
	export class ForgePackageSanitize extends AsyncArgumentPackageSanitize {
	    constructor();
	    constructor(options: AsyncPackageSanitizeOptions);
	    authorize(packaging: IArgumentPackage): boolean;
	    $frame(query: IQuery<ArgumentPackageComponent>): Promise<void>;
	    $sanitize(component: ArgumentPackageComponent, attributes: Attributes): Promise<Attributes>;
	    validate(packaging: IArgumentPackage): void;
	}
	
	
	
	
	
	export const ForgePackageValidateSuccessAttributes: {
	    forge: boolean;
	    validate: boolean;
	    success: boolean;
	};
	export class ForgePackageValidate extends AsyncArgumentPackageValidate {
	    $flush(query: IQuery<ArgumentPackageComponent>, validations: ArgumentValidations): Promise<void>;
	}
	
	
	
	
	
	
	export const ForgeParamsKeys: Set<string>;
	export type ForgeWatchParams = {
	    roots: string[];
	    debounce?: number;
	    threshold?: number;
	    ignores?: string[];
	    actions: {
	        filter: RegExp;
	        data: Attributes;
	        trigger: string;
	        race: number;
	    }[];
	};
	export type ForgeWorkerParams = {
	    name: string;
	    script: string;
	    signals: string[];
	    data: Attributes;
	    connect: Attributes;
	    race: number;
	};
	export type HTTPActionParams = {
	    url: RegExp;
	    signal: Signal;
	};
	export type ForgeParams = Partial<{
	    watch: ForgeWatchParams;
	    workers: ForgeWorkerParams[];
	    http: {
	        port?: number;
	        root?: string;
	        caching?: boolean;
	        actions?: HTTPActionParams[];
	    };
	    socket: {
	        port: number;
	    };
	    imports: string[];
	    model: {
	        read?: string;
	        write?: string;
	    };
	    start: Attributes;
	}>;
	export class ForgePackage extends ArgumentPackage {
	    static $From(packages: IArgumentPackage[]): Promise<IArgumentPackage>;
	    $validate(): Promise<this>;
	    $validate(validator: IAsyncPackageValidator): Promise<this>;
	    $sanitize(): Promise<IArgumentPackage>;
	    $sanitize(sanitizer: IAsyncPackageSanitizer): Promise<IArgumentPackage>;
	}
	
	
	export function $GetApplicationArguments(): Promise<IArgumentPackage>;
	
	
	
	
	/**
	 * Ac omponent used to dispatch messages after being authorized
	 * @interface
	 */
	export interface IForgeTrigger {
	    /**
	     * Member called after message was authroized
	     * @member
	     * @param {Signal} signal - Simple object used to help authorize messages
	     * @param {ForgeRequest} request - Request headers and data sent with each message
	     * @param {ForgeResponse} response - Response headers and data received after dispatching
	     */
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	/**
	 * Ac omponent used to dispatch messages after being authorized
	 * @class
	 */
	export class ForgeTrigger implements IForgeTrigger {
	    /**
	     * Member called after message was authroized
	     * @member
	     * @param {Signal} signal - Simple object used to help authorize messages
	     * @param {ForgeRequest} request - Request headers and data sent with each message
	     * @param {ForgeResponse} response - Response headers and data received after dispatching
	     */
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	
	
	export enum ResolverOperators {
	    Or = 0,
	    And = 1
	}
	/**
	 * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
	 *
	 * @typedef {Object} ActionInit
	 *
	 * @property {(string|undefined)} name - (optional) the default error message.
	 * @property {(boolean)} enabled - A callback to transform the supplied value for an aurgument.
	 *
	 */
	export type ActionInit = {
	    enabled: boolean;
	    name?: string;
	    resolver?: ResolverOperators;
	};
	export enum ActionState {
	    Pending = 0,
	    Authorized = 1,
	    Resolved = 2,
	    Rejected = 3
	}
	export interface IAction {
	    name: string;
	    state: ActionState;
	    add(trigger: IForgeTrigger): this;
	    remove(trigger: IForgeTrigger): this;
	    $frame(data: Serialize): Promise<void>;
	    $flush(data: Serialize): Promise<void>;
	    $authorize(signal: Signal, request: ForgeRequest, respone: ForgeResponse): Promise<boolean>;
	    $signal(signal: Signal, request: ForgeRequest, respone: ForgeResponse): Promise<void>;
	}
	/**
	 * ForgeAction is the base class to eval signal dispatching from triggers, dispatch `$signals`, route requests, or stream output during `ForgeStream.$signal( ... )`
	 *
	 */
	export class ForgeAction extends Subscription implements IAction {
	    protected readonly _triggers: Set<IForgeTrigger>;
	    protected _resolver: ResolverOperators;
	    name: string;
	    enabled: boolean;
	    protected _state: ActionState;
	    constructor(init: ActionInit);
	    get state(): ActionState;
	    set state(value: ActionState);
	    add(trigger: IForgeTrigger): this;
	    remove(trigger: IForgeTrigger): this;
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $frame(data: Serialize): Promise<void>;
	    $flush(data: Serialize): Promise<void>;
	}
	
	
	
	
	
	
	export class SignalAction extends ForgeAction {
	    private _sequence;
	    constructor(init: ActionInit);
	    constructor(init: ActionInit, sequence: QuerySequence);
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	
	
	export class ForgeController {
	    readonly actions: IQuery<IAction>;
	    readonly settled: Set<IAction>;
	    readonly resolves: Set<IAction>;
	    readonly rejections: Set<IAction>;
	    find(name: string): IAction | undefined;
	    $frame(data: Serialize): Promise<void>;
	    $flush(data: Serialize): Promise<void>;
	    $signal(signal: Signal, resquest: ForgeRequest, response: ForgeResponse): Promise<Map<IAction, ForgeResponse>>;
	}
	
	
	
	
	
	
	
	/**
	 * Struct to configure a trigger and dispatch action
	 * @typedef {object} DispatchParams
	 * @property {string} command - Parameter used by the _dispatcher_ to construct a message when triggered
	 * @property {[Serialize, Attributes][]} [headers] - Headers for constructing a message
	 * @property {[ArrayBuffer, Attributes][]} [reads] - Data chunks for constructing a message
	 */
	export type DispatchParams = {
	    command: string;
	    headers?: [Serialize, Attributes][];
	    reads?: [ArrayBuffer, Attributes][];
	};
	/**
	 *
	 */
	export type $AuthorizeDispatch = (signal: Signal, ...rest: any[]) => Promise<boolean> | boolean;
	export type ForgeReactorDispatch = {
	    $authorize: $AuthorizeDispatch;
	    trigger: IForgeTrigger;
	    params: DispatchParams;
	};
	/**
	 * A component that each _Forge_ instance uses to customize it dispatching from it's internal _Reactor_
	 */
	export class ForgeReactor extends Reactor<{
	    signal: Signal;
	    request: ForgeRequest;
	    response: ForgeResponse;
	}> {
	    /**
	     * List of all the registered dispatchers to be used by _Forge's_ _Reactor_
	     * @type {ForgeReactorDispatch[]}
	     * @public
	     */
	    dispatches: ForgeReactorDispatch[];
	    /**
	     * add another dipatcher and uses the authorize
	     * @member
	     * @param {DispatchParams} params -
	     * @param {$AuthorizeDispatch} $authorize -
	     * @returns {this} The current instance
	     */
	    add(params: DispatchParams, $authorize: $AuthorizeDispatch): this;
	}
	
	
	export class Topology<T = unknown> {
	    static Deserialize<T>(data: [T, Attributes, number][], replacer: (data: any) => unknown): Topology;
	    static Serialize<T>(tree: Topology<T>, replacer?: (source: T) => JSON): any[];
	    protected readonly _parentMap: Map<T, T>;
	    protected readonly _childMap: Map<T, T[]>;
	    protected readonly _attributeMap: Map<T, Attributes>;
	    private _sortChildren;
	    constructor();
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    protected _detach(source: T): void;
	    protected _delete(source: T): void;
	    get size(): number;
	    attributes(source: T): Attributes | undefined;
	    attributes(source: T, attributes: Attributes): Attributes | undefined;
	    traverse(source: T, traversal: Set<T>): Set<T>;
	    index(source: T): number;
	    add(source: T, attributes: Attributes): this;
	    add(source: T, attributes: Attributes, parent: T): this;
	    remove(source: T): this;
	    purge(source: T): void;
	    move(source: T, parent: T, insert?: number): this;
	    order(parent: T, children: T[]): T[];
	    mutate(source: T, target: T): void;
	    parent(child: T): T;
	    children(): T[];
	    children(source: T): T[];
	    siblings(source: T): Set<T>;
	    ancestry(source: T): T[];
	    depth(): number;
	    depth(source: T): number;
	    has(source: T): boolean;
	    clear(): T[];
	}
	
	
	export class DataStreamWriter {
	    static Flush(contents: string | number | Attributes | ArrayBuffer): ArrayBuffer;
	    private _queue;
	    private _frames;
	    private _queueSize;
	    get size(): number;
	    write(value: number): this;
	    write(value: string): this;
	    write(attributes: Attributes): this;
	    write(data: ArrayBuffer): this;
	    frame(): void;
	    flush(): ArrayBuffer;
	}
	export class DataStreamReader {
	    private _start;
	    private _cursor;
	    private _data;
	    private _dataView;
	    private _size;
	    constructor(data: ArrayBuffer);
	    constructor(data: ArrayBuffer, cursor: number);
	    [Symbol.iterator](): IterableIterator<ArrayBuffer>;
	    protected _readNumber(): number;
	    protected _readCharCode(): number;
	    get size(): number;
	    get cursor(): number;
	    read(): ArrayBuffer;
	    peek(offset: number): ArrayBuffer;
	    frame(): void;
	    complete(): boolean;
	    skip(): void;
	    readString(): string;
	    readAttributes(): Attributes;
	}
	
	
	
	
	
	export type UpgradeParams = [Attributes, ...rest: unknown[]];
	export enum ForgeStoreMime {
	    Released = "forge/released",
	    Undefined = "forge/undefined",
	    Number = "forge/number",
	    Binary = "forge/binary",
	    JSON = "application/json; charset=utf-16",
	    Text = "text/plain"
	}
	export type ForgeStoreExport = {
	    header: ArrayBuffer;
	    attributes: ArrayBuffer;
	    parent: ArrayBuffer;
	    hash: ArrayBuffer;
	    mime: ArrayBuffer;
	    data?: ArrayBuffer;
	} & Record<string, ArrayBuffer>;
	export function $CompareStores(iStoreA: IForgeStore, iStoreB: IForgeStore): Promise<boolean>;
	export type StoreUpgradeQuery = {
	    delegate: QueryDelegate;
	    parameters: UpgradeParams;
	    recursive: boolean;
	};
	export interface IForgeStore {
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    get hash(): string;
	    get attributes(): Attributes;
	    get $children(): Promise<IForgeStore[]>;
	    get $parent(): Promise<IForgeStore>;
	    get $ancestry(): Promise<IForgeStore[]>;
	    $ready(race: number): Promise<IForgeStore>;
	    $connect(model: IForgeModel): Promise<IForgeStore>;
	    $purge(): Promise<IForgeStore[]>;
	    $branch(iForgeStore: IForgeStore): Promise<IForgeStore>;
	    $fork(): Promise<IForgeStore>;
	    $fork(mappings: Map<IForgeStore, IForgeStore>): Promise<IForgeStore>;
	    $fork(mappings?: Map<IForgeStore, IForgeStore>): Promise<IForgeStore>;
	    $clone(): Promise<IForgeStore>;
	    $order(iForgeStores: IForgeStore[]): Promise<void>;
	    $find(callback: (value: IForgeStore, attributes: Attributes) => boolean): Promise<IForgeStore[]>;
	    $upgrade(queries: StoreUpgradeQuery[]): Promise<IForgeStore[]>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(recursive: boolean): Promise<IQuery<IForgeStore>>;
	    $write(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $mutate(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $read(): Promise<[ArrayBuffer, string]>;
	    $import(readStream: DataStreamReader): Promise<this>;
	    $export(): Promise<ForgeStoreExport>;
	    $export(excludeBody: boolean): Promise<ForgeStoreExport>;
	    $stream(): Promise<ArrayBuffer>;
	    $stream(excludeBody: boolean): Promise<ArrayBuffer>;
	    $lock(): Promise<void>;
	    $unlock(): Promise<void>;
	    $hasLock(): Promise<boolean>;
	    $render<T = string>(options: {
	        $onStartGroup?: (iStore: IForgeStore, previousParent: IForgeStore) => Promise<T>;
	        $onRender?: (iStore: IForgeStore) => Promise<T>;
	        $onEndGroup?: (iStore: IForgeStore, previousParent: IForgeStore) => Promise<T>;
	    }): AsyncIterableIterator<T>;
	}
	export class ForgeStore implements IForgeStore {
	    static AssignHash(iStore: ForgeStore, hash: string): void;
	    static Null: string;
	    static Header: string;
	    static Race: number;
	    static Empty(attributes: Attributes): ForgeStore;
	    static Number(attributes: Attributes, value: number): ForgeStore;
	    static JSON(attributes: Attributes, value: Record<string, unknown>): ForgeStore;
	    static Binary(attributes: Attributes, value: ArrayBuffer): IForgeStore;
	    static String(attributes: Attributes, value: string): IForgeStore;
	    static Store(attributes: Attributes, value: ArrayBuffer, mime: string): IForgeStore;
	    protected _mime: string;
	    protected _attributes: Attributes;
	    protected _hash: string;
	    protected _lock: string;
	    protected _releasedStore: IForgeStore;
	    protected readonly _$onModelConnected: $Promise<IForgeModel>;
	    protected readonly _$model: $Promise<IForgeModel>;
	    protected readonly _$onReleased: $Promise<IForgeStore>;
	    protected readonly _$body: $Promise<[ArrayBuffer, string]>;
	    protected readonly _$ready: $Promise<this>;
	    constructor(attributes: Attributes);
	    constructor(readStream: DataStreamReader);
	    constructor(attributes: Attributes, model: IForgeModel);
	    constructor(readStream: DataStreamReader, model: IForgeModel);
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    private _$thenChildren;
	    private _$thenAncestry;
	    private _$thenParent;
	    _import(streamReader: DataStreamReader): {
	        hash: string;
	        parent: string;
	        attributes: Attributes;
	        mime: string;
	        data: ArrayBuffer;
	    };
	    protected _$raceIModel(): Promise<IForgeModel>;
	    protected _$thenConnectModel: any;
	    get hash(): string;
	    get attributes(): Attributes;
	    get $children(): Promise<IForgeStore[]>;
	    get $parent(): Promise<IForgeStore>;
	    get $ancestry(): Promise<IForgeStore[]>;
	    /**
	     *
	     * Public members
	     *
	     */
	    write(buffer: ArrayBuffer, mime: string): this;
	    $ready(race: number): Promise<IForgeStore>;
	    $connect(model: IForgeModel): Promise<IForgeStore>;
	    $lock(): Promise<void>;
	    $unlock(): Promise<void>;
	    $hasLock(): Promise<boolean>;
	    $purge(): Promise<IForgeStore[]>;
	    $branch(child: IForgeStore): Promise<IForgeStore>;
	    $fork(): Promise<IForgeStore>;
	    $fork(mappings: Map<IForgeStore, IForgeStore>): Promise<IForgeStore>;
	    $clone(): Promise<IForgeStore>;
	    $order(iForgeStores: IForgeStore[]): Promise<void>;
	    $write(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $read(): Promise<[ArrayBuffer, string]>;
	    $mutate(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(recursive: boolean): Promise<IQuery<IForgeStore>>;
	    $upgrade(queries: StoreUpgradeQuery[]): Promise<IForgeStore[]>;
	    $find(callback: (iforgeStore: IForgeStore, attributes: Attributes) => boolean): Promise<IForgeStore[]>;
	    $import(readStream: DataStreamReader): Promise<this>;
	    $export(): Promise<ForgeStoreExport>;
	    $export(excludeBody: boolean): Promise<ForgeStoreExport>;
	    $stream(): Promise<ArrayBuffer>;
	    $stream(excludeBody: boolean): Promise<ArrayBuffer>;
	    $render<T = string>(options: {
	        $onStartGroup?: (iStore: IForgeStore, previousParent: IForgeStore) => Promise<T>;
	        $onRender?: (iStore: IForgeStore) => Promise<T>;
	        $onEndGroup?: (iStore: IForgeStore, previousParent: IForgeStore) => Promise<T>;
	    }): AsyncIterableIterator<T>;
	    toString(): string;
	}
	
	
	
	
	
	
	
	
	export class AbstractForgeModelProxy extends Subscription implements IForgeModelProxy {
	    protected _model: IForgeModel;
	    protected _bindings: Map<Function, Function>;
	    constructor(iModel: IForgeModel);
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    $activate(): Promise<void>;
	    $deactivate(): Promise<void>;
	    $lock(store: IForgeStore): Promise<void>;
	    $unlock(hash: string): Promise<void>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $read(store: IForgeStore): Promise<void>;
	    $write(oldStore: IForgeStore, data: ArrayBuffer, mime: string): Promise<void>;
	    $purge(store: IForgeStore): Promise<void>;
	    $connect(store: IForgeStore, hash: string): Promise<void>;
	    $mutate(store: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	export class ForgeModelProxyManager {
	    private readonly _proxies;
	    [Symbol.iterator](): IterableIterator<[IForgeModelProxy, Attributes]>;
	    $add(proxy: IForgeModelProxy, attributes: Attributes): Promise<void>;
	    remove(proxy: IForgeModelProxy): Promise<void>;
	    $connect(store: IForgeStore, hash: string): Promise<void>;
	    $mutate(store: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $read(store: IForgeStore): Promise<void>;
	    $write(store: IForgeStore, data: ArrayBuffer, mime: string): Promise<void>;
	    $purge(store: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	
	
	
	
	
	
	export function $CompareModels(iModelA: IForgeModel, iModelB: IForgeModel): Promise<boolean>;
	type ModelReactorKey = "connect" | "write" | "mutate" | "branch" | "fork" | "purge" | "order" | "lock" | "unlock" | "frame";
	export type ModelReactorState = {
	    [key in ModelReactorKey]?: IForgeStore[];
	};
	export class ModelReactor extends Reactor<ModelReactorState> {
	    private readonly _stores;
	    constructor();
	    /**
	     * All setters will dispatch subscriptions
	     * @param state
	     * @param previous
	     * @returns
	     */
	    frame(): void;
	}
	export interface IForgeModel {
	    race: number;
	    [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    [Reactivity]: IReactor<ModelReactorState>;
	    get proxies(): ForgeModelProxyManager;
	    get state(): string;
	    get root(): IForgeStore;
	    get(hash: string): IForgeStore | undefined;
	    $hash(iStore: IForgeStore): Promise<string | undefined>;
	    $attributes(iStore: IForgeStore): Promise<Attributes | undefined>;
	    $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $parent(iStore: IForgeStore): Promise<IForgeStore>;
	    $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $traverse(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(parent: IForgeStore): Promise<IQuery<IForgeStore>>;
	    $query(parent: IForgeStore, recursive: boolean): Promise<IQuery<IForgeStore>>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<IForgeStore>;
	    $read(iStore: IForgeStore): Promise<[ArrayBuffer, string]>;
	    $hasLock(iStore: IForgeStore): Promise<boolean>;
	    $lock(iStore: IForgeStore): Promise<string>;
	    $unlock(hash: string): Promise<IForgeStore>;
	    $connect(iStore: IForgeStore): Promise<string>;
	    $connect(iStore: IForgeStore, options: {
	        parent: IForgeStore;
	    }): Promise<string>;
	    $connect(iStore: IForgeStore, options: {
	        data: ArrayBuffer;
	        mime: string;
	    }): Promise<string>;
	    $connect(iStore: IForgeStore, options: {
	        parent: IForgeStore;
	        data: ArrayBuffer;
	        mime: string;
	    }): Promise<string>;
	    $purge(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $import(iStore: IForgeStore, importData: {
	        parent: string;
	        data: ArrayBuffer;
	        mime: string;
	    }): Promise<IForgeStore>;
	    $wait(hash: string): Promise<IForgeStore>;
	    $frame(): Promise<this>;
	    $flush(): Promise<this>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	export interface IForgeModelProxy {
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    $activate(): Promise<void>;
	    $deactivate(): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $lock(store: IForgeStore): Promise<void>;
	    $unlock(hash: string): Promise<void>;
	    $connect(iStore: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $read(iStore: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string): Promise<void>;
	    $purge(iStore: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	export class ForgeModel implements IForgeModel {
	    protected _root: IForgeStore;
	    protected _state: string;
	    protected _proxies: ForgeModelProxyManager;
	    protected readonly _topology: Topology<IForgeStore>;
	    protected readonly _hashes: Map<IForgeStore, string>;
	    protected readonly _$bodies: Map<IForgeStore, [ArrayBuffer, string]>;
	    protected readonly _waitingStores: Map<string, $Promise<IForgeStore>>;
	    protected readonly _locks: Map<IForgeStore, string>;
	    readonly [Reactivity]: IReactor<ModelReactorState>;
	    race: number;
	    constructor();
	    constructor(attributes: Attributes);
	    constructor(root: IForgeStore);
	    [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    protected _nextHash(): string;
	    protected _$reserve(hash: string): $Promise<IForgeStore>;
	    protected _$remove(store: IForgeStore): Promise<void>;
	    get state(): string;
	    get root(): IForgeStore;
	    get proxies(): ForgeModelProxyManager;
	    $hash(store: IForgeStore): Promise<string | undefined>;
	    $attributes(store: IForgeStore): Promise<Attributes | undefined>;
	    $children(store: IForgeStore): Promise<IForgeStore[]>;
	    $parent(store: IForgeStore): Promise<IForgeStore>;
	    $ancestry(store: IForgeStore): Promise<IForgeStore[]>;
	    get(query: string): IForgeStore | undefined;
	    $fork(stores: IForgeStore[], options?: {
	        topology?: boolean;
	        root?: Attributes;
	        mappings?: Map<IForgeStore, IForgeStore>;
	    }): Promise<IForgeModel>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $traverse(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $connect(store: IForgeStore): Promise<string>;
	    $connect(store: IForgeStore, options: {
	        parent: IForgeStore;
	        hash?: string;
	    }): Promise<string>;
	    $connect(store: IForgeStore, options: {
	        data: ArrayBuffer;
	        mime: string;
	        hash?: string;
	    }): Promise<string>;
	    $connect(store: IForgeStore, options: {
	        parent: IForgeStore;
	        data: ArrayBuffer;
	        mime: string;
	        hash?: string;
	    }): Promise<string>;
	    $purge(store: IForgeStore): Promise<IForgeStore[]>;
	    $hasLock(store: IForgeStore): Promise<boolean>;
	    $lock(store: IForgeStore): Promise<string>;
	    $unlock(hash: string): Promise<IForgeStore>;
	    $import(iStore: IForgeStore, importData: {
	        parent: string | IForgeStore;
	        data: ArrayBuffer;
	        mime: string;
	    }): Promise<IForgeStore>;
	    $frame(): Promise<this>;
	    $flush(): Promise<this>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(root: IForgeStore): Promise<IQuery<IForgeStore>>;
	    $query(root: IForgeStore, recursive: boolean): Promise<IQuery<IForgeStore>>;
	    $write(store: IForgeStore, data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $mutate(store: IForgeStore, mutatedStore: IForgeStore): Promise<IForgeStore>;
	    $validate(iStore: IForgeStore): $IResult<Attributes>;
	    $wait(hash: string): Promise<IForgeStore>;
	    $read(iStore: IForgeStore): Promise<[ArrayBuffer, string]>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    toString(): string;
	}
	
	
	export type DebounceDelegate = (caller: unknown, ...rest: unknown[]) => unknown | void;
	export class Debounce {
	    private _timeout;
	    private readonly _refresh;
	    private readonly _timeoutCompleteBinded;
	    race: number;
	    constructor(race: number);
	    private _onTimeoutComplete;
	    refresh(callback: DebounceDelegate): void;
	    refresh(callback: DebounceDelegate, options: {
	        context?: unknown;
	        rest?: unknown[];
	    }): void;
	    clear(): void;
	}
	
	
	
	export class ForgeFileWatcher extends Subscription {
	    static Default: {
	        Threshold: number;
	        Debouce: number;
	    };
	    private _abortController;
	    private _ignores;
	    private readonly _targets;
	    private readonly _reactor;
	    private readonly _fileStats;
	    private readonly _debounce;
	    private readonly _files;
	    threshold: number;
	    constructor(targets: string[], options: {
	        threshold?: number;
	        debounce?: number;
	        ignores?: string[];
	    });
	    private _onDebounceFileChange;
	    [Symbol.dispose](): void;
	    [Reactivity](): IReactor<{
	        file: string;
	        event: string;
	    }[]>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<{
	        file: string;
	        event: string;
	    }[]>;
	    protected _$watchFiles(event: string, file: string): Promise<void>;
	    abort(): void;
	}
	
	
	
	
	export type RouteSignal = Signal & {
	    route: string;
	    method: string;
	    routing: string;
	};
	export type RouteDelegate = (signal: RouteSignal, forgeRequest: ForgeRequest, response: ForgeResponse) => Promise<boolean | undefined>;
	export interface IForgeRoute {
	    $authorize: RouteDelegate;
	    $resolve: RouteDelegate;
	    $reject: RouteDelegate;
	    $finally: RouteDelegate;
	}
	export type IForgeRouteHook = {
	    $authorize?: RouteDelegate;
	    $resolve?: RouteDelegate;
	    $reject?: RouteDelegate;
	    $finally?: RouteDelegate;
	};
	export function AuthorizeString(...matches: string[]): RouteDelegate;
	export function AuthorizeRegExp(regExp: RegExp, options?: {
	    groups?: string;
	    index?: number;
	}): RouteDelegate;
	export class ForgeRoute implements IForgeRoute, IForgeRouteHook {
	    protected _hooks: Set<IForgeRouteHook>;
	    protected _hasAuthorizeHooks: boolean;
	    protected _hasResolveHooks: boolean;
	    protected _hasRejectHooks: boolean;
	    protected _hasFinallyHooks: boolean;
	    constructor();
	    constructor(config: {
	        hooks?: IForgeRouteHook[];
	    });
	    $authorize(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $finally(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    add(hook: IForgeRouteHook): this;
	}
	
	
	
	export class ExpressRequestHeader {
	    _descriptors: string[];
	    readonly cookies: Serialize;
	    http: Serialize;
	    constructor(request: ExpressRequestAdapter);
	    parse(raw: string): this;
	}
	
	
	
	export class ExpressRequestPayload implements IRequestRead {
	    private _adapter;
	    private _race;
	    private _buffer;
	    constructor(adapter: ExpressRequestAdapter, race: number);
	    $read(): Promise<ArrayBuffer>;
	}
	
	
	
	
	
	export type ExpressRequestAdapter = {
	    originalUrl: string;
	    protocol: string;
	    rawHeaders: string[];
	    method: string;
	    on: Function;
	    off: Function;
	    get(key: string): string;
	};
	export class ExpressHTTPServer {
	    private _express;
	    protected _$catchRoute: (error: unknown) => boolean;
	    race: number;
	    [Reactivity]: IReactor<{
	        signal: Signal;
	        request: ForgeRequest;
	        response: ForgeResponse;
	    }>;
	    constructor(port: number);
	    protected _buildRequest(request: ExpressRequestAdapter): ForgeRequest;
	    protected _buildResponse(response: IResponseSocket): ForgeResponse;
	    use(delegate: Function): void;
	    protected _$all(request: ExpressRequestAdapter, response: IResponseSocket, next: Function): Promise<void>;
	}
	
	
	
	export class ForgeWebsocket extends AbstractForgeSocket {
	    static FrameSize: number;
	    private _socket;
	    private _abort;
	    private _$online;
	    private readonly _frameSize;
	    constructor(name: string, options: SocketConfig, socket: WebSocket);
	    private _onMessage;
	    private _onOpen;
	    $connect(data: Serialize): Promise<Serialize>;
	    private _onExit;
	    private _$writeMultiPart;
	    write(protocol: string, ...rest: Serialize[]): void;
	}
	
	
	
	
	
	export class ForgeWebSocketServer {
	    private _key;
	    private _server;
	    private readonly _sockets;
	    private _router;
	    private _constraints;
	    readonly port: number;
	    [Reactivity]: IReactor<SocketReaction>;
	    constructor(port: number, race?: unknown, key?: unknown);
	    protected _$connect(socket: WebSocket): Promise<void>;
	    _$read(reaction: SocketReaction): Promise<void>;
	    get key(): string;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	
	export class ServletManger {
	    http: ForgeServletFactory;
	    websocket: ForgeServletFactory;
	    constructor(target: {
	        [Reactivity]: IReactor<{
	            signal: Signal;
	            request: ForgeRequest;
	            response: ForgeResponse;
	        }>;
	    });
	    [Symbol.iterator](): IterableIterator<[number, ForgeServlet]>;
	}
	
	
	
	
	
	export class ExecSocket extends AbstractForgeSocket {
	    private _command;
	    private _config;
	    private _stdio;
	    constructor(name: string, config: SocketConfig);
	    private _injectCommand;
	    protected _pipeStdio(message: string): void;
	    protected _pipeError(message: string): void;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    send(protocol: string, ...rest: Serialize[]): void;
	}
	
	
	
	export class ForkSocket extends AbstractForgeSocket {
	    private _source;
	    private _commands;
	    private _args;
	    private _stdio;
	    constructor(name: string, config: SocketConfig, source?: any);
	    protected _pipeStdio(message: string): void;
	    protected _pipeError(message: string): void;
	    private _onExit;
	    write(protocol: string, ...rest: Serialize[]): void;
	}
	
	
	
	
	export class SpawnSocket extends AbstractForgeSocket {
	    private _source;
	    private _commands;
	    constructor(name: string, config: SocketConfig, source?: any);
	    protected _pipeStdio(message: string): void;
	    private _onExit;
	    $write(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	export class WorkerSocket extends AbstractForgeSocket {
	    private _worker;
	    private _command;
	    private readonly _$online;
	    constructor(name: string, config: SocketConfig);
	    constructor(name: string, config: SocketConfig, port: MessagePort);
	    $connect(data: Serialize): Promise<Serialize>;
	    private _onExit;
	    write(protocol: string, ...rest: Serialize[]): void;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	class RouteManager {
	    private _first;
	    private _last;
	    private _routes;
	    [Symbol.iterator](): IterableIterator<IForgeRoute>;
	    get size(): number;
	    add(route: IForgeRoute): this;
	    delete(route: IForgeRoute): this;
	    first(route: IForgeRoute): this;
	    last(route: IForgeRoute): this;
	}
	export class Forge {
	    private _state;
	    private readonly _controller;
	    /**
	     * Internal model of all registered entitites
	     * @type {IForgeModel}
	     * @readonly
	     * @public
	     */
	    readonly model: IForgeModel;
	    /**
	     * An map of all registered sockets
	     * @type {ForgeController}
	     * @readonly
	     * @public
	     */
	    readonly sockets: Map<string, IForgeSocket>;
	    /**
	     * Reactor to enabled **Reactivity**
	     * @type {ForgeReactor}
	     * @readonly
	     * @public
	     */
	    readonly [Reactivity]: ForgeReactor;
	    /**
	     * Manager instance for all servlets
	     * @type {ServletManger}
	     * @readonly
	     * @public
	     */
	    readonly servlet: ServletManger;
	    /**
	     * A manager to process all registered routes
	     * @type {RouteManager}
	     * @readonly
	     * @public
	     */
	    readonly routes: RouteManager;
	    /**
	     * A manager to process all registered routes
	     * @type {RouteManager}
	     * @readonly
	     * @public
	     */
	    readonly watch: {
	        [Symbol.iterator](): IterableIterator<ForgeFileWatcher>;
	        add(roots: string[], options: {
	            threshold?: number;
	            ignores?: string[];
	            debounce?: number;
	            throttle?: number;
	        }): ForgeFileWatcher;
	        remove(watcher: ForgeFileWatcher): void;
	    };
	    constructor();
	    protected _addSocket(key: string, socket: IForgeSocket): IForgeSocket;
	    /**
	     * Build a socket connected to a **spawned** process
	     * @method spawn
	     * @param {string} name
	     * @param {SocketConfig} config
	     * @returns {IForgeSocket} return a instance of _SpawnSocket_
	     */
	    spawn(name: string, config: SocketConfig): IForgeSocket;
	    /**
	     * Build a socket connected to a **forked** process
	     * @method fork
	     * @param {string} name
	     * @param {SocketConfig} config
	     * @returns {IForgeSocket} return a instance of _ForkSocket_
	     */
	    fork(name: string, config: SocketConfig): IForgeSocket;
	    /**
	     * Build a socket connected to a child **worker**
	     * @method worker
	     * @param {string} name
	     * @param {SocketConfig} config
	     * @returns {IForgeSocket} return a instance of _WorkerSocket_
	     */
	    worker(name: string, config: SocketConfig): IForgeSocket;
	    /**
	     * Build a socket connected to a **exec** process
	     * @method worker
	     * @param {string} name
	     * @param {SocketConfig} config
	     * @returns {IForgeSocket} return a instance of _WorkerSocket_
	     */
	    exec(name: string, config: SocketConfig): IForgeSocket;
	    /**
	     *
	     * @method add
	     * @param {IAction} action an action to be registered
	     * @param {Attributes} attributes attributes to associate with the action
	     * @returns {this} returns an instance of self
	     */
	    add(action: IAction, attributes: Attributes): this;
	    /**
	     * Marks the start of each frame. Signals each action that the frame has started.
	     * @method $frame
	     * @param {Serialize} data data passed onto each action
	     */
	    $frame(data: Serialize): Promise<void>;
	    /**
	     * Marks the end of each frame. Signals each action that the frame has ended.
	     * @method $flush
	     * @param {Serialize} data data passed onto each action
	     */
	    $flush(data: Serialize): Promise<void>;
	    /**
	     * Uses the univesal messaging bus to trigger each registered action
	     * @method $signal
	     * @param {Signal} signal a nested object to attach to each message
	     * @param {ForgeRequest} request the request component of a message to pass data
	     * @param {ForgeResponse} response the response component of a message to receive data
	     * @returns {Map<IAction, ForgeResponse>} a Map of each _IAction_ and the response
	     */
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<Map<IAction, ForgeResponse>>;
	    /**
	     * Uses routing pipeline to give each registered route a chance to resolve, reject, or observe each message
	     * @param {RouteSignal} signal a signal with a _{ route }_ intersection
	     * @param {ForgeRequest} request the request component of a message to pass data
	     * @param {ForgeResponse} response the response component of a message to receive data
	     */
	    $route(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    /**
	     * Override for gracefully aborting the current instance
	     */
	    abort(): void;
	}
	
	
	
	
	
	export class DelegateRoute extends ForgeRoute {
	    private _$authorize;
	    private _$resolve;
	    private _$reject;
	    constructor($delegates: {
	        $authorize?: RouteDelegate;
	        $resolve?: RouteDelegate;
	        $reject?: RouteDelegate;
	    });
	    $authorize(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	}
	
	export const Mimes: {
	    Find: (file: string) => string;
	    Set: (file: string, mime: string) => void;
	    $Load: (file: string) => Promise<void>;
	    $Append: () => Promise<void>;
	};
	
	
	
	
	
	export type FileRoutePathing = {
	    relative: string;
	    absolute: string;
	    base: string;
	    ext: string;
	};
	type FinallyDelegate = (signal: RouteSignal, request: ForgeRequest, response: ForgeResponse) => Promise<boolean | undefined>;
	export class FileRoute extends ForgeRoute {
	    private _file;
	    private _mime;
	    private _status;
	    private _cache;
	    constructor(config: {
	        hooks?: IForgeRouteHook[];
	        file: {
	            path: string;
	            mime?: string;
	            caching?: boolean;
	            preload?: boolean;
	        };
	        race?: number;
	        status: number;
	    });
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $invalidate(): Promise<void>;
	}
	export class FileDirectoryRoute extends ForgeRoute {
	    private _root;
	    private _indexes;
	    private _caching;
	    private readonly _$resolve;
	    private readonly _$reject;
	    readonly statuses: Map<string, ForgePathStatus>;
	    readonly cache: Map<string, ArrayBufferLike>;
	    constructor(config: {
	        root: string;
	        indexes?: string[];
	        hooks?: (IForgeRouteHook & {
	            $render?: RouteDelegate;
	        })[];
	        race?: number;
	        $resolve?: FinallyDelegate;
	        $reject?: FinallyDelegate;
	        caching?: boolean;
	    });
	    get root(): string;
	    get indexes(): string[];
	    $status(target: string): Promise<ForgePathStatus>;
	    $status(target: string, root: string): Promise<ForgePathStatus>;
	    $exists(target: string): Promise<boolean>;
	    $pathing(target: string): Promise<FileRoutePathing>;
	    $fetch(relative: string, absolute: string): Promise<ArrayBufferLike | undefined>;
	    protected _$render(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $authorize(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    add(hook: {
	        $authorize?: RouteDelegate;
	        $resolve?: RouteDelegate;
	        $reject?: RouteDelegate;
	        $finally?: RouteDelegate;
	        $render?: RouteDelegate;
	    }): this;
	    uncache(): void;
	    uncache(relative: string): void;
	}
	
	
	
	
	
	
	export class SocketRoute extends ForgeRoute {
	    private socket;
	    constructor(socket: IForgeSocket);
	    constructor(socket: IForgeSocket, config: {
	        hooks?: IForgeRouteHook[];
	    });
	    $authorize(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	}
	
	
	
	
	
	export class SocketTrigger extends ForgeTrigger {
	    private _socket;
	    constructor(socket: IForgeSocket);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	/**
	 * Factory function to verify, sanitize, and build a Forge instance from parameters from the array of packages
	 * @param {IArgumentPackage[]} packages - An array of IArgumentPackage to squash
	 * @returns A Forge instance
	 */
	export function $Run(packages: IArgumentPackage[]): Promise<Forge>;
	
	
	
	
	export class NumberArgumentSanitize extends ArgumentValueSanitize {
	    sanitize(value: unknown): unknown;
	}
	export class GlobArgumentSanitize extends AsyncArgumentValueSanitize {
	    private readonly _$ignores;
	    split: string | RegExp;
	    constructor();
	    constructor(options: AsyncValueSanitizeOptions & {
	        ignores?: string[];
	        resolve?: boolean;
	        split?: string | RegExp;
	    });
	    /**
	     * Splits each value and applies a ForgeFile.$Glob( ... ) to each of the new values
	     * @param {unknown} value sdf
	     * @returns {Promise<SanitizedArgumentValue>}
	     */
	    $sanitize(value: unknown): Promise<unknown>;
	}
	export class JSONEntriesArgumentSanitizer extends AsyncArgumentValueSanitize {
	    private split;
	    constructor();
	    constructor(options: AsyncValueSanitizeOptions & {
	        split?: string | RegExp;
	    });
	    /**
	     * Splits each value using String.split( ... ), then each entry is loaded and parsed in JSON. Next we traverse to the entry using <traversal>.
	     * Finally a internal protocol is used to extract data using the foolowing options:
	     * - json://<target_file> or json(<traversal>)://<target_file> : return the root or the traversed entry
	     * - json.keys://<target_file> or json.keys(<traversal>)://<target_file> : returns all keys iterated from the root or the traversed entry
	     * - json.values://<target_file> or json.values(<traversal>)://<target_file> : loads the <target_file> then return the root or the traversed entry
	     * @param {unknown} value to be
	     * @returns {Promise<SanitizedArgumentValue>}
	     */
	    $sanitize(value: unknown): Promise<unknown>;
	}
	
	
	export interface IValidateValueDelegates {
	    frame?: (values: unknown[], results: ArgumentValidations) => void;
	    validate?: (value: unknown, results: ArgumentValidations) => void;
	    flush?: (values: unknown[], results: ArgumentValidations) => void;
	}
	export interface IAsyncValidateValueDelegates {
	    $frame?: (values: unknown[], results: ArgumentValidations) => Promise<void>;
	    $validate?: (value: unknown, results: ArgumentValidations) => Promise<void>;
	    $flush?: (values: unknown[], results: ArgumentValidations) => Promise<void>;
	}
	export type ValueValidateOptions = {
	    help?: string;
	    error?: string;
	    required?: boolean;
	    validators?: IValidateValueDelegates[];
	};
	export type AsyncValueValidateOptions = {
	    help?: string;
	    error?: string;
	    required?: boolean;
	    validators?: IAsyncValidateValueDelegates[];
	};
	class AbstractArgumentValidate {
	    help: string;
	    required: boolean;
	    constructor(options?: {
	        help?: string;
	        error?: string;
	        required?: boolean;
	    });
	}
	export class ArgumentValueValidate extends AbstractArgumentValidate implements IValidateValueDelegates {
	    protected _validators: IValidateValueDelegates[];
	    constructor();
	    constructor(options: ValueValidateOptions);
	    frame(values: unknown[], results: ArgumentValidations): void;
	    flush(values: unknown[], results: ArgumentValidations): void;
	    validate(value: unknown, results: ArgumentValidations): void;
	}
	export class AsyncArgumentValueValidate extends AbstractArgumentValidate implements IAsyncValidateValueDelegates {
	    protected _validators: IAsyncValidateValueDelegates[];
	    constructor();
	    constructor(options: AsyncValueValidateOptions);
	    $frame(values: unknown[], results: ArgumentValidations): Promise<void>;
	    $flush(values: unknown[], results: ArgumentValidations): Promise<void>;
	    $validate(value: unknown, results: ArgumentValidations): Promise<void>;
	}
	
	
	
	
	export class FileExistsArgumentValidate extends AsyncArgumentValueValidate {
	    $validate(value: unknown, results: ArgumentValidations): Promise<void>;
	}
	
	
	enum AsyncResultState {
	    PENDING = 0,
	    RESOLVE = 1,
	    REJECT = 2,
	    RECLAIM = 3
	}
	export interface IAsyncable<T = unknown> {
	    resolve(value: T): this;
	    reject(value: unknown): this;
	    then(resolve: Function): IAsyncable<T>;
	    then(resolve: Function, reject: Function): IAsyncable<T>;
	    catch(callback: Function): IAsyncable<T>;
	    finally(callback: Function): void;
	    $async(): Promise<T>;
	}
	export class AsyncUnknown<T = unknown> implements IAsyncable<T> {
	    static Resolve<T = unknown>(value: T | Promise<T>): IAsyncable<T>;
	    static Reject<T>(value: unknown | Promise<unknown>): IAsyncable<T>;
	    static Capture: (error?: any) => unknown;
	    protected _$callback: Function;
	    protected _iAsyncableSet: Set<AsyncUnknown>;
	    protected _finallySet: Set<Function>;
	    protected _autoReclaim: boolean;
	    protected _state: AsyncResultState;
	    protected _value: T;
	    private _then$Async;
	    protected _$thenResolve(value: T | Promise<T>): Promise<void>;
	    protected _$thenReject(value: unknown): Promise<void>;
	    constructor();
	    constructor($callback: Function);
	    resolve(value?: T | Promise<T>): this;
	    reject(value?: T | Promise<T> | unknown): this;
	    $async(): Promise<T>;
	    $async(capture: Capture<T>): Promise<T>;
	    then(resolve: Function): IAsyncable<T>;
	    then(resolve: Function, reject: Function): IAsyncable<T>;
	    catch(callback: Function): IAsyncable<T>;
	    finally(callback: Function): void;
	}
	export class AsyncCaught<T> extends AsyncUnknown<T> {
	    protected _$thenResolve(value: T): Promise<void>;
	    protected _$thenReject(value: unknown): Promise<void>;
	}
	
	
	
	
	
	
	export interface ITreeNode<T = unknown> {
	    source: T;
	    [Symbol.iterator](): Iterator<ITreeNode<T>>;
	    get size(): number;
	    get topology(): Topology<ITreeNode<T>>;
	    get root(): ITreeNode<T>;
	    get parent(): ITreeNode<T>;
	    get ancestry(): ITreeNode<T>[];
	    get children(): ITreeNode<T>[];
	    get attributes(): Attributes;
	    move(treeNode: ITreeNode<T>): void;
	    remove(treeNode: ITreeNode<T>): void;
	    fork(source: T): ITreeNode<T>;
	    fork(source: T, attributes: Attributes): ITreeNode<T>;
	    traverse(): ITreeNode<T>[];
	    find(callback: (iTreeNode: ITreeNode<T>) => boolean): ITreeNode<T>[];
	    before(iTreeNode: ITreeNode<T>): void;
	    after(iTreeNode: ITreeNode<T>): void;
	    clear(): void;
	}
	export class TreeNode<T = unknown> implements ITreeNode<T> {
	    protected _topology: Topology<ITreeNode<T>>;
	    source: T;
	    constructor(source: T, attributes: Attributes);
	    constructor(source: T, attributes: Attributes, topology: Topology<ITreeNode<T>>);
	    [Symbol.iterator](): Iterator<ITreeNode<T>>;
	    get size(): number;
	    get topology(): Topology<ITreeNode<T>>;
	    set attributes(attributes: Record<string, unknown>);
	    get attributes(): Record<string, unknown>;
	    get ancestry(): ITreeNode<T>[];
	    get root(): ITreeNode<T>;
	    get parent(): ITreeNode<T>;
	    get children(): ITreeNode<T>[];
	    move(treeNode: ITreeNode<T>): void;
	    remove(treeNode: ITreeNode<T>): void;
	    fork(data: T): ITreeNode<T>;
	    fork(data: T, attributes: Attributes): ITreeNode<T>;
	    before(treeNode: ITreeNode<T>): void;
	    after(treeNode: ITreeNode<T>): void;
	    traverse(): ITreeNode<T>[];
	    find(callback: (iTreeNode: ITreeNode<T>) => boolean): ITreeNode<T>[];
	    clear(): void;
	}
	export class TreeCollection<T = unknown> implements ICollection<T, ITreeNode<T>> {
	    static Log<T>(treeCollection: TreeCollection<T>): void;
	    private readonly _topology;
	    readonly root: ITreeNode<T>;
	    constructor();
	    constructor(root: ITreeNode<T>);
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    get size(): number;
	    get entries(): [T, Attributes][];
	    get sources(): T[];
	    attributes(source: T): Attributes;
	    ancestry(source: T): T[];
	    find(callback: (source: T, attributes: Attributes) => boolean): T[];
	    get(index: number): T;
	    has(source: T): boolean;
	    index(source: T): number;
	    exchange(source: T): ITreeNode<T>;
	    add(source: T, attributes: Attributes): ITreeNode<T>;
	    remove(source: T): ITreeNode<T>;
	    clear(): [T, Attributes][];
	    clone(): ICollection<T>;
	}
	
	
	
	
	export interface ICommand {
	    attributes: Attributes;
	    nonBlocking: boolean;
	    get commandState(): CommandState;
	    get $async(): Promise<this>;
	    trigger(queryManager: QueryManager): void;
	    $cancel(): Promise<this>;
	}
	export enum CommandState {
	    Resolved = 0,
	    Triggered = 1,
	    Rejected = 2,
	    Pending = 3
	}
	export class AbstractCommand implements ICommand {
	    protected _commandState: CommandState;
	    attributes: Attributes;
	    nonBlocking: boolean;
	    protected _async: AsyncUnknown<this>;
	    protected _$async: Promise<this>;
	    get $async(): Promise<this>;
	    protected _resolve(): void;
	    protected _reject(): void;
	    get commandState(): CommandState;
	    trigger(queryManager: QueryManager): void;
	    $cancel(): Promise<this>;
	}
	
	
	
	export class DelegateCommand extends AbstractCommand {
	    private _delegate;
	    private _rest;
	    constructor(delegate: Function, rest: unknown[], options?: {
	        race: number;
	    });
	    trigger(query: QueryManager): void;
	}
	
	
	
	export class LockCommand extends AbstractCommand {
	    private _race;
	    constructor(race: number);
	    trigger(query: QueryManager): void;
	    unlock(): void;
	}
	
	
	
	
	
	export class CommandSequence {
	    private _sequence;
	    [Symbol.iterator](): IterableIterator<ICommand>;
	    get length(): number;
	    unshift(command: ICommand): this;
	    push(command: ICommand): this;
	    tweenTo(intersection: Attributes, time: number, tweenProperties: Attributes): void;
	    delegate({ $callback, race }: {
	        $callback: Function;
	        race?: number;
	    }, ...rest: unknown[]): DelegateCommand;
	    lock(): LockCommand;
	    lock(race: number): LockCommand;
	}
	
	
	
	
	
	export class CommandQueue extends Subscription {
	    private _activeCommand;
	    private _syncArr;
	    private _asyncArr;
	    private _isConsuming;
	    private _queryManager;
	    private readonly _bindings;
	    constructor();
	    get query(): QueryManager;
	    private _consumeAndResolve;
	    private _consumeAndReject;
	    private _onCommandResolved;
	    private _onCommandRejected;
	    private _onAsyncCommandResolved;
	    queue(commandList: CommandSequence): ICommand;
	    start(): void;
	    stop(): void;
	    cancel: () => void;
	}
	
	
	export class Cipher {
	    static Random(): Cipher;
	    private _maxIterations;
	    private _masks;
	    private readonly _states;
	    private readonly _registers;
	    readonly states: {
	        refresh: () => void;
	        push: () => void;
	        pop: () => void;
	    };
	    constructor();
	    constructor(values: number[], states: number[]);
	    private _cycle;
	    sort: any;
	    get size(): number;
	    reset(): this;
	    shuffle(input: ArrayBuffer): ArrayBuffer;
	    unshuffle(input: ArrayBuffer): ArrayBuffer;
	    encrypt(input: ArrayBuffer): ArrayBuffer;
	    decrypt(input: ArrayBuffer): ArrayBuffer;
	    next(): number;
	    next(repeat: number): number;
	    mask(token: number, encrypt: boolean): number;
	    read(dataStream: DataStreamReader): void;
	    write(dataStream: DataStreamWriter): void;
	    import(data: ArrayBuffer): void;
	    export(): ArrayBuffer;
	    toString(): string;
	}
	export const DebugCipher: Cipher;
	
	export function MD5(string: string): string;
	
	
	type EnforceableValue = unknown | Promise<unknown>;
	export class EnforcementResult {
	    value: unknown;
	    success: Attributes;
	    error: Attributes;
	    logs: string[];
	    warnings: string[];
	    errors: string[];
	}
	export class EnforcementInquiry {
	    protected _delegate: (value: unknown) => EnforcementResult;
	    protected attributes: Attributes;
	    constructor(delegate: (value: unknown) => EnforcementResult, attributes: Attributes);
	    enforce(value: unknown): EnforcementResult;
	    $enforce($value: unknown): Promise<EnforcementResult>;
	}
	export function $Enforce<T = unknown[]>($values: EnforceableValue[], $inquiries: EnforcementInquiry): Promise<T>;
	export function $Enforce<T = unknown[]>($values: EnforceableValue[], $inquiries: EnforcementInquiry[]): Promise<T>;
	export function Enforce(values: IterableIterator<EnforceableValue>, inquiries: IterableIterator<EnforcementInquiry>): EnforcementResult;
	
	
	
	const NullState: unique symbol;
	type ReactorMap<T> = Map<IReactor<T>, T | typeof NullState>;
	export class CircuitReactor<T> implements IReactor<IReactor<T>, IReactor<T>[]> {
	    protected _abortController: AbortController | undefined;
	    protected _signal: AbortSignal | undefined;
	    protected _states: ReactorMap<T>;
	    protected _activeStates: Set<IReactor<T>>;
	    private _clearTimeout;
	    protected readonly _delegates: Set<ReactiveDelegate<IReactor<T>[]>>;
	    protected readonly _frameBinded: any;
	    constructor(iReactors: IReactor<T>[]);
	    [Symbol.asyncIterator](): AsyncIterableIterator<IReactor<T>[]>;
	    abort(): void;
	    get activeStates(): IReactor<T>[];
	    protected _operate(states: ReactorMap<T>, iReactor?: IReactor<T>): boolean;
	    setter(iReactor: IReactor<T>): IReactor<T>[];
	    $setter(iReactor: IReactor<T>): Promise<IReactor<T>[]>;
	    getter(): IReactor<T>[];
	    subscribe(delegate: ReactiveDelegate<IReactor<T>[]>): this;
	    unsubscribe(delegate: ReactiveDelegate<IReactor<T>[]>): this;
	    clear(): void;
	    frame(delay?: number): void;
	    flush(): void;
	}
	export class AndReactor<T> extends CircuitReactor<T> {
	    protected _operate(states: ReactorMap<T>, iReactor?: IReactor<T>): boolean;
	}
	export class OrReactor<T> extends CircuitReactor<T> {
	    protected _operate(states: ReactorMap<T>, iReactor?: IReactor<T>): boolean;
	}
	export class NotReactor<T> extends CircuitReactor<T> {
	    protected get _activateStates(): IReactor<T>[];
	    protected _operate(states: ReactorMap<T>, iReactor?: IReactor<T>): boolean;
	}
	export class XorReactor<T> extends CircuitReactor<T> {
	    get activeStates(): IReactor<T>[];
	    protected _operate(states: ReactorMap<T>, iReactor?: IReactor<T>): boolean;
	}
	
	
	export function InstanceOf(instance: unknown, ...classes: (unknown | string)[]): boolean;
	
	export interface IThottle<T> {
	    $queue($callback: Function, ...params: unknown[]): Promise<T | Error>;
	}
	export class SequentialThottle<T = unknown> implements IThottle<T> {
	    private readonly _queue;
	    private readonly _$consumeBinded;
	    constructor();
	    private _$consume;
	    $cancel(error: Error): void;
	    $queue($callback: Function, ...params: unknown[]): Promise<T | Error>;
	}
	
	export class Debouncer {
	    private readonly _callbackMap;
	    constructor();
	    debounce(delegate: Function, parameters: unknown[], delay: number): void;
	    reset(): void;
	    clear(): void;
	}
	
	
	
	
	
	export class RejectedAction extends ForgeAction {
	    protected _actions: IAction[];
	    constructor(init: ActionInit, actions: IAction[]);
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	
	
	export class ResolvedAction extends ForgeAction {
	    protected _actions: IAction[];
	    constructor(init: ActionInit, actions: IAction[]);
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	
	
	export class SettledAction extends ForgeAction {
	    protected _actions: IAction[];
	    constructor(init: ActionInit, actions: IAction[]);
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	export class ForgeAccess {
	    static DefaultLength: number;
	    protected _values: Uint8Array;
	    protected _cipher: Cipher;
	    constructor(cipher: Cipher);
	    constructor(cipher: Cipher, options: {});
	    get size(): number;
	    acccess(data: ArrayBuffer): boolean;
	    write(dataStream: DataStreamWriter): void;
	    read(dataStream: DataStreamReader): void;
	    export(): ArrayBuffer;
	}
	
	export class ForgeAuthorization<S, T> {
	    protected _sources: Map<string, any>;
	    private _generateHash;
	    private _next;
	    register(source: S): void;
	    authorize(source: string, target: string): boolean;
	    frame(): void;
	}
	
	
	type TokenPair = Record<string, string>;
	export class ForgeAuthSession {
	    private _tokens;
	    private _refresh;
	    private _options;
	    revoked: boolean;
	    private readonly _match;
	    readonly attributes: Attributes;
	    readonly expiry: number;
	    constructor(attributes: Attributes, expiry: number, options: any);
	    get tokens(): Record<string, string>;
	    authorize(header: TokenPair): boolean;
	    refresh(refresh: any): boolean;
	}
	
	
	
	
	
	export class ForgeUser {
	    private _permit;
	    private _session;
	    constructor();
	    $login(): Promise<ForgeAuthSession>;
	    $logout(): Promise<void>;
	}
	
	
	
	
	
	
	
	export type DispatchParams = {
	    command: string;
	    headers?: [Serialize, Attributes][];
	    reads?: [ArrayBuffer, Attributes][];
	};
	export type ForgeDispatcherEntry<T> = {
	    $authorize: T;
	    trigger: IForgeTrigger;
	    params: DispatchParams;
	};
	export class ForgeDispatcher<T extends (signal: Signal, ...rest: any[]) => Promise<boolean> | boolean> {
	    protected _entries: ForgeDispatcherEntry<T>[];
	    [Symbol.iterator](): IterableIterator<ForgeDispatcherEntry<T>>;
	    [Reactivity]: Reactor<{
	        signal: Signal;
	        request: ForgeRequest;
	        response: ForgeResponse;
	    }, {
	        signal: Signal;
	        request: ForgeRequest;
	        response: ForgeResponse;
	    }>;
	    add(params: DispatchParams, $authorize: T): this;
	}
	
	
	
	
	
	
	
	
	export class ClientSocketModelProxy extends AbstractForgeModelProxy {
	    private _socket;
	    private _state;
	    private _storeRemap;
	    private _$ready;
	    private readonly _queue;
	    constructor(model: IForgeModel, socket: IForgeSocket);
	    private _$thenISocketReady;
	    protected _$queue(header: unknown, data: Serialize): Promise<Serialize>;
	    get $ready(): Promise<IForgeModel>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $activate(): Promise<void>;
	    $connect(store: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $branch(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	}
	
	
	
	export class DummySocket extends AbstractForgeSocket {
	    constructor(name: string);
	    write(protocol: string, ...rest: Serialize[]): Promise<void>;
	}
	
	
	
	
	
	
	
	export type ForgeHostParams = {
	    key?: string;
	    name?: string;
	    race?: Record<string, number>;
	};
	/**
	 * A component to support distributed computing by provided a binded interface to a central forge instance.
	 */
	export class Forgelet extends Forge {
	    protected _executing: boolean | undefined;
	    protected _queue: [];
	    protected _socket: IForgeSocket;
	    protected _model: IForgeModel | undefined;
	    protected _constraints: SignalConstraints;
	    constructor(options: {
	        key?: string;
	        constraint: SignalConstraint;
	    });
	    /**
	     *
	     * @param param0
	     */
	    protected _$subscribeSignalReaction({ socket, protocol, signal, request, response }: SocketReaction): Promise<void>;
	    get $ready(): Promise<Serialize>;
	    $connect(data: Serialize): Promise<Serialize>;
	    $start(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $frame(data: Serialize): Promise<void>;
	    $flush(data: Serialize): Promise<void>;
	    $execute(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $watch(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $model(attributes: Attributes): Promise<IForgeModel>;
	    $read(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	export class ForgeModelState {
	    private _substates;
	    private readonly _stores;
	    isolate(stores: IForgeStore[]): string;
	    authorize(hash: string, stores: IForgeStore[]): boolean;
	    add(store: IForgeStore): string;
	    remove(store: IForgeStore): void;
	    clean(states: string[]): void;
	}
	
	
	
	
	
	
	
	export type ForgeModelRoutePermissionExport = {
	    state: [string, string];
	    stores: Record<string, unknown>;
	    verifications: Record<string, string>;
	    access: Partial<Record<ForgeModelRouteAccess, string>>;
	    permit: [string, string];
	};
	export class ForgeModelRoutePermission {
	    private _state;
	    private _verifications;
	    private readonly _model;
	    private readonly _permit;
	    private readonly _access;
	    readonly stores: Map<string, IForgeStore>;
	    readonly hashes: Map<IForgeStore, string>;
	    race: number;
	    constructor(model: IForgeModel, permit: [string, string], access?: ForgeModelRouteAccess[]);
	    filterState(headers: ServeHeaders): string;
	    filterVerifications(headers: ServeHeaders): Record<string, string>;
	    $branch(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $read(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $mutate(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $purge(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $order(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $render(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse, accessData: ForgeModelRouteRequest): Promise<boolean>;
	    authorize(accessData: ForgeModelRouteRequest): boolean;
	    export(): ForgeModelRoutePermissionExport;
	    refresh(): this;
	    clear(): this;
	    add(iStores: IForgeStore[]): this;
	    add(iStores: IForgeStore[]): this;
	    remove(iStore: IForgeStore): this;
	    remove(iStores: IForgeStore[]): this;
	}
	
	
	
	
	
	
	
	
	
	type ForgeModelRouteRequestBody = {
	    branch?: {
	        parent: string;
	        attributes: Attributes;
	        body: [ArrayBuffer, string];
	    }[];
	    mutate?: Record<string, [ArrayBuffer, string]>;
	    read?: string[];
	    purge: string[];
	    order: Record<string, string[]>;
	    flush: boolean;
	    session: string;
	};
	export type ForgeModelRouteRequest = {
	    state: string;
	    permit: string;
	    access: string;
	    verifications: Record<string, string>;
	    body?: ForgeModelRouteRequestBody;
	};
	export enum ForgeModelRouteAccess {
	    Connect = "connect",
	    Branch = "branch",
	    Read = "read",
	    Mutate = "mutate",
	    Write = "write",
	    Purge = "purge",
	    Order = "order",
	    Render = "render"
	}
	export type $AuthorizePermission = (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute, permission: ForgeModelRoutePermission) => Promise<boolean>;
	export type ForgeModelRouteHook = IForgeRouteHook & {
	    $parse(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<ForgeModelRouteRequest>;
	};
	export class ForgeModelRoute extends ForgeRoute implements ForgeModelRouteHook {
	    protected _iModel: IForgeModel;
	    protected _hasParsing: boolean;
	    protected readonly _permitKey: string;
	    protected readonly _stateKey: string;
	    protected readonly _permissions: Map<string, ForgeModelRoutePermission>;
	    constructor(iModel: IForgeModel, config: {
	        hooks?: ForgeModelRouteHook[];
	    });
	    get state(): string;
	    $authorize(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $parse(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<ForgeModelRouteRequest>;
	    $resolve(signal: RouteSignal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    expose(stores: IForgeStore[]): ForgeModelRoutePermission;
	    expose(stores: IForgeStore[], options: {
	        access?: ForgeModelRouteAccess[];
	        $authorize: $AuthorizePermission;
	    }): ForgeModelRoutePermission;
	    remove(permission: ForgeModelRoutePermission): void;
	    clear(): void;
	    add(hook: ForgeModelRouteHook): this;
	}
	
	
	
	
	
	export class ClientModelProxy extends AbstractForgeModelProxy {
	    static Mime: string;
	    private _url;
	    private _refresh;
	    private _headers;
	    private _access;
	    private _$sources;
	    private readonly _stores;
	    private readonly _hashes;
	    constructor(model: IForgeModel, url: string, refresh: [string, string, string]);
	    get $sources(): Promise<IForgeStore[]>;
	    $refresh(): Promise<IForgeStore[]>;
	    $readMORE_AND_STUFF(stores: IForgeStore[]): Promise<IForgeStore[]>;
	    $mutate(store: IForgeStore, mutatedStore: IForgeStore): Promise<void>;
	    $flush(): Promise<void>;
	}
	
	
	
	
	export class FileModelPipe extends AbstractForgeModelProxy {
	    static Race: number;
	    static CaptureFileError(error: unknown): ArrayBuffer;
	    private _file;
	    private _permissions;
	    private _capture;
	    private _race;
	    constructor(iModel: IForgeModel, file: string);
	    constructor(iModel: IForgeModel, file: string, options: {
	        read?: boolean;
	        write?: boolean;
	        capture?: Capture;
	        race?: number;
	    });
	    $activate(): Promise<void>;
	    $flush(): Promise<void>;
	}
	
	
	
	
	
	
	export class RootSocketModelProxy extends AbstractForgeModelProxy {
	    readonly _iSockets: Set<IForgeSocket>;
	    constructor(model: IForgeModel);
	    private _$waitForStore;
	    private _validateModelState;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	export class ForgeModelRouteClient {
	    static Mime: string;
	    private _url;
	    private _refresh;
	    private _headers;
	    private _access;
	    private _$sources;
	    private readonly _stores;
	    private readonly _hashes;
	    private readonly _model;
	    private _reactor;
	    constructor(url: string, refresh: Record<string, string>);
	    [Symbol.asyncIterator](): AsyncIterableIterator<IForgeStore>;
	    [Reactivity](): IReactor<IForgeStore[]>;
	    get model(): ForgeModel;
	    get $sources(): Promise<IForgeStore[]>;
	    $refresh(): Promise<IForgeStore[]>;
	    $read(stores: IForgeStore[]): Promise<IForgeStore[]>;
	    $write(writes: Map<IForgeStore, IForgeStore>): Promise<Map<string, string>>;
	    $flush(): Promise<void>;
	}
	
	
	
	export function $ParseStoreUpgrade(root: IForgeStore, content: string, customDelegates: Record<string, QueryDelegate>): Promise<void>;
	
	
	
	
	export class JSONStore extends ForgeStore {
	    static $Value(iStore: IForgeStore): Promise<Attributes>;
	    constructor(value: Attributes, attributes: Attributes);
	    constructor(value: Attributes, attributes: Attributes, model: IForgeModel);
	    $value(): Promise<Attributes>;
	}
	
	
	
	
	export class NumberStore extends ForgeStore {
	    constructor(value: number, attributes: Attributes);
	    constructor(value: number, attributes: Attributes, iModel: IForgeModel);
	    $value(): Promise<number>;
	}
	
	
	
	
	export class StringStore extends ForgeStore {
	    constructor(value: string, attributes: Attributes);
	    constructor(value: string, attributes: Attributes, iModel: IForgeModel);
	    $value(): Promise<string>;
	}
	
	export enum PackageOptions {
	    NPM = "npm",
	    Yarn = "yarn",
	    PNPM = "pnpm"
	}
	export class ForgeNPM {
	    static $QueryLocalPackages(file: string): Promise<boolean>;
	    static IsInternalPackage(file: string): boolean;
	    private _packageManager;
	    private _$package;
	    constructor(packageManager: PackageOptions);
	    private _$loadPackage;
	    get package(): Promise<Record<string, unknown>>;
	    $list(): Promise<Record<string, string>>;
	    $install(name: string, saveDev?: true): Promise<boolean>;
	    $localize(source: string, target: string): Promise<void>;
	    $merge(dependencies: Record<string, string>, devDependencies: Record<string, string>): Promise<void>;
	}
	
	
	export class ForgeOS {
	    static $Exec(command: string, options?: ExecOptions & {
	        stdio: string;
	    }): Promise<string>;
	}
	
	export class ForgeGit {
	    static $IsWorkingTree(): Promise<boolean>;
	    static $Clone(url: string): Promise<boolean>;
	    static $Submodule(url: string, target: string): Promise<boolean>;
	    static $Place(url: string, target: string): Promise<boolean>;
	}
	
	export class ForgeZip {
	    static $GUnzip(data: string | ArrayBuffer): Promise<ArrayBuffer>;
	    static $GZip(data: string | ArrayBuffer, options?: {}): Promise<ArrayBuffer>;
	    private _zip;
	    cursor(path: string): void;
	    add(path: string, data: string | ArrayBuffer): this;
	    remove(path: string): void;
	    $archive(): Promise<ArrayBuffer>;
	}
	
	
	
	
	
	export class SignalRoute extends ForgeRoute {
	    private _target;
	    private _signal;
	    constructor(target: {
	        $signal: (signal: Signal, request: ForgeRequest, response: ForgeResponse) => any;
	    }, signal: Signal);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	export class HTTPSocket extends AbstractForgeSocket {
	    private _config;
	    private readonly _signals;
	    constructor(name: string, config: SocketConfig, signals: Map<Signal, {
	        url: string;
	        request: RequestInit;
	        race: number;
	    }>);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    $send(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    write(protocol: string, ...rest: Serialize[]): void;
	}
	
	
	
	
	export class ModulesExportSocket extends AbstractForgeSocket {
	    private _source;
	    constructor(name: string, config: SocketConfig, source?: any);
	    $write(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $reset(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	}
	
	
	
	export class PlaybackSocket extends AbstractForgeSocket {
	    private _startTime;
	    private _queue;
	    write(protocol: string, ...rest: Serialize[]): void;
	    start(): this;
	    $play(): Promise<void>;
	}
	
	
	
	export class ForgeSwarm {
	    private _command;
	    private _socket;
	    private _childOptions;
	    private _children;
	    private _bindings;
	    private _queue;
	    constructor(command: string, socket: ForgeWebsocket, options: {
	        min: number;
	        max: number;
	        expiry: number;
	    });
	    private _consumeQueue;
	    private _$spawnChild;
	    $request(signal: string, data: Serialize): Promise<Serialize>;
	}
	
	
	
	export class GenericExpression extends ForgeSyntaxExpression {
	    consume(token: ParsedToken): boolean;
	    clone(): IForgeSyntaxExpression;
	}
	
	
	
	
	
	
	
	/**
	 * Dispatches a callack when signalled
	 * @class
	 */
	export class DelegateTrigger extends ForgeTrigger {
	    private _$delegate;
	    /**
	     * Initializes a callback to delegate _$signal(...)_ calls to
	     * @param {(signal: Signal, request: ForgeRequest, response: ForgeResponse) => Promise<void>} $delegate - delegate to callback
	     */
	    constructor($delegate: (signal: Signal, request: ForgeRequest, response: ForgeResponse) => Promise<void>);
	    /**
	     * delegate's the $signal's parameters to the initialize delegate
	     * @param {Signal} signal - Simple object used to help authorize messages
	     * @param {ForgeRequest} request - Request headers and data sent with each message
	     * @param {ForgeResponse} response - Response headers and data received after dispatching
	     * @override
	     * @returns A empty promise when completed
	     */
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	
	
	/**
	 * Delegate's the $signal(...) call to the internal target's instance and replaces the _signal_ parameter
	 * @class
	 */
	export class SignalTrigger extends ForgeTrigger {
	    private _target;
	    private _signal;
	    constructor(target: {
	        $signal: (signal: Signal, request: ForgeRequest, response: ForgeResponse) => any;
	    });
	    constructor(target: {
	        $signal: (signal: Signal, request: ForgeRequest, response: ForgeResponse) => any;
	    }, signal: Signal);
	    /**
	     * Replaces the _signal_ parameter and call $signal(...) on the internal target's instance
	     * @member
	     * @public
	     * @param {Signal} signal - Simple object used to help authorize messages
	     * @param {ForgeRequest} request - Request headers and data sent with each message
	     * @param {ForgeResponse} response - Response headers and data received after dispatching
	     */
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	export class ForgeVirtualScript {
	    exports: unknown;
	    constructor();
	    constructor(code: string);
	    constructor(code: string, exposed: Record<string, unknown>);
	    evaluate(code: string, exposed?: Record<string, unknown>): unknown;
	}
	
	
	

}