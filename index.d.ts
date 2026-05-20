

// @ts-nocheck

declare module "@onyx-ignition/forge" {

	
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
	export function IntersectAttributes(intersect: Attributes, source: Attributes): Attributes;
	/**
	 *
	 * Combines multiple nested objects where overlapping values are converted into array.
	 * For example [{ value: "forge" }, { value: 777 }] will become { value: ["forge", 777 ] }
	 *
	 * @param sources {Attributes[]} Array of objects to merge
	 * @param options {?{ intersect: Attributes }} object with an `intersect` property. strip
	 *
	 * @returns { Attributes }
	 *
	 */
	export function MergeAttributes(sources: Attributes[]): Attributes;
	export function MergeAttributes(sources: Attributes[], options: {
	    intersect?: Attributes;
	    implode?: ImplodeAttributesOptions;
	}): Attributes;
	export function CollapseAttributes(entries: Attributes[]): Attributes;
	/**
	 *
	 * @param accessor
	 * @param value
	 * @param input
	 * @param options
	 * @returns
	 */
	export function ImplodeAttributes(accessor: string[], value: unknown, input: Attributes, options?: {
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
	export function $Wait<S, T>(delay: number, options?: {
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
	export class Reactor<S, T = S> implements IReactor<S, T> {
	    protected _state: S;
	    protected _setter: (state: S, previous: S) => S;
	    protected _getter: (state: S) => T;
	    protected readonly _delegates: Set<ReactiveDelegate<T>>;
	    protected _abortController: AbortController;
	    protected _signal: AbortSignal;
	    constructor();
	    constructor(state: S);
	    constructor(state: S, transform: {
	        getter?: (state: S) => T;
	        setter?: (newState: S, oldState: S) => S;
	    });
	    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
	    [Symbol.dispose](): void;
	    protected _transformSet(state: S, previous: S): S;
	    protected _transformGet(state: S): T;
	    protected _equals(state: S, previous: S): boolean;
	    getter(): T;
	    setter(value: S): T;
	    subscribe(delegate: ReactiveDelegate<T>): this;
	    unsubscribe(delegate: ReactiveDelegate<T>): this;
	    once(delegate: ReactiveDelegate<T>): this;
	    clear(): void;
	    frame(): void;
	    frame(...rest: unknown[]): void;
	    flush(): void;
	    abort(): void;
	}
	export function reactive<T = unknown>(value: T): IReactor<T>;
	
	
	
	
	export class QueryManagerReactor<T> extends Reactor<[T, Attributes][]> {
	    private _query;
	    constructor(query: IQuery<T>);
	}
	
	
	
	export class QuerySequence {
	    static And(attributes: Attributes): QuerySequence;
	    static Or(attributes: Attributes): QuerySequence;
	    static Not(attributes: Attributes): QuerySequence;
	    static All(attributes: Attributes, delegate: QueryDelegate, ...rest: unknown[]): QuerySequence;
	    static Composite(attributes: Attributes, ...rest: unknown[]): QuerySequence;
	    static Greater(attributes: Attributes): QuerySequence;
	    static Less(attributes: Attributes): QuerySequence;
	    static Traverse(attributes: Attributes): QuerySequence;
	    private _sequence;
	    constructor(iterable?: Iterable<[QueryDelegate, Attributes] | [QueryDelegate, Attributes, unknown]>);
	    and(attributes: Attributes): this;
	    or(attributes: Attributes): this;
	    not(attributes: Attributes): this;
	    all(attributes: Attributes, delegate: QueryDelegate, ...rest: unknown[]): this;
	    composite(attributes: Attributes, ...rest: unknown[]): this;
	    greater(attributes: Attributes): this;
	    less(attributes: Attributes): this;
	    query<T>(query: IQuery<T>): IQuery<T>;
	    match(attributes: Attributes): boolean;
	    toString(): string;
	}
	
	
	
	
	
	
	export const Intersects: Symbol;
	export type QueryDelegate = (objectA: Attributes, objectB: Attributes, ...rest: unknown[]) => boolean;
	export type $QueryDelegate = (objectA: Attributes, objectB: Attributes, ...rest: unknown[]) => Promise<boolean>;
	export class AttributesQuery {
	    static readonly Intersects: Symbol;
	    static And(objectA: Attributes, objectB: Attributes): boolean;
	    static Or(objectA: Attributes, objectB: Attributes): boolean;
	    static Not(objectA: Attributes, objectB: Attributes): boolean;
	    static All(objectA: Attributes, objectB: Attributes, delegate: QueryDelegate, ...rest: unknown[]): boolean;
	    static Composite(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean;
	    static Greater(objectA: Attributes, objectB: Attributes): boolean;
	    static Less(objectA: Attributes, objectB: Attributes): boolean;
	    static Traverse(objectA: Attributes, objectB: Attributes): boolean;
	}
	export interface IQuery<T = unknown> {
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get size(): number;
	    get collection(): ICollection<T>;
	    get all(): T[];
	    get last(): T;
	    get first(): T;
	    get(index: number): T;
	    slice(start: Number, end?: Number): T[];
	    slice(start: Number, end?: Number): T[];
	    /**
	     * Finds at least one component that matches the parameters passed using QuerySequence.match
	     * @param {QuerySequence} sequence An instance of QuerySequence that will match against each attributes
	     * @returns {boolean}
	     */
	    has(sequence: QuerySequence): boolean;
	    /**
	     * Attempts Finds at least one component that matches the delegate passed
	     * @param {(component: T, attributes: Attributes, ...rest: unknown[]) => boolean} callback Called each iteration with following signature (component: T, attributes: Attributes, ...rest: unknown[]) => boolean
	     * @param {...unknown[]} [rest]
	     * @returns {boolean}
	     */
	    has(callback: Function, ...rest: unknown[]): boolean;
	    attributes(component: T): Attributes;
	    add(component: T, attribute: Attributes): this;
	    remove(component: T): this;
	    clear(): this;
	    merge(...iQueries: IQuery<T>[]): this;
	    mutate(source: T, target: T): this;
	    or(attributes: Attributes): IQuery<T>;
	    and(attributes: Attributes): IQuery<T>;
	    not(attributes: Attributes): IQuery<T>;
	    greater(attributes: Attributes): IQuery<T>;
	    less(attributes: Attributes): IQuery<T>;
	    traverse(attributes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate): IQuery<T>;
	    filter(delegate: QueryDelegate, atttibutes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate, atttibutes: Attributes, ...rest: unknown[]): IQuery<T>;
	    $filter(delegate: QueryDelegate, atttibutes: Attributes, ...rest: unknown[]): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, atttibutes: Attributes): Promise<IQuery<T>>;
	    group(key: unknown): Map<unknown, IQuery<T>>;
	    $listen(listener: (query: IQuery<T>) => boolean | Promise<boolean>): Promise<this>;
	    $listen(listener: (query: IQuery<T>) => boolean | Promise<boolean>, options: {
	        race: number;
	    }): Promise<this>;
	    clone(): IQuery<T>;
	}
	export class QueryManager<T = unknown> implements IQuery<T> {
	    static From<T = unknown>(overload: Iterable<[T, Attributes]>): QueryManager<T>;
	    protected _collection: ICollection<T>;
	    protected _listeners: Map<((query: IQuery<T>) => boolean | Promise<boolean>), $Promise<this>> | undefined;
	    protected _reactor: QueryManagerReactor<T> | undefined;
	    constructor();
	    constructor(collection: ICollection<T>);
	    [Reactivity](): IReactor<[T, Attributes][]>;
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get size(): number;
	    get collection(): ICollection<T>;
	    get all(): T[];
	    get last(): T;
	    get first(): T;
	    get(index: number): T;
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
	    add(component: T, attributes: Attributes): this;
	    remove(component: T): this;
	    mutate(source: T, target: T): this;
	    clear(): this;
	    attributes(component: T): Attributes;
	    merge(...queries: IQuery<T>[]): this;
	    greater(attributes: Attributes): IQuery<T>;
	    less(attributes: Attributes): IQuery<T>;
	    or(attributes: Attributes): IQuery<T>;
	    and(attributes: Attributes): IQuery<T>;
	    not(attributes: Attributes): IQuery<T>;
	    traverse(attributes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes): IQuery<T>;
	    filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): IQuery<T>;
	    $filter(delegate: QueryDelegate): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes): Promise<IQuery<T>>;
	    $filter(delegate: QueryDelegate, attributes: Attributes, ...rest: unknown[]): Promise<IQuery<T>>;
	    composite(attributes: Attributes): IQuery<T>;
	    $listen(listener: (query: IQuery<T>) => boolean | Promise<boolean>, options?: {
	        race?: number;
	    }): Promise<this>;
	    group(key: string): Map<unknown, IQuery<T>>;
	    transform(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => [T, Attributes], ...rest: unknown[]): IQuery<T>;
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
	    constructor(classRef: ValidationConstructor, validations: ArgumentValidation, attributes: Attributes);
	    [Symbol.iterator](): IterableIterator<[ArgumentValidationComponent, Attributes]>;
	    get size(): number;
	    add(message: string): ArgumentValidationComponent;
	    add(message: string, attributes: Attributes): ArgumentValidationComponent;
	    remove(entry: ArgumentValidationComponent): boolean;
	    clear(): void;
	    merge(results: ArgumentValidationResults): void;
	}
	export class ArgumentValidation {
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
	    merge(validation: ArgumentValidation): this;
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
	    validations: ArgumentValidation;
	    constructor(options: {
	        values: T[];
	        validations?: ArgumentValidation;
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
	export function VerfiyPacakgeWarnignsAndErrors({ args, warnings, errors }: {
	    args?: (IArgumentPackage | ArgumentValues)[];
	    warnings?: string[];
	    errors?: string[];
	}): void;
	export class AbstractPackageQuerySequence {
	    protected _intersect: Attributes | undefined;
	    protected _mounts: string[][];
	    protected _remounts: string[][];
	    queries: QuerySequence;
	    or(attributes: Attributes): this;
	    and(attributes: Attributes): this;
	    not(attributes: Attributes): this;
	    filter(attributes: Attributes, delegate: QueryDelegate, ...rest: unknown[]): this;
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
	    frame?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation) => void;
	    validate?: (component: Attributes, attributes: Attributes, results: ArgumentValidation) => void;
	    flush?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation) => void;
	}
	export interface IAsyncPackageValidator {
	    localize?: (component: Attributes) => Attributes | undefined;
	    $frame?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation) => Promise<void>;
	    $validate?: (component: ArgumentPackageComponent, attributes: Attributes, results: ArgumentValidation) => Promise<void>;
	    $flush?: (query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation) => Promise<void>;
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
	    frame(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation): void;
	    flush(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation): void;
	    validate(component: Attributes, attributes: Attributes, results: ArgumentValidation): void;
	}
	export class AsyncArgumentPackageValidate extends AbstractPackageValidate implements IAsyncPackageValidator {
	    protected _validators: IAsyncPackageValidator[];
	    constructor();
	    constructor(options: AsyncPackageValidateOptions);
	    $frame(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation): Promise<void>;
	    $flush(query: IQuery<ArgumentPackageComponent>, results: ArgumentValidation): Promise<void>;
	    $validate(component: ArgumentPackageComponent, attributes: Attributes, results: ArgumentValidation): Promise<void>;
	}
	
	
	
	
	
	
	
	
	
	export type ArgumentPackageComponent = Attributes | Promise<Attributes>;
	export interface IArgumentPackage {
	    [Symbol.iterator](): Iterator<[ArgumentPackageComponent, Attributes]>;
	    validations: ArgumentValidation;
	    get size(): number;
	    add(value: Attributes, attributes: Attributes): this;
	    remove(value: Attributes): this;
	    has(sequence: QuerySequence): boolean;
	    or(attributes: Attributes): IArgumentPackage;
	    and(attributes: Attributes): IArgumentPackage;
	    not(attributes: Attributes): IArgumentPackage;
	    traverse(attributes: Attributes): IArgumentPackage;
	    filter(callback: Function, ...rest: unknown[]): IArgumentPackage;
	    collapse<T extends Attributes>(): T;
	    collapse<T extends Attributes>(intersect: Attributes): T;
	    implode<T extends Attributes>(): T;
	    implode<T extends Attributes>(options: {
	        intersect?: Record<string, true>;
	        implode?: ImplodeAttributesOptions;
	    }): T;
	    explode<T>(): ArgumentValues<T>;
	    explode<T>(intersect: Attributes): ArgumentValues<T>;
	    sanitize(sanitize: IPackageSanitizer): IArgumentPackage;
	    $sanitize(sanitize: IAsyncPackageSanitizer): Promise<IArgumentPackage>;
	    validate(validate: IPackageValidator): IArgumentPackage;
	    $validate(validate: IAsyncPackageValidator): Promise<IArgumentPackage>;
	    $mutate($callback: (component: Attributes) => ArgumentPackageComponent): Promise<IArgumentPackage>;
	    mount(mount: IArgumentPackageMount): IArgumentPackage;
	    $mount(mount: IArgumentPackageMount): Promise<IArgumentPackage>;
	    collect<T = Attributes>(sequence: QuerySequence): T;
	    $collect<T = Attributes>(sequence: QuerySequence): Promise<T>;
	    after(iterable: Iterable<[ArgumentPackageComponent, Attributes]>): this;
	    before(iterable: Iterable<[ArgumentPackageComponent, Attributes]>): this;
	    $help(): Promise<string>;
	}
	export function MergePackages<T = Attributes>(packages: IArgumentPackage[], sequence: QuerySequence): T;
	export function MergeValidations(packages: IArgumentPackage[]): ArgumentValidation;
	export class ArgumentPackage implements IArgumentPackage {
	    protected _query: IQuery<ArgumentPackageComponent>;
	    validations: ArgumentValidation;
	    /**
	     *
	     */
	    constructor();
	    constructor(options: {
	        query?: IQuery<ArgumentPackageComponent>;
	        validations?: ArgumentValidation;
	    });
	    [Symbol.iterator](): IterableIterator<[ArgumentPackageComponent, Attributes]>;
	    get size(): number;
	    add(value: Attributes, attributes: Attributes): this;
	    get query(): IQuery<ArgumentPackageComponent>;
	    $await(): Promise<ArgumentPackage>;
	    remove(value: Attributes): this;
	    has(sequence: QuerySequence): boolean;
	    or(attributes: Attributes): IArgumentPackage;
	    and(attributes: Attributes): IArgumentPackage;
	    not(attributes: Attributes): IArgumentPackage;
	    filter(callback: QueryDelegate, ...rest: unknown[]): IArgumentPackage;
	    traverse(attributes: Attributes): IArgumentPackage;
	    collapse<T extends Attributes>(): T;
	    collapse<T extends Attributes>(intersect: Attributes): T;
	    implode<T = Attributes>(): T;
	    implode<T = Attributes>(options: {
	        intersect?: Record<string, true>;
	        implode?: ImplodeAttributesOptions;
	        mount?: Attributes;
	    }): T;
	    /**
	     * Returns a `ArgumentValues<T>` instance containing all values of from each components and it non-nested values
	     * @method explode
	     * @template [T=unknown]
	     * @param {?Attributes} intersect The attributes to use as a intersection to filter (optional)
	     * @returns {ArgumentValues<T>}
	     */
	    explode<T = unknown>(): ArgumentValues<T>;
	    explode<T = unknown>(intersect: Attributes): ArgumentValues<T>;
	    sanitize(sanitizer: IPackageSanitizer): ArgumentPackage;
	    $sanitize(sanitizer: IAsyncPackageSanitizer): Promise<IArgumentPackage>;
	    validate(validator: IPackageValidator): this;
	    $validate(validator: IAsyncPackageValidator): Promise<this>;
	    $mutate($callback: (component: Attributes) => ArgumentPackageComponent): Promise<IArgumentPackage>;
	    after(iterable: Iterable<[ArgumentPackageComponent, Attributes]>): this;
	    before(iterable: Iterable<[ArgumentPackageComponent, Attributes]>): this;
	    mount(mount: IArgumentPackageMount): IArgumentPackage;
	    $mount(mount: IArgumentPackageMount): Promise<IArgumentPackage>;
	    collect<T = Attributes>(sequence: QuerySequence): T;
	    $collect<T = Attributes>(sequence: QuerySequence): Promise<T>;
	    $help(): Promise<string>;
	}
	
	
	
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
	
	
	
	export class ServeHeaders {
	    readonly query: IQuery<Serialize>;
	    [Symbol.iterator](): IterableIterator<[Serialize, Attributes]>;
	    add(header: Serialize, attributes: Attributes): this;
	    sync(headers: ServeHeaders): void;
	    get<T = SerializeData>(key: string): T | undefined;
	    first<T = SerializeData>(regExp: RegExp): T | undefined;
	    last<T = SerializeData>(regExp: RegExp): T | undefined;
	    all<T = SerializeData>(regExp: RegExp): T[];
	    merge(): Serialize;
	    import(buffer: ArrayBuffer): this;
	    export(): ArrayBuffer;
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
	    readonly headers: ServeHeaders;
	    readonly reads: IQuery<IRequestRead>;
	    readonly session: GenericSession<Serialize> | undefined;
	    constructor();
	    constructor(session: GenericSession<Serialize>);
	    race(delay: number): void;
	    import(data: Serialize): this;
	    $export(): Promise<Serialize>;
	    sync(request: ForgeRequest): void;
	}
	
	
	
	
	
	export interface IResponseSocket {
	    setHeader(key: string, value: string): void;
	    status(status: number | string): void;
	    write(data: unknown): void;
	    end(...rest: unknown[]): void;
	}
	export class ForgeResponse {
	    private _socket;
	    readonly headers: ServeHeaders;
	    readonly writes: IQuery<SerializeData>;
	    private _$end;
	    private _open;
	    session: string | undefined;
	    authorized: boolean | undefined;
	    resolved: boolean | undefined;
	    rejected: boolean | undefined;
	    constructor();
	    constructor(socket: IResponseSocket);
	    get open(): boolean;
	    end(): void;
	    import(data: Serialize): this;
	    $export(): Promise<Serialize>;
	    sync(response: ForgeResponse): void;
	}
	
	
	
	
	
	
	export const ForgeProtocol: string;
	export type Signal = Record<string, string | number | boolean>;
	export type SignalConstraint = {
	    race: number;
	    capture?: Capture;
	};
	export type SocketSession = GenericSession<[ForgeRequest, ForgeResponse]>;
	export type SignalResult = SessionResult<[ForgeRequest, ForgeResponse]>;
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
	export interface IForgeSocket extends ISubscription {
	    get key(): string;
	    get name(): string;
	    get $ready(): Promise<Serialize>;
	    get routing(): ForgeSocketRouting;
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
	class ForgeSocketRouting {
	    private _socket;
	    constructor(socket: IForgeSocket);
	    $authorize(request: ForgeRequest, response: ForgeResponse, options: {
	        race: number;
	        capture: Capture;
	    }): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse, options: {
	        race: number;
	        capture: Capture;
	    }): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse, options: {
	        race: number;
	        capture: Capture;
	    }): Promise<boolean | undefined>;
	}
	class MultiPartCollector {
	    private readonly _$complete;
	    private readonly _$parts;
	    constructor(header: MultiPartHeader, capture: Capture);
	    get $complete(): Promise<ArrayBuffer>;
	    add(index: number, buffer: ArrayBuffer): void;
	}
	export class AbstractForgeSocket extends Subscription implements IForgeSocket {
	    protected _name: string;
	    protected _key: string;
	    protected _reboot: boolean;
	    protected _$local: $Promise<Serialize>;
	    protected _$remote: $Promise<Serialize>;
	    constraints: SignalConstraints;
	    protected readonly _sessions: Map<string, SocketSession>;
	    protected readonly _bindings: Map<Function, Function>;
	    protected readonly _routing: ForgeSocketRouting;
	    protected readonly _collectors: Map<string, MultiPartCollector>;
	    constructor(name: string, config: SocketConfig);
	    protected _reserveSession(signal: Signal, request: ForgeRequest, response: ForgeResponse): [string, number, Promise<SignalResult>];
	    protected _$thenConnect(data: Serialize): Promise<SignalResult>;
	    protected _readDecoded(buffer: ArrayBuffer): void;
	    get key(): string;
	    get name(): string;
	    get routing(): ForgeSocketRouting;
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
	    write(protocol: string, signal: Signal, ...rest: Serialize[]): void;
	    $reboot(): Promise<void>;
	}
	
	
	
	
	
	
	export class ForgePackageSanitize extends AsyncArgumentPackageSanitize {
	    constructor();
	    constructor(options: AsyncPackageSanitizeOptions);
	    authorize(packaging: IArgumentPackage): boolean;
	    $frame(query: IQuery<ArgumentPackageComponent>): Promise<void>;
	    $sanitize(component: ArgumentPackageComponent, attributes: Attributes): Promise<Attributes>;
	    validate(packaging: IArgumentPackage): void;
	}
	
	
	
	
	
	export class ForgePackageValidate extends AsyncArgumentPackageValidate {
	    $flush(query: IQuery<ArgumentPackageComponent>, validations: ArgumentValidation): Promise<void>;
	}
	
	
	
	
	
	
	export const ForgeParamsKeys: Set<string>;
	export type ForgeWatchParams = {
	    roots: string[];
	    debounce?: number;
	    threshold?: number;
	    ignores?: string[];
	    triggers: {
	        filter: RegExp;
	        data: Attributes;
	        action: string;
	        race: number;
	    }[];
	};
	export type ForgeWorkerParams = {
	    name: string;
	    script: string;
	    signals: Signal[];
	    data: Attributes;
	    connect: Attributes;
	    race: number;
	};
	export type ForgeParams = Partial<{
	    watch: ForgeWatchParams;
	    workers: ForgeWorkerParams[];
	    http: {
	        port?: number;
	        root?: string;
	        caching?: boolean;
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
	    frame?: (values: unknown[], results: ArgumentValidation) => void;
	    validate?: (value: unknown, results: ArgumentValidation) => void;
	    flush?: (values: unknown[], results: ArgumentValidation) => void;
	}
	export interface IAsyncValidateValueDelegates {
	    $frame?: (values: unknown[], results: ArgumentValidation) => Promise<void>;
	    $validate?: (value: unknown, results: ArgumentValidation) => Promise<void>;
	    $flush?: (values: unknown[], results: ArgumentValidation) => Promise<void>;
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
	    frame(values: unknown[], results: ArgumentValidation): void;
	    flush(values: unknown[], results: ArgumentValidation): void;
	    validate(value: unknown, results: ArgumentValidation): void;
	}
	export class AsyncArgumentValueValidate extends AbstractArgumentValidate implements IAsyncValidateValueDelegates {
	    protected _validators: IAsyncValidateValueDelegates[];
	    constructor();
	    constructor(options: AsyncValueValidateOptions);
	    $frame(values: unknown[], results: ArgumentValidation): Promise<void>;
	    $flush(values: unknown[], results: ArgumentValidation): Promise<void>;
	    $validate(value: unknown, results: ArgumentValidation): Promise<void>;
	}
	
	
	
	
	export class FileExistsArgumentValidate extends AsyncArgumentValueValidate {
	    $validate(value: unknown, results: ArgumentValidation): Promise<void>;
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
	
	
	export const Mimes: {
	    Find: (file: string) => string;
	    Set: (file: string, mime: string) => void;
	    $Load: (file: string) => Promise<void>;
	    $Append: () => Promise<void>;
	};
	
	export const AsyncReactivity: unique symbol;
	export const HaltAsyncReactivity: unique symbol;
	export type AsyncReactiveDelegate<T> = (value: T, previous?: T) => Promise<unknown>;
	export type AsyncReaction<T> = (delegate?: AsyncReactiveDelegate<T>) => Promise<T | unknown>;
	export interface IAsyncReactor<T> {
	    $setter: (value: T) => Promise<T>;
	    $getter: AsyncReaction<T>;
	}
	export class AsyncReactiveTrait<T> implements IAsyncReactor<T> {
	    private _state;
	    private _$state;
	    private _$setter;
	    private _$getter;
	    private readonly _$delegates;
	    constructor();
	    constructor(state: T);
	    constructor(state: T, transform: {
	        $get?: (state: T) => Promise<T>;
	        $set?: (newState: T, oldState: T) => Promise<T>;
	    });
	    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
	    $getter(): Promise<T>;
	    $getter($delegate: AsyncReactiveDelegate<T>): Promise<T>;
	    $setter(value: T): Promise<T>;
	}
	export function $reactive<T = unknown>(value: T): IAsyncReactor<T>;
	
	
	const NullState: unique symbol;
	type ReactorMap<T> = Map<IReactor<T>, T | typeof NullState>;
	export class CircuitReactor<T> implements IReactor<IReactor<T>, IReactor<T>[]> {
	    protected _abortController: AbortController;
	    protected _signal: AbortSignal;
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
	
	export type DebounceDelegate = (caller: unknown, ...rest: unknown[]) => unknown;
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
	
	
	
	
	
	export interface IForgeTrigger {
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	export class ForgeTrigger implements IForgeTrigger {
	    protected _resolver: ResolverOperators;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	export class WatchTrigger implements IForgeTrigger {
	    private _regExps;
	    constructor(regExps: RegExp[]);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
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
	 * @property {(string|undefined)}  name - (optional) the default error message.
	 * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
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
	    $frame(data: Serialize): Promise<SerializeData[]>;
	    $flush(data: Serialize): Promise<SerializeData[]>;
	    $authorize(signal: Signal, request: ForgeRequest, respone: ForgeResponse): Promise<boolean>;
	    $signal(signal: Signal, request: ForgeRequest, respone: ForgeResponse): Promise<boolean>;
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
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $frame(data: Serialize): Promise<SerializeData[]>;
	    $flush(data: Serialize): Promise<SerializeData[]>;
	    protected _$signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    protected _write(protocol: string, ...rest: Serialize[]): void;
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
	
	
	
	
	
	
	export class SignalAction extends ForgeAction {
	    private _sequence;
	    constructor(init: ActionInit);
	    constructor(init: ActionInit, sequence: QuerySequence);
	    $authorize(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	
	
	export class DelegateTrigger extends ForgeTrigger {
	    private _$delegate;
	    constructor($delegate: (signal: Signal, request: ForgeRequest, response: ForgeResponse) => Promise<boolean>);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	
	
	export class SocketTrigger extends ForgeTrigger {
	    private _socket;
	    constructor(socket: IForgeSocket);
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
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
	    $message(socket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	export class ForgeModelProxyManager {
	    private readonly _iProxies;
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
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
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
	    get(hash: string): IForgeStore;
	    $hash(iStore: IForgeStore): Promise<string>;
	    $attributes(iStore: IForgeStore): Promise<Attributes>;
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
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
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
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	export class ForgeModel implements IForgeModel {
	    protected _hash: string;
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
	    protected _$fetchWaitingStore(hash: string): $Promise<IForgeStore>;
	    protected _$remove(store: IForgeStore): Promise<void>;
	    get state(): string;
	    get root(): IForgeStore;
	    get proxies(): ForgeModelProxyManager;
	    $hash(iStore: IForgeStore): Promise<string>;
	    $attributes(iStore: IForgeStore): Promise<Attributes>;
	    $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $parent(iStore: IForgeStore): Promise<IForgeStore>;
	    $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	    get(query: string): IForgeStore;
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
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    toString(): string;
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
	    $message(socket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
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
	    [Reactivity]: IReactor<[IForgeSocket, Attributes, Serialize]>;
	    constructor(port: number, race?: unknown, key?: unknown);
	    protected _$connect(socket: WebSocket): Promise<void>;
	    _$read(notify: Notification, socket: ForgeWebsocket, header: Attributes, data: Serialize): Promise<void | typeof Unsubscribe>;
	    get key(): string;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	}
	
	
	
	export type RouteDelegate = (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean | undefined>;
	export interface IForgeRoute {
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	}
	export type IForgeRouteHook = {
	    $authorize?: RouteDelegate;
	    $resolve?: RouteDelegate;
	    $reject?: RouteDelegate;
	    $finally?: RouteDelegate;
	};
	export class ForgeRoute implements IForgeRoute, IForgeRouteHook {
	    protected static Race: number;
	    static Hooks: {
	        $Authorize: {
	            Match: (...matches: string[]) => RouteDelegate;
	            RegExp: (regExp: RegExp, options?: {
	                groups?: string;
	                index?: number;
	            }) => RouteDelegate;
	        };
	    };
	    protected _hooks: Set<IForgeRouteHook>;
	    protected _race: number;
	    protected _hasAuthorize: boolean;
	    protected _hasResolve: boolean;
	    protected _hasReject: boolean;
	    protected _hasFinally: boolean;
	    constructor();
	    constructor(config: {
	        race?: number;
	        hooks?: IForgeRouteHook[];
	    });
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    add(hook: IForgeRouteHook): this;
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
	
	
	
	
	
	
	
	
	
	
	export type ForgeClientParams = {
	    key?: string;
	    name?: string;
	    race?: Record<string, number>;
	};
	class ForgeClientRouting {
	    protected _$catchRoute: (error: unknown) => false;
	    private _client;
	    constructor(client: ForgeClient);
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	export class ClientSession extends GenericSession<Serialize> {
	    private readonly _signal;
	    private readonly _socket;
	    constructor(race: number, header: Signal, socket?: IForgeSocket);
	    renew(race: number): this;
	    toString(): string;
	}
	export class ForgeClient extends Subscription {
	    protected _executing: boolean | undefined;
	    protected _queue: [];
	    protected _socket: IForgeSocket;
	    protected _model: IForgeModel | undefined;
	    protected _server: ForgeWebSocketServer | undefined;
	    protected _constraints: SignalConstraints;
	    protected readonly _routing: ForgeClientRouting;
	    readonly routes: Set<IForgeRoute>;
	    constructor(options: {
	        key?: string;
	        constraint: SignalConstraint;
	    });
	    protected _$subscribeMessage(notify: string, socket: IForgeSocket, signal: Signal, forgeRequest: ForgeRequest, forgeResponse: ForgeResponse): Promise<void>;
	    get $ready(): Promise<Serialize>;
	    $connect(data: Serialize): Promise<Serialize>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<SignalResult>;
	    $start(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $frame(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $flush(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $execute(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $watch(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void>;
	    $model(attributes: Attributes): Promise<IForgeModel>;
	    $route(signal: Signal, forgeRequest: ForgeRequest, forgeResponse: ForgeResponse): Promise<void>;
	    $read(signal: Signal, forgeRequest: ForgeRequest, forgeResponse: ForgeResponse): Promise<void>;
	}
	
	
	export class ForgeRace {
	    static From(overload: number | Record<string, number> | Map<RegExp, number> | ForgeRace): ForgeRace;
	    private _default;
	    private _race;
	    constructor(race: Record<string, number>);
	    constructor(race: Map<RegExp, number>);
	    query(): number;
	    query(value: string): number;
	}
	
	
	
	
	
	
	export class ForgeController {
	    readonly actions: Set<IAction>;
	    readonly settled: Set<IAction>;
	    readonly resolves: Set<IAction>;
	    readonly rejections: Set<IAction>;
	    find(name: string): IAction | undefined;
	    $frame(data: Serialize): Promise<Map<IAction, SerializeData[]>>;
	    $flush(data: Serialize): Promise<Map<IAction, SerializeData[]>>;
	    $signal(signal: Signal, resquest: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
	
	
	export class ForgeFileWatcher extends Subscription {
	    static Default: {
	        Threshold: number;
	    };
	    threshold: number;
	    private _abortController;
	    private _targets;
	    private _ignores;
	    private readonly _reactor;
	    private readonly _fileStats;
	    private readonly _debounce;
	    constructor(targets: string[], options: {
	        threshold?: number;
	        ignores?: string[];
	    });
	    private _onDebounceFileChangeUnbinded;
	    [Symbol.dispose](): void;
	    [Reactivity](): IReactor<{
	        file: string;
	        event: string;
	    }>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<{
	        event: string;
	        file: string;
	    }>;
	    protected _$watchFiles(event: string, file: string): Promise<void>;
	    abort(): void;
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
	    readonly routes: Set<IForgeRoute>;
	    race: number;
	    constructor(port: number);
	    protected _buildRequest(request: ExpressRequestAdapter): ForgeRequest;
	    protected _buildResponse(response: IResponseSocket): ForgeResponse;
	    use(delegate: Function): void;
	    protected _$all(request: ExpressRequestAdapter, response: IResponseSocket, next: Function): Promise<void>;
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
	
	
	
	
	
	
	
	
	export enum Verbosity {
	    all = "all",
	    log = "log",
	    warn = "warn",
	    error = "error",
	    silent = "silent"
	}
	export class Forge {
	    static EnviromentVariabled(): {
	        DRY_RUN: boolean;
	        VERBOSITY: Verbosity;
	    };
	    private readonly _serve;
	    private _model;
	    private readonly _controller;
	    readonly sockets: Map<string, IForgeSocket>;
	    constructor();
	    private _addSocket;
	    get serve(): any;
	    get model(): IForgeModel;
	    spawn(name: string, config: SocketConfig): IForgeSocket;
	    fork(name: string, config: SocketConfig): IForgeSocket;
	    worker(name: string, config: SocketConfig): IForgeSocket;
	    exec(name: string, config: SocketConfig): IForgeSocket;
	    watch(roots: string[], options: {
	        threshold?: number;
	        ignores?: string[];
	        debounce?: number;
	        throttle?: number;
	    }): ForgeFileWatcher;
	    add(action: IAction): void;
	    $frame(data: Serialize): Promise<Serialize>;
	    $flush(data: Serialize): Promise<Serialize>;
	    $signal(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    abort(): void;
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
	    $parse(request: ForgeRequest, response: ForgeResponse): Promise<ForgeModelRouteRequest>;
	};
	export class ForgeModelRoute extends ForgeRoute implements ForgeModelRouteHook {
	    protected _iModel: IForgeModel;
	    protected _hasParsing: boolean;
	    protected readonly _permitKey: string;
	    protected readonly _stateKey: string;
	    protected readonly _permissions: Map<string, ForgeModelRoutePermission>;
	    constructor(iModel: IForgeModel, config: {
	        race?: number;
	        hooks?: ForgeModelRouteHook[];
	    });
	    get state(): string;
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $parse(request: ForgeRequest, response: ForgeResponse): Promise<ForgeModelRouteRequest>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
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
	    private readonly _roots;
	    readonly _iSockets: Set<IForgeSocket>;
	    constructor(model: IForgeModel);
	    private _$waitForStore;
	    private _validateModelState;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
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
	}
	
	
	
	
	export class DelegateRoute extends ForgeRoute {
	    private _$authorize;
	    private _$resolve;
	    private _$reject;
	    constructor($delegates: {
	        $authorize: RouteDelegate;
	        $resolve: RouteDelegate;
	        $reject: RouteDelegate;
	    });
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	}
	
	
	
	
	
	export type FileRoutePathing = {
	    relative: string;
	    absolute: string;
	    base: string;
	    ext: string;
	};
	export type FileRouteDelegate = (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute, pathing: FileRoutePathing) => Promise<boolean>;
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
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $invalidate(): Promise<void>;
	}
	export class FileDirectoryRoute extends ForgeRoute {
	    static Hooks: {
	        $Authorize: {
	            Match: (...matches: string[]) => RouteDelegate;
	            RegExp: (regExp: RegExp, options?: {
	                groups?: string;
	                index?: number;
	            }) => RouteDelegate;
	        };
	    };
	    private _root;
	    private _indexes;
	    private _caching;
	    private readonly _resolve;
	    private readonly _reject;
	    readonly statuses: Map<string, ForgePathStatus>;
	    readonly cache: Map<string, ArrayBufferLike>;
	    constructor(config: {
	        root: string;
	        indexes?: string[];
	        hooks?: (IForgeRouteHook & {
	            $render?: FileRouteDelegate;
	        })[];
	        race?: number;
	        resolve?: {
	            status?: number;
	            end?: boolean;
	        };
	        reject?: {
	            status?: number;
	            end?: boolean;
	        };
	        caching?: boolean;
	    });
	    get root(): string;
	    get indexes(): string[];
	    $status(target: string): Promise<ForgePathStatus>;
	    $status(target: string, root: string): Promise<ForgePathStatus>;
	    $exists(target: string): Promise<boolean>;
	    $pathing(request: ForgeRequest): Promise<FileRoutePathing>;
	    $fetch(relative: string, absolute: string): Promise<ArrayBufferLike | undefined>;
	    protected _$render(request: ForgeRequest, response: ForgeResponse, pathing: FileRoutePathing): Promise<boolean>;
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    add(hook: {
	        $authorize?: RouteDelegate;
	        $resolve?: RouteDelegate;
	        $reject?: RouteDelegate;
	        $finally?: RouteDelegate;
	        $render?: FileRouteDelegate;
	    }): this;
	    uncache(): void;
	    uncache(relative: string): void;
	}
	
	
	
	
	
	
	export class ForgeSocketRoute extends ForgeRoute {
	    static $Authorize(socket: IForgeSocket, options: {
	        race: number;
	        capture: Capture;
	    }): (request: ForgeRequest, response: ForgeResponse) => Promise<boolean | undefined>;
	    private socket;
	    constructor(socket: IForgeSocket, config: {
	        hooks?: IForgeRouteHook[];
	        race?: number;
	    });
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined>;
	}
	
	
	
	
	export class HTTPRoute extends ForgeRoute {
	    private _root;
	    constructor(route: RegExp, root: string);
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
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
	
	
	
	
	
	export class RequestSocket extends AbstractForgeSocket {
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
	
	export class ForgeVirtualScript {
	    exports: unknown;
	    constructor();
	    constructor(code: string);
	    constructor(code: string, exposed: Record<string, unknown>);
	    evaluate(code: string, exposed?: Record<string, unknown>): unknown;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	export { $GetApplicationArguments, Accessor, ArgumentPackageComponent, IArgumentPackage, MergePackages, MergeValidations, ArgumentPackage, IArgumentPackageMount, AttributesArgumentPackageMount, DelegateArgumentPackageMount, ArgumentValidationComponent, ArgumentValidationWarning, ArgumentValidationSuccess, ArgumentValidationError, ArgumentValidation, ArgumentValues, CLIPromptArgument, CLIArgumentPackage, ExplodeString, $ExplodeGlob, VerfiyPacakgeWarnignsAndErrors, AbstractPackageQuerySequence, IPackageSanitizer, IAsyncPackageSanitizer, PackageSanitizeOptions, AsyncPackageSanitizeOptions, ArgumentPackageSanitize, AsyncArgumentPackageSanitize, NumberArgumentSanitize, GlobArgumentSanitize, JSONEntriesArgumentSanitizer, IValueSanitizer, IAsyncValueSanitizer, ValueSanitizeOptions, AsyncValueSanitizeOptions, ArgumentValueSanitize, AsyncArgumentValueSanitize, StdinArgumentPackage, IPackageValidator, IAsyncPackageValidator, PackageValidateOptions, AsyncPackageValidateOptions, AbstractPackageValidate, ArgumentPackageValidate, AsyncArgumentPackageValidate, FileExistsArgumentValidate, IValidateValueDelegates, IAsyncValidateValueDelegates, ValueValidateOptions, AsyncValueValidateOptions, ArgumentValueValidate, AsyncArgumentValueValidate, IAsyncable, AsyncUnknown, AsyncCaught, ICollection, ICollectionIterator, IAsyncCollection, MapCollection, ArrayCollection, Iterate, Topology, ITreeNode, TreeNode, TreeCollection, ICommand, CommandState, AbstractCommand, CommandQueue, CommandSequence, DelegateCommand, LockCommand, Attributes, AttributeFragment, IntervalClear, TimeoutClear, SerializeData, Serialize, $Serialize, Capture, ImplodeAttributesOptions, EmptyAttributes, EmptyData, GetRange, IsObject, CatchThrowError, CatchCapture, EmptyFunction, EncodeBase64, DecodeBase64, TokenizeAttributes, TokenizeAttributeFragments, MountAttributes, CollateAttributes, ExplodeAttributes, IntersectAttributes, MergeAttributes, CollapseAttributes, ImplodeAttributes, TransformAttributes, QuickHash, $Promise, $UsePromise, $RacePromise, $UseRace, $Wait, EscapeHTML, Capitalize, Cipher, DebugCipher, MD5, EncodeNumber, DecodeNumber, EncodedStringSize, EncodeString, DecodeString, DecodeAttributes, EncodeAttributes, Base64, DataStreamWriter, DataStreamReader, DebugForeground, DebugBackground, ColourFormattingReset, DebugFormatter, EnforcementResult, EnforcementInquiry, $Enforce, Enforce, CompositeLoader, HTTPLoader, JSONLoader, Mimes, IPoolable, PoolManager, Intersects, QueryDelegate, $QueryDelegate, AttributesQuery, IQuery, QueryManager, QueryManagerReactor, QuerySequence, AsyncReactivity, HaltAsyncReactivity, AsyncReactiveDelegate, AsyncReaction, IAsyncReactor, AsyncReactiveTrait, $reactive, CircuitReactor, AndReactor, OrReactor, NotReactor, XorReactor, Reactivity, HaltReactivity, ReactiveDelegate, IReactor, Reactor, reactive, InstanceOf, IResult, $IResult, Result, SessionResult, GenericSession, Notification, ISubscription, Unsubscribe, Subscription, DebounceDelegate, Debounce, IThottle, SequentialThottle, Debouncer, ResolverOperators, ActionInit, ActionState, IAction, ForgeAction, RejectedAction, ResolvedAction, SettledAction, SignalAction, DelegateTrigger, IForgeTrigger, ForgeTrigger, WatchTrigger, SocketTrigger, ForgeParamsKeys, ForgeWatchParams, ForgeWorkerParams, ForgeParams, ForgePackage, ForgePackageSanitize, ForgePackageValidate, ForgeAccess, ForgeAuthorization, ForgeAuthSession, ForgeUser, ForgeClientParams, ClientSession, ForgeClient, ForgeRace, Verbosity, Forge, ForgeController, $CompareModels, ModelReactorState, ModelReactor, IForgeModel, IForgeModelProxy, ForgeModel, ForgeModelState, ClientModelProxy, FileModelPipe, AbstractForgeModelProxy, ForgeModelProxyManager, ClientSocketModelProxy, RootSocketModelProxy, ForgeModelRouteRequest, ForgeModelRouteAccess, $AuthorizePermission, ForgeModelRouteHook, ForgeModelRoute, ForgeModelRouteClient, ForgeModelRoutePermissionExport, ForgeModelRoutePermission, $ParseStoreUpgrade, UpgradeParams, ForgeStoreMime, ForgeStoreExport, $CompareStores, StoreUpgradeQuery, IForgeStore, ForgeStore, JSONStore, NumberStore, StringStore, PackageOptions, ForgeNPM, ForgeOS, ForgeGit, ForgeFileStats, ForgeFile, ForgeIO, ForgeParsedPath, ForgePathStatus, ForgePath, ForgeZip, ForgeFileWatcher, ServeHeaders, ExpressRequestAdapter, ExpressHTTPServer, ExpressRequestHeader, ExpressRequestPayload, ForgeRequestInit, ForgeRequestExport, IRequestRead, LocalRequestRead, ForgeRequest, IResponseSocket, ForgeResponse, ForgeWebSocketServer, DelegateRoute, FileRoutePathing, FileRouteDelegate, FileRoute, FileDirectoryRoute, RouteDelegate, IForgeRoute, IForgeRouteHook, ForgeRoute, ForgeSocketRoute, HTTPRoute, DummySocket, ExecSocket, ForgeProtocol, Signal, SignalConstraint, SocketSession, SignalResult, SocketConfig, SignalConstraints, IForgeSocket, AbstractForgeSocket, ForgeWebsocket, ForkSocket, ModulesExportSocket, PlaybackSocket, RequestSocket, SpawnSocket, WorkerSocket, ForgeSwarm, ForgeSyntaxExpression, GenericExpression, ScopeExpression, CompositeComponent, SequentialExpression, ParseAttributes, ForgeSyntaxParser, ParsedToken, StatementAttributes, SyntaxParsingState, IForgeSyntaxExpression, ForgeSyntaxStatement, ForgeTokenIterator, ForgeTokenizer, ForgeVirtualScript };
	
	
	

}