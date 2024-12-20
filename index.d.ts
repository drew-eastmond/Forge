declare module "@onyx-ignition/forge-core" {
	export class Accessor {
	    private _source;
	    private _entries;
	    constructor(source: Record<string, unknown>, seperator?: string);
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
	    fetch(accessor: string[]): unknown;
	    parse(query: string, seperator: string): unknown;
	    inject(input: string, regExp: RegExp, options?: {
	        splitter?: RegExp;
	        delegate?: (match: string, access: string) => string;
	    }): string;
	}
	
		/**
	 * Use to store data about how to parse an argument
	 *
	 * @typedef {Object} ValidationEntry
	 *
	 * @property {(unknown|undefined)}  default - The default value if none is provided.
	 * @property {(boolean|undefined)}  required - Is this argument required. Provide an error if `undefined`.
	 * @property {(error|undefined)}  error - Overrides the default error message.
	 * @property {(Function|undefined)}  sanitize - (optional) A callback to transform the supplied value for an aurgument.
	 * @property {(Function|undefined)}  validate - (optional) A callback to evaluate if the value if valid otherwise it will provide a error.
	 *
	 */
	type ValidationEntry = {
	    default?: unknown;
	    required?: boolean;
	    error?: string;
	    sanitize?: (value: unknown, args: Record<string, unknown>) => unknown;
	    validate?: (value: unknown, args: Record<string, unknown>) => boolean;
	};
	export interface IForgeArguments {
	    get(): unknown;
	    get(key?: string | RegExp): unknown;
	    get(key?: string | RegExp): unknown;
	    parse(input: string): void;
	    add(key: string | RegExp, config: ValidationEntry): this;
	    compile(): void;
	}
	/**
	 * Provides a base to store validation data and arguments formatted as a Record.
	 * After the subclass populates the arguments store, and add validation for each key.
	 * The `compile` member will test each key, and throw an error before resolving all validation queries.
	 *
	 */
	class AbstractArguments implements IForgeArguments {
	    protected readonly _args: Record<string, unknown>;
	    protected readonly _validationMap: Map<string | RegExp, ValidationEntry>;
	    protected readonly _errors: string[];
	    constructor();
	    /**
	     * Iterates via Object.entries(...) on the internal _args property
	     *
	     * @generator
	     * @yields {[string, unknown]}
	     */
	    [Symbol.iterator](): Iterator<[string, unknown]>;
	    /**
	     * This function will
	     *      1. Inject a default if no value is provided
	     *      2. Test if it is a required parameter, or add to internal errors
	     *      3. Sanitize the value via the `validation.validator` delegate
	     *
	     * @param key {string} The key extracted from parsing
	     * @param value {unknown} The value extracted from parsing
	     * @param validation {ValidationEntry} Provides info for default, is required, and a validator to sanitize the
	     * @returns {unknown} If the `validation` param has a delegate then it will sanitize value.
	     */
	    protected _validate(key: string | RegExp, value: unknown, validation: ValidationEntry): unknown;
	    /**
	     * Find the requested key in the internal args members. Can evaluate using `String` or `RegExp`
	     *
	     * @param key {string|RegExp} Optional
	     * @returns {boolean}
	     */
	    has(key: string | RegExp): boolean;
	    /**
	     * Getter that will return the value associated with the key, or the arguments collection {Record<string, unknown>)
	     * if a RegExp the is passed then this function will returnt he first value that matches.
	     * if a string is pass then the value of the indexed value will be returned.
	     * if no value is passed then the whole arg object is returned.
	     *
	     * @param key {string|RegExp|undefined} Optional
	     * @returns {unknown} DO l really need to explain this
	     */
	    get<T = unknown>(): T;
	    get<T = unknown>(key: string | RegExp): T;
	    /**
	     * Assigns a validation check to specific arguments via the key provided
	     *
	     * @param key {string|RegExp} A string or RegExp to match the Arguments and dispatch delegate
	     * @param validationEntry {ValidationEntry}
	     * @returns {this} return this so you can daisy chain calls
	     */
	    add(key: string | RegExp, validationEntry: ValidationEntry): this;
	    /**
	     * Subclasses are responsible for assigning a data source (CLI, .Env, Remote/Server) into a arguments {Record<string, unknown>}
	     *      1. After using `add` member to set all the validation entries.
	     *      2. `compile` will validate/sanitize each entry. If there any errors then join all errors messages into a single Error and throw it!
	     */
	    compile(): Record<string, unknown>;
	    parse(input: string): void;
	}
	/**
	 * Populates the arguments store based on values parsed from the CommandLine Interface.
	 * Parses the `process.argv` using the follwoing formats
	 *      1. {{KEY}} BASE_64_JSON : the second parameter will be auto encoded to a base64 encoded JSON
	 *      2. --KEY : will resolve to a true value if present
	 *      3. --KEY-- VALUE : second paramter resolve into a string. Probably needs to be sanitized in `compile`
	 *
	 * @class
	 */
	export class CLIArguments extends AbstractArguments {
	    compile(): Record<string, unknown>;
	}
	/**
	 * Populates the arguments store based on values parsed from the a .env file
	 * Parses the .env file based on the a simple splitting algorithm
	 *
	 * @class
	 */
	export class EnvArguments extends AbstractArguments {
	    /**
	     * Override the base `get` member to fetch values from a combination of the internal argument store and `process.env`
	     * @params key {string} I
	     */
	    get(): unknown;
	    get(key?: string): unknown;
	    /**
	     * Simple split alorithm to populate the arguemnt store
	     * @param contents {string} Content pulled from a .env or similiar formatted content; or you know... DIY if your a smart ass!
	     * @returns {this} Daisy chain this bad boi!
	     */
	    parse(contents: string): this;
	}
	/**
	 * Combines the `CLIArgument` and `EnvArgument` into a composite so development becomes easier. The priority is
	 * CLIArguments then EnvArguments. It's important to call the `parse` memeber for `EnvArgument`
	 * @class
	 */
	export class CompositeArguments extends AbstractArguments {
	    private readonly _cliArguments;
	    private readonly _envArguments;
	    compile(): Record<string, unknown>;
	    /**
	     * Invokes the `EnvArgument.parse ( ... )`
	     *
	     * @param contents
	     * @returns {this}
	     */
	    parse(contents: string): this;
	}
	
	
		
	export interface ICollection<T = unknown, U = unknown> {
	    [Symbol.iterator](): Iterator<[T, Attributes]>;
	    get size(): number;
	    get sources(): T[];
	    get entries(): [T, Attributes][];
	    attributes(source: T): Attributes;
	    add(source: T, attributes: Attributes): U;
	    remove(source: T): U;
	    clear(): [T, Attributes][];
	    find(callback: (source: T, attributes: Attributes) => boolean): T[];
	    get(index: number): T;
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
	    constructor(map?: Map<T, Attributes>);
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
	    clear(): [T, Attributes][];
	    clone(): ICollection<T>;
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
	    attributes(source: T): Attributes;
	    attributes(source: T, attributes: Attributes): Attributes;
	    traverse(source: T, traversal: Set<T>): Set<T>;
	    index(source: T): number;
	    add(source: T, attributes: Attributes): this;
	    add(source: T, attributes: Attributes, parent: T): this;
	    remove(source: T): this;
	    purge(source: T): void;
	    move(source: T, parent?: T, insert?: number): this;
	    order(parent: T, children: T[]): T[];
	    mutate(source: T, target: T): void;
	    parent(child: T): T;
	    children(source: T): T[];
	    siblings(source: T): Set<T>;
	    ancestry(source: T): T[];
	    depth(source: T): number;
	    has(source: T): boolean;
	    clear(): T[];
	    compile(): void;
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
	
		
	export type Attributes = Record<string, unknown>;
	export type IntervalClear = ReturnType<typeof setInterval>;
	export type TimeoutClear = ReturnType<typeof setTimeout>;
	export type Serialize = Record<string, unknown>;
	export type Capture<T = unknown> = boolean | string | Error | ((error: unknown) => unknown) | Promise<T>;
	export const EmptyData: ArrayBuffer;
	export function IsObject(item: unknown): boolean;
	export function CatchThrowError(error: any): any;
	export function CatchCapture<T = unknown>(capture: Capture): (error: unknown) => T;
	export function EmptyFunction(): void;
	export function EncodeBase64(json: Record<string, unknown>): string;
	export function DecodeBase64(value: string): any;
	export function FlattenObject<T = unknown>(entries: Record<string, T>, accessor?: string): {
	    access: string;
	    value: T;
	}[];
	export function QuickHash(): string;
	export function QuickHash(seperator: string): string;
	export type $Promise<Resolve = unknown, Reject = unknown> = [Promise<Resolve>, Function | ((resolve?: Resolve) => unknown), Function | ((resolve?: Reject) => unknown)];
	export function $UsePromise<Resolve = unknown, Reject = unknown>(): $Promise<Resolve, Reject>;
	export function $UsePromise<Resolve = unknown, Reject = unknown>(options: {
	    capture: Capture;
	}): $Promise<Resolve, Reject>;
	export function $RacePromise<T = unknown>($promise: Promise<T>, race: number): Promise<T>;
	export function $RacePromise<T = unknown>($promise: Promise<T>, race: number, capture: Capture): Promise<T>;
	export function $UseRace<Resolve = unknown, Reject = unknown>(race: number, options?: {
	    capture?: Capture;
	}): $Promise<Resolve, Reject>;
	export function $Wait<S, T>(delay: number, options?: {
	    reject?: T;
	    resolve?: S;
	}): Promise<S | T>;
	export function EscapeHTML(value: string): string;
	
		
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
	
		
	export function EncodeNumber(value: number): ArrayBuffer;
	export function EncodeNumber(value: number, data: ArrayBuffer): ArrayBuffer;
	export function DecodeNumber(data: ArrayBuffer): number;
	export function EncodedStringSize(value: string): number;
	export function EncodeString(value: string): ArrayBuffer;
	export function DecodeString(buffer: ArrayBuffer): string;
	export function DecodeAttributes(buffer: ArrayBuffer): Attributes;
	export function EncodeAttributes(attributes: Attributes): ArrayBuffer;
	export class Base64 {
	    static ArrayBuffer(input: string): ArrayBuffer;
	    static String(input: string): string;
	    static JSON(input: string, reviver?: (key: string, value: unknown, context?: Record<string, unknown>) => unknown): Record<string, unknown>;
	    static Encode(input: ArrayBuffer | Record<string, unknown> | string, replacer?: (key: string, value: unknown) => unknown): string;
	    static Replacer(key: string, value: unknown): unknown;
	    static Revivor(this: any, key: string, value: unknown): any;
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
	    readString(): string;
	    readAttributes(): Record<string, unknown>;
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
	
		export interface IPoolable {
	    init(...rest: unknown[]): void;
	    reclaim(): void;
	}
	export class PoolManager {
	    private static __ClassMap;
	    static Instantiate<T>(constructor: Function | (new () => T), ...rest: unknown[]): T;
	    static Reclaim(instance: any): void;
	}
	
		
	
	
	
	export class AttributesQuery {
	    static Intersect(objectA: Attributes, objectB: Attributes): boolean;
	    static And(objectA: Attributes, objectB: Attributes): boolean;
	    static Or(objectA: Attributes, objectB: Attributes): boolean;
	    static Not(objectA: Attributes, objectB: Attributes): boolean;
	    static All(objectA: Attributes, objectB: Attributes): boolean;
	    static Composite(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean;
	    static Custom(objectA: Attributes, objectB: Attributes): boolean;
	    static Greater(objectA: Attributes, objectB: Attributes): boolean;
	    static Less(objectA: Attributes, objectB: Attributes): boolean;
	}
	export type QueryCallback<T = unknown> = (component: T, attributes: Attributes, ...rest: unknown[]) => boolean;
	export interface IQuery<T = unknown> {
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get size(): number;
	    get iCollection(): ICollection<T>;
	    get last(): T;
	    get first(): T;
	    get(start: Number, end?: Number): T | T[];
	    has(callback: Function, ...rest: unknown[]): boolean;
	    add(component: T, attribute: Attributes): T;
	    remove(component: T): T;
	    clear(): void;
	    attributes(component: T): Attributes;
	    merge(...iQueries: IQuery<T>[]): this;
	    intersect(attributes: Attributes): IQuery<T>;
	    or(attributes: Attributes): IQuery<T>;
	    and(attributes: Attributes): IQuery<T>;
	    not(attributes: Attributes): IQuery<T>;
	    greater(attributes: Attributes): IQuery<T>;
	    less(attributes: Attributes): IQuery<T>;
	    group(key: unknown): Map<unknown, IQuery<T>>;
	    all(calback: Function, ...rest: unknown[]): IQuery<T>;
	    $all(calback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	    wait(): IWaitingQuery<T>;
	    subscription(): ISubscription;
	}
	export class QueryManager<T = unknown> implements IQuery<T> {
	    protected _iCollection: ICollection<T>;
	    protected _entries: [T, Attributes][];
	    protected readonly _subscription: Subscription;
	    constructor();
	    constructor(iCollection: ICollection<T>);
	    subscription(): ISubscription;
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get size(): number;
	    get iCollection(): ICollection<T>;
	    get last(): T;
	    get first(): T;
	    get(start: number, end?: number): T | T[];
	    has(callback: Function, ...rest: unknown[]): boolean;
	    add(component: T, attributes: Attributes): T;
	    remove(component: T): T;
	    clear(): void;
	    attributes(component: T): Attributes;
	    merge(...iQueries: IQuery<T>[]): this;
	    greater(attributes: Attributes): IQuery<T>;
	    less(attributes: Attributes): IQuery<T>;
	    intersect(attributes: Attributes): IQuery<T>;
	    or(attributes: Attributes): IQuery<T>;
	    and(attributes: Attributes): IQuery<T>;
	    not(attributes: Attributes): IQuery<T>;
	    composite(attributes: Attributes): IQuery<T>;
	    all(): IQuery<T>;
	    all(callback: Function): IQuery<T>;
	    all(callback: Function, ...rest: unknown[]): IQuery<T>;
	    $all(callback: Function): Promise<IQuery<T>>;
	    $all(callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	    wait(): IWaitingQuery<T>;
	    group(key: any): Map<unknown, IQuery<T>>;
	    transform(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => [T, Attributes], ...rest: unknown[]): IQuery<T>;
	}
	
		
	
	export type WaitConfirmation<T> = (networkModelComponent: T, attributes: Attributes, iQuery: IQuery, ...rest: unknown[]) => boolean;
	type WaitFilter = (attributesA: Attributes, attributesB: Attributes) => boolean;
	export interface IWaitingQuery<T = unknown> {
	    root(): IQuery<T>;
	    root(root?: IQuery<T>): IQuery<T>;
	    $async(): Promise<IQuery<T>>;
	    race(value: number): this;
	    confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this;
	    intersect(attributes: Attributes): IWaitingQuery<T>;
	    or(attributes: Attributes): IWaitingQuery<T>;
	    and(attributes: Attributes): IWaitingQuery<T>;
	    not(attributes: Attributes): IWaitingQuery<T>;
	    all(calback: WaitFilter): IWaitingQuery<T>;
	}
	export class WaitingQueryManager<T> implements IWaitingQuery<T> {
	    private readonly _thenResolve;
	    private readonly _catchReject;
	    protected _root: IQuery<T>;
	    protected _parent: {
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    };
	    protected _filter: {
	        callback: WaitFilter;
	        attributes: Attributes;
	    };
	    protected _$async: $Promise<IQuery<T>>;
	    protected _callback: WaitConfirmation<T>;
	    protected _rest: unknown[];
	    protected _queryManager: IQuery<[T, Attributes]>;
	    constructor(parent: {
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    }, attributes?: Attributes, filter?: WaitFilter);
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    protected _finally$Expired: any;
	    protected readonly _onSynchronize: any;
	    root(root?: IQuery<T>): IQuery<T>;
	    $async(): Promise<IQuery<T>>;
	    race(value: number): this;
	    confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this;
	    intersect(attributes: Attributes): IWaitingQuery<T>;
	    or(attributes: Attributes): IWaitingQuery<T>;
	    and(attributes: Attributes): IWaitingQuery<T>;
	    not(attributes: Attributes): IWaitingQuery<T>;
	    all(): IWaitingQuery<T>;
	    all(callback: WaitFilter): IWaitingQuery<T>;
	    $all($callback: Function): Promise<IQuery<T>>;
	    $all($callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	}
	
	
		
	
	export interface IResult<T = Attributes> extends IQuery<T> {
	    [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	    get $async(): Promise<this>;
	    resolve(): this;
	    reject(): this;
	}
	export class Result<T = Attributes> extends QueryManager<T> implements IResult<T> {
	    private readonly _$promise;
	    constructor();
	    constructor(capture: Capture);
	    get $async(): Promise<this>;
	    resolve(): this;
	    reject(): this;
	}
	
		export class Results<R = unknown, T = unknown> {
	    private _resolves;
	    private _rejects;
	    private _success;
	    constructor();
	    success(...value: unknown[]): this;
	    error(...value: unknown[]): this;
	    resolve(): void;
	    reject(): void;
	}
	
		
	export type Notification = string | RegExp | unknown;
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
	export const Unsubscribe: unknown;
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
	
		module "core/Debug" {
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
	}
	module "core/Core" {
	export type Attributes = Record<string, unknown>;
	    export type IntervalClear = ReturnType<typeof setInterval>;
	    export type TimeoutClear = ReturnType<typeof setTimeout>;
	    export type Serialize = Record<string, unknown>;
	    export type Capture<T = unknown> = boolean | string | Error | ((error: unknown) => unknown) | Promise<T>;
	    export const EmptyData: ArrayBuffer;
	    export function IsObject(item: unknown): boolean;
	    export function CatchThrowError(error: any): any;
	    export function CatchCapture<T = unknown>(capture: Capture): (error: unknown) => T;
	    export function EmptyFunction(): void;
	    export function EncodeBase64(json: Record<string, unknown>): string;
	    export function DecodeBase64(value: string): any;
	    export function FlattenObject<T = unknown>(entries: Record<string, T>, accessor?: string): {
	        access: string;
	        value: T;
	    }[];
	    export function QuickHash(): string;
	    export type $Promise<Resolve = unknown, Reject = unknown> = [Promise<Resolve>, Function | ((resolve?: Resolve) => unknown), Function | ((resolve?: Reject) => unknown)];
	    export function $UsePromise<Resolve = unknown, Reject = unknown>(): $Promise<Resolve, Reject>;
	    export function $UsePromise<Resolve = unknown, Reject = unknown>(options: {
	        capture: Capture;
	    }): $Promise<Resolve, Reject>;
	    export function $RacePromise<T = unknown>($promise: Promise<T>, race: number): Promise<T>;
	    export function $RacePromise<T = unknown>($promise: Promise<T>, race: number, capture: Capture): Promise<T>;
	    export function $UseRace<Resolve = unknown, Reject = unknown>(race: number, options?: {
	        capture?: Capture;
	    }): $Promise<Resolve, Reject>;
	    export function $Wait<S, T>(delay: number, options?: {
	        reject?: T;
	        resolve?: S;
	    }): Promise<S | T>;
	    export function EscapeHTML(value: string): string;
	}
	module "core/Accessor" {
	    export class Accessor {
	        private _source;
	        private _entries;
	        constructor(source: Record<string, unknown>, seperator?: string);
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
	        fetch(accessor: string[]): unknown;
	        parse(query: string, seperator: string): unknown;
	        inject(input: string, regExp: RegExp, options?: {
	            splitter?: RegExp;
	            delegate?: (match: string, access: string) => string;
	        }): string;
	    }
	}
	module "core/Argument" {
	    /**
	     * Use to store data about how to parse an argument
	     *
	     * @typedef {Object} ValidationEntry
	     *
	     * @property {(unknown|undefined)}  default - The default value if none is provided.
	     * @property {(boolean|undefined)}  required - Is this argument required. Provide an error if `undefined`.
	     * @property {(error|undefined)}  error - Overrides the default error message.
	     * @property {(Function|undefined)}  sanitize - (optional) A callback to transform the supplied value for an aurgument.
	     * @property {(Function|undefined)}  validate - (optional) A callback to evaluate if the value if valid otherwise it will provide a error.
	     *
	     */
	    type ValidationEntry = {
	        default?: unknown;
	        required?: boolean;
	        error?: string;
	        sanitize?: (value: unknown, args: Record<string, unknown>) => unknown;
	        validate?: (value: unknown, args: Record<string, unknown>) => boolean;
	    };
	    export interface IForgeArguments {
	        get(): unknown;
	        get(key?: string | RegExp): unknown;
	        get(key?: string | RegExp): unknown;
	        parse(input: string): void;
	        add(key: string | RegExp, config: ValidationEntry): this;
	        compile(): void;
	    }
	    /**
	     * Provides a base to store validation data and arguments formatted as a Record.
	     * After the subclass populates the arguments store, and add validation for each key.
	     * The `compile` member will test each key, and throw an error before resolving all validation queries.
	     *
	     */
	    class AbstractArguments implements IForgeArguments {
	        protected readonly _args: Record<string, unknown>;
	        protected readonly _validationMap: Map<string | RegExp, ValidationEntry>;
	        protected readonly _errors: string[];
	        constructor();
	        /**
	         * Iterates via Object.entries(...) on the internal _args property
	         *
	         * @generator
	         * @yields {[string, unknown]}
	         */
	        [Symbol.iterator](): Iterator<[string, unknown]>;
	        /**
	         * This function will
	         *      1. Inject a default if no value is provided
	         *      2. Test if it is a required parameter, or add to internal errors
	         *      3. Sanitize the value via the `validation.validator` delegate
	         *
	         * @param key {string} The key extracted from parsing
	         * @param value {unknown} The value extracted from parsing
	         * @param validation {ValidationEntry} Provides info for default, is required, and a validator to sanitize the
	         * @returns {unknown} If the `validation` param has a delegate then it will sanitize value.
	         */
	        protected _validate(key: string | RegExp, value: unknown, validation: ValidationEntry): unknown;
	        /**
	         * Find the requested key in the internal args members. Can evaluate using `String` or `RegExp`
	         *
	         * @param key {string|RegExp} Optional
	         * @returns {boolean}
	         */
	        has(key: string | RegExp): boolean;
	        /**
	         * Getter that will return the value associated with the key, or the arguments collection {Record<string, unknown>)
	         * if a RegExp the is passed then this function will returnt he first value that matches.
	         * if a string is pass then the value of the indexed value will be returned.
	         * if no value is passed then the whole arg object is returned.
	         *
	         * @param key {string|RegExp|undefined} Optional
	         * @returns {unknown} DO l really need to explain this
	         */
	        get<T = unknown>(): T;
	        get<T = unknown>(key: string | RegExp): T;
	        /**
	         * Assigns a validation check to specific arguments via the key provided
	         *
	         * @param key {string|RegExp} A string or RegExp to match the Arguments and dispatch delegate
	         * @param validationEntry {ValidationEntry}
	         * @returns {this} return this so you can daisy chain calls
	         */
	        add(key: string | RegExp, validationEntry: ValidationEntry): this;
	        /**
	         * Subclasses are responsible for assigning a data source (CLI, .Env, Remote/Server) into a arguments {Record<string, unknown>}
	         *      1. After using `add` member to set all the validation entries.
	         *      2. `compile` will validate/sanitize each entry. If there any errors then join all errors messages into a single Error and throw it!
	         */
	        compile(): Record<string, unknown>;
	        parse(input: string): void;
	    }
	    /**
	     * Populates the arguments store based on values parsed from the CommandLine Interface.
	     * Parses the `process.argv` using the follwoing formats
	     *      1. {{KEY}} BASE_64_JSON : the second parameter will be auto encoded to a base64 encoded JSON
	     *      2. --KEY : will resolve to a true value if present
	     *      3. --KEY-- VALUE : second paramter resolve into a string. Probably needs to be sanitized in `compile`
	     *
	     * @class
	     */
	    export class CLIArguments extends AbstractArguments {
	        compile(): Record<string, unknown>;
	    }
	    /**
	     * Populates the arguments store based on values parsed from the a .env file
	     * Parses the .env file based on the a simple splitting algorithm
	     *
	     * @class
	     */
	    export class EnvArguments extends AbstractArguments {
	        /**
	         * Override the base `get` member to fetch values from a combination of the internal argument store and `process.env`
	         * @params key {string} I
	         */
	        get(): unknown;
	        get(key?: string): unknown;
	        /**
	         * Simple split alorithm to populate the arguemnt store
	         * @param contents {string} Content pulled from a .env or similiar formatted content; or you know... DIY if your a smart ass!
	         * @returns {this} Daisy chain this bad boi!
	         */
	        parse(contents: string): this;
	    }
	    /**
	     * Combines the `CLIArgument` and `EnvArgument` into a composite so development becomes easier. The priority is
	     * CLIArguments then EnvArguments. It's important to call the `parse` memeber for `EnvArgument`
	     * @class
	     */
	    export class CompositeArguments extends AbstractArguments {
	        private readonly _cliArguments;
	        private readonly _envArguments;
	        compile(): Record<string, unknown>;
	        /**
	         * Invokes the `EnvArgument.parse ( ... )`
	         *
	         * @param contents
	         * @returns {this}
	         */
	        parse(contents: string): this;
	    }
	}
	module "core/collection/Collection" {
	export interface ICollection<T = unknown, U = unknown> {
	        [Symbol.iterator](): Iterator<[T, Attributes]>;
	        get size(): number;
	        get sources(): T[];
	        get entries(): [T, Attributes][];
	        attributes(source: T): Attributes;
	        add(source: T, attributes: Attributes): U;
	        remove(source: T): U;
	        clear(): [T, Attributes][];
	        find(callback: (source: T, attributes: Attributes) => boolean): T[];
	        get(index: number): T;
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
	        constructor(map?: Map<T, Attributes>);
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
	        clear(): [T, Attributes][];
	        clone(): ICollection<T>;
	    }
	}
	module "core/data/Data" {
	export function EncodeNumber(value: number): ArrayBuffer;
	    export function EncodeNumber(value: number, data: ArrayBuffer): ArrayBuffer;
	    export function DecodeNumber(data: ArrayBuffer): number;
	    export function EncodedStringSize(value: string): number;
	    export function EncodeString(value: string): ArrayBuffer;
	    export function DecodeString(buffer: ArrayBuffer): string;
	    export function DecodeAttributes(buffer: ArrayBuffer): Attributes;
	    export function EncodeAttributes(attributes: Attributes): ArrayBuffer;
	    export class Base64 {
	        static ArrayBuffer(input: string): ArrayBuffer;
	        static String(input: string): string;
	        static JSON(input: string, reviver?: (key: string, value: unknown, context?: Record<string, unknown>) => unknown): Record<string, unknown>;
	        static Encode(input: ArrayBuffer | Record<string, unknown> | string, replacer?: (key: string, value: unknown) => unknown): string;
	        static Replacer(key: string, value: unknown): unknown;
	        static Revivor(this: any, key: string, value: unknown): any;
	    }
	}
	module "core/data/StreamData" {
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
	        readString(): string;
	        readAttributes(): Record<string, unknown>;
	    }
	}
	module "core/PoolManager" {
	    export interface IPoolable {
	        init(...rest: unknown[]): void;
	        reclaim(): void;
	    }
	    export class PoolManager {
	        private static __ClassMap;
	        static Instantiate<T>(constructor: Function | (new () => T), ...rest: unknown[]): T;
	        static Reclaim(instance: any): void;
	    }
	}
	module "core/Subscription" {
	export type Notification = string | RegExp | unknown;
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
	    export const Unsubscribe: unknown;
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
	}
	module "core/query/wait/WaitingQueryManager" {
	
	export type WaitConfirmation<T> = (networkModelComponent: T, attributes: Attributes, iQuery: IQuery, ...rest: unknown[]) => boolean;
	    type WaitFilter = (attributesA: Attributes, attributesB: Attributes) => boolean;
	    export interface IWaitingQuery<T = unknown> {
	        root(): IQuery<T>;
	        root(root?: IQuery<T>): IQuery<T>;
	        $async(): Promise<IQuery<T>>;
	        race(value: number): this;
	        confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this;
	        intersect(attributes: Attributes): IWaitingQuery<T>;
	        or(attributes: Attributes): IWaitingQuery<T>;
	        and(attributes: Attributes): IWaitingQuery<T>;
	        not(attributes: Attributes): IWaitingQuery<T>;
	        all(calback: WaitFilter): IWaitingQuery<T>;
	    }
	    export class WaitingQueryManager<T> implements IWaitingQuery<T> {
	        private readonly _thenResolve;
	        private readonly _catchReject;
	        protected _root: IQuery<T>;
	        protected _parent: {
	            [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        };
	        protected _filter: {
	            callback: WaitFilter;
	            attributes: Attributes;
	        };
	        protected _$async: $Promise<IQuery<T>>;
	        protected _callback: WaitConfirmation<T>;
	        protected _rest: unknown[];
	        protected _queryManager: IQuery<[T, Attributes]>;
	        constructor(parent: {
	            [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        }, attributes?: Attributes, filter?: WaitFilter);
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        protected _finally$Expired: any;
	        protected readonly _onSynchronize: any;
	        root(root?: IQuery<T>): IQuery<T>;
	        $async(): Promise<IQuery<T>>;
	        race(value: number): this;
	        confirmation(callback: WaitConfirmation<T>, ...rest: unknown[]): this;
	        intersect(attributes: Attributes): IWaitingQuery<T>;
	        or(attributes: Attributes): IWaitingQuery<T>;
	        and(attributes: Attributes): IWaitingQuery<T>;
	        not(attributes: Attributes): IWaitingQuery<T>;
	        all(): IWaitingQuery<T>;
	        all(callback: WaitFilter): IWaitingQuery<T>;
	        $all($callback: Function): Promise<IQuery<T>>;
	        $all($callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	    }
	}
	module "core/query/QueryManager" {
	
	
	
	export class AttributesQuery {
	        static Intersect(objectA: Attributes, objectB: Attributes): boolean;
	        static And(objectA: Attributes, objectB: Attributes): boolean;
	        static Or(objectA: Attributes, objectB: Attributes): boolean;
	        static Not(objectA: Attributes, objectB: Attributes): boolean;
	        static All(objectA: Attributes, objectB: Attributes): boolean;
	        static Composite(objectA: Attributes, objectB: Attributes, ...rest: unknown[]): boolean;
	        static Custom(objectA: Attributes, objectB: Attributes): boolean;
	        static Greater(objectA: Attributes, objectB: Attributes): boolean;
	        static Less(objectA: Attributes, objectB: Attributes): boolean;
	    }
	    export type QueryCallback<T = unknown> = (component: T, attributes: Attributes, ...rest: unknown[]) => boolean;
	    export interface IQuery<T = unknown> {
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        get size(): number;
	        get iCollection(): ICollection<T>;
	        get last(): T;
	        get first(): T;
	        get(start: Number, end?: Number): T | T[];
	        has(callback: Function, ...rest: unknown[]): boolean;
	        add(component: T, attribute: Attributes): T;
	        remove(component: T): T;
	        clear(): void;
	        attributes(component: T): Attributes;
	        merge(...iQueries: IQuery<T>[]): this;
	        intersect(attributes: Attributes): IQuery<T>;
	        or(attributes: Attributes): IQuery<T>;
	        and(attributes: Attributes): IQuery<T>;
	        not(attributes: Attributes): IQuery<T>;
	        greater(attributes: Attributes): IQuery<T>;
	        less(attributes: Attributes): IQuery<T>;
	        group(key: unknown): Map<unknown, IQuery<T>>;
	        all(calback: Function, ...rest: unknown[]): IQuery<T>;
	        $all(calback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	        wait(): IWaitingQuery<T>;
	        subscription(): ISubscription;
	    }
	    export class QueryManager<T = unknown> implements IQuery<T> {
	        protected _iCollection: ICollection<T>;
	        protected _entries: [T, Attributes][];
	        protected readonly _subscription: Subscription;
	        constructor();
	        constructor(iCollection: ICollection<T>);
	        subscription(): ISubscription;
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        get size(): number;
	        get iCollection(): ICollection<T>;
	        get last(): T;
	        get first(): T;
	        get(start: number, end?: number): T | T[];
	        has(callback: Function, ...rest: unknown[]): boolean;
	        add(component: T, attributes: Attributes): T;
	        remove(component: T): T;
	        clear(): void;
	        attributes(component: T): Attributes;
	        merge(...iQueries: IQuery<T>[]): this;
	        greater(attributes: Attributes): IQuery<T>;
	        less(attributes: Attributes): IQuery<T>;
	        intersect(attributes: Attributes): IQuery<T>;
	        or(attributes: Attributes): IQuery<T>;
	        and(attributes: Attributes): IQuery<T>;
	        not(attributes: Attributes): IQuery<T>;
	        composite(attributes: Attributes): IQuery<T>;
	        all(): IQuery<T>;
	        all(callback: Function): IQuery<T>;
	        all(callback: Function, ...rest: unknown[]): IQuery<T>;
	        $all(callback: Function): Promise<IQuery<T>>;
	        $all(callback: Function, ...rest: unknown[]): Promise<IQuery<T>>;
	        wait(): IWaitingQuery<T>;
	        group(key: any): Map<unknown, IQuery<T>>;
	        transform(callback: (component: T, attributes: Attributes, ...rest: unknown[]) => [T, Attributes], ...rest: unknown[]): IQuery<T>;
	    }
	}
	module "forge/core/ForgeRace" {
	    export class ForgeRace {
	        private _default;
	        private _race;
	        constructor(race: Record<string, number>);
	        constructor(race: Map<RegExp, number>);
	        query(): number;
	        query(value: string): number;
	    }
	}
	module "forge/server/ForgeRequest" {
	    export interface IForgeRequestAdapter {
	        url: string;
	        headers: Record<string, string>;
	        cookies: Record<string, string>;
	        method: string;
	        protocol: string;
	        originalUrl: string;
	        get(key: string): string;
	        on(type: string, delegate: Function): this;
	    }
	    export class ForgeRequest {
	        private _parseBody;
	        private _$body;
	        source: IForgeRequestAdapter;
	        url: URL;
	        search: Record<string, string>;
	        queryString: string;
	        query: Record<string, string>;
	        method: string;
	        headers: Record<string, string>;
	        cookies: Record<string, string>;
	        routes: string[];
	        constructor(source: IForgeRequestAdapter);
	        $body(race: number): Promise<ArrayBuffer>;
	        get mime(): string;
	        path(startRoute: string): string;
	        fullURL(startRoute?: string): string;
	    }
	}
	module "forge/server/ForgeResponse" {
	
	export type ResponseOutput = string | ArrayBuffer | ArrayBufferView | Buffer;
	    export interface IResponseAdapter {
	        setHeader(key: string, value: string): void;
	        status(value: number): any;
	        send(buffer: Buffer): void;
	        end(): void;
	        type(value: string): void;
	        write(data: any): void;
	    }
	    export class ForgeResponseChunk {
	        private _writes;
	        private _$complete;
	        [Symbol.iterator](): IterableIterator<ResponseOutput>;
	        [Symbol.asyncIterator](): AsyncIterableIterator<ResponseOutput>;
	        constructor();
	        write(data: ResponseOutput): this;
	        clear(): this;
	        end(): void;
	    }
	    export class ForgeResponse {
	        private _response;
	        private _writes;
	        private _status;
	        private _$end;
	        private _race;
	        errors: Set<unknown>;
	        query: QueryManager<unknown>;
	        constructor(response: IResponseAdapter, race: number);
	        set type(value: string);
	        set status(value: number);
	        header(entries: Record<string, string>): this;
	        header(key: string, value?: string): this;
	        clear(): void;
	        chunk(attributes: Attributes): void;
	        write(data: string | ArrayBuffer | ArrayBufferView | Buffer): void;
	        stream(buffer: ArrayBuffer): void;
	        flush(): void;
	        end(): void;
	        unwrap(): IResponseAdapter;
	    }
	}
	module "forge/server/route/ForgeRoute" {
	
	export type RouteDelegate = (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	    export interface IForgeRoute {
	        $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    }
	    export type IForgeRouteComponent = {
	        $authorize?: RouteDelegate;
	        $resolve?: RouteDelegate;
	        $reject?: RouteDelegate;
	        $finally?: RouteDelegate;
	    };
	    export class ForgeRoute implements IForgeRoute, IForgeRouteComponent {
	        protected static Race: number;
	        static Authorize: {
	            Match: (...matches: string[]) => RouteDelegate;
	            RegExp: (regExp: RegExp, options?: {
	                groups?: string;
	                index?: number;
	            }) => RouteDelegate;
	            All: (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	        };
	        static RegExpURL(regExp: RegExp): ForgeRoute;
	        protected _components: Set<IForgeRouteComponent>;
	        protected _race: number;
	        constructor();
	        constructor(config: {
	            race?: number;
	            components?: IForgeRouteComponent[];
	        });
	        $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        add(component: IForgeRouteComponent): this;
	    }
	    export class CaptureRoute extends ForgeRoute {
	        private _$delegate;
	        constructor($delegate: RouteDelegate, passthrough?: boolean);
	        $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    }
	}
	module "forge/socket/ForgeSocket" {
	
	
	
	enum StdioOption {
	        Pipe = "pipe",
	        Inherit = "inherit",
	        Silent = "silent"
	    }
	    export type SocketConfig = {
	        command?: string;
	        debounce?: number;
	        stdio?: string;
	        race?: Record<string, number>;
	        key?: string;
	        reboot?: boolean;
	    };
	    export interface IForgeSocket extends ISubscription {
	        routes: Set<IForgeRoute>;
	        get key(): string;
	        get name(): string;
	        get $ready(): Promise<Serialize>;
	        race(): number;
	        race(value: string): number;
	        read(message: [string, Record<string, unknown>, Serialize]): void;
	        write(header: Omit<Record<string, unknown>, "key">, data: Serialize): void;
	        resolve(header: Record<string, unknown>, data: Serialize): void;
	        reject(header: Record<string, unknown>, data: Serialize): void;
	        $reset(data: Serialize): Promise<Serialize>;
	        $start(data: Serialize): Promise<Serialize>;
	        $session(header: Record<string, unknown>, data: Serialize, race: number): Promise<Serialize>;
	        $signal(signal: string, data: Serialize): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	        $reboot(): Promise<void>;
	    }
	    export class AbstractForgeSocket extends Subscription implements IForgeSocket {
	        protected _name: string;
	        protected _key: string;
	        protected _reboot: boolean;
	        protected _stdio: StdioOption;
	        protected readonly _race: ForgeRace;
	        protected readonly _sessions: Map<string, $Promise<unknown>>;
	        protected readonly _bindings: Map<Function, Function>;
	        protected readonly _$start: $Promise<Serialize>;
	        protected readonly _$ready: $Promise<Serialize>;
	        readonly routes: Set<IForgeRoute>;
	        constructor(name: string, config: SocketConfig);
	        protected _pipeStdio(message: string): void;
	        protected _pipeError(message: string): void;
	        protected _getSession(race: number, capture: Capture): [string, $Promise<Serialize>];
	        protected _$thenStart(data: Serialize): Promise<void>;
	        get key(): string;
	        get name(): string;
	        race(): number;
	        race(value: string): number;
	        get $ready(): Promise<Serialize>;
	        $start(data: Serialize): Promise<Serialize>;
	        read(message: [string, Record<string, unknown>, Serialize]): boolean;
	        write(header: Record<string, unknown>, data: Serialize): void;
	        resolve(header: Record<string, unknown>, data: Serialize): void;
	        reject(header: Record<string, unknown>, data: Serialize): void;
	        $reset(data: Serialize): Promise<Serialize>;
	        $session(header: Record<string, unknown>, data: Serialize, race: number): Promise<Serialize>;
	        $signal(signal: string, data: Serialize): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	        $broadcast(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        $reboot(): Promise<void>;
	    }
	}
	module "forge/model/proxy/ForgeModelProxy" {
	
	
	
	
	export interface IForgeModelProxy {
	        [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	        $activate(): Promise<void>;
	        $deactivate(): Promise<void>;
	        $frame(): Promise<void>;
	        $flush(): Promise<void>;
	        $connect(iStore: IForgeStore, hash: string): Promise<void>;
	        $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	        $fork(oarent: IForgeStore, child: IForgeStore): Promise<void>;
	        $read(iStore: IForgeStore): Promise<void>;
	        $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	        $purge(iStore: IForgeStore): Promise<void>;
	        $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    }
	    export class AbstractForgeModelProxy extends Subscription implements IForgeModelProxy {
	        protected _iModel: IForgeModel;
	        protected _bindings: Map<Function, Function>;
	        constructor(iModel: IForgeModel);
	        [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	        $activate(): Promise<void>;
	        $deactivate(): Promise<void>;
	        $fork(parent: IForgeStore, children: IForgeStore): Promise<void>;
	        $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	        $read(iStore: IForgeStore): Promise<void>;
	        $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	        $purge(iStore: IForgeStore): Promise<void>;
	        $connect(iStore: IForgeStore, hash: string): Promise<void>;
	        $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	        $frame(): Promise<void>;
	        $flush(): Promise<void>;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    }
	    export class ForgeModelProxyManager {
	        private readonly _iProxies;
	        [Symbol.iterator](): IterableIterator<[IForgeModelProxy, Attributes]>;
	        $add(iProxy: IForgeModelProxy, attributes: Attributes): Promise<void>;
	        remove(iProxy: IForgeModelProxy): Promise<void>;
	        $connect(iStore: IForgeStore, hash: string): Promise<void>;
	        $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	        $fork(parent: IForgeStore, child: IForgeStore): Promise<void>;
	        $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	        $read(iStore: IForgeStore): Promise<void>;
	        $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	        $purge(iStore: IForgeStore): Promise<void>;
	        $frame(): Promise<void>;
	        $flush(): Promise<void>;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    }
	}
	module "forge/model/ForgeModel" {
	
	
	
	
	
	export function $CompareModels(iModelA: IForgeModel, iModelB: IForgeModel): Promise<boolean>;
	    export interface IForgeModel {
	        [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	        [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	        get proxies(): ForgeModelProxyManager;
	        get state(): string;
	        get root(): IForgeStore;
	        get(hash: string): IForgeStore;
	        $hash(iStore: IForgeStore): Promise<string>;
	        $attributes(iStore: IForgeStore): Promise<Attributes>;
	        $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	        $parent(iStore: IForgeStore): Promise<IForgeStore>;
	        $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	        $fork(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
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
	    export class ForgeModel implements IForgeModel {
	        protected _hash: string;
	        protected _root: IForgeStore;
	        protected _state: string;
	        protected _proxies: ForgeModelProxyManager;
	        protected readonly _topology: Topology<IForgeStore>;
	        protected readonly _hashMap: Map<IForgeStore, string>;
	        protected readonly _dataMap: Map<IForgeStore, [ArrayBuffer, string]>;
	        protected readonly _waitMap: Map<string, $Promise<IForgeStore>>;
	        protected readonly _lockMap: Map<IForgeStore, string>;
	        race: number;
	        constructor();
	        constructor(attributes: Attributes);
	        constructor(root: IForgeStore);
	        [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	        [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	        protected _$nextHash(): Promise<string>;
	        protected _raceStore(hash: string): $Promise<IForgeStore>;
	        protected _$remove(iStore: IForgeStore): Promise<void>;
	        get state(): string;
	        get root(): IForgeStore;
	        get proxies(): ForgeModelProxyManager;
	        $hash(iStore: IForgeStore): Promise<string>;
	        $attributes(iStore: IForgeStore): Promise<Attributes>;
	        $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	        $parent(iStore: IForgeStore): Promise<IForgeStore>;
	        $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	        get(query: string): IForgeStore;
	        $fork(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
	        $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	        $traverse(iStore: IForgeStore): Promise<IForgeStore[]>;
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
	        $hasLock(iStore: IForgeStore): Promise<boolean>;
	        $lock(iStore: IForgeStore): Promise<string>;
	        $unlock(hash: string): Promise<IForgeStore>;
	        $import(iStore: IForgeStore, importData: {
	            parent: string | IForgeStore;
	            data: ArrayBuffer;
	            mime: string;
	        }): Promise<IForgeStore>;
	        $frame(): Promise<this>;
	        $flush(): Promise<this>;
	        $query(): Promise<IQuery<IForgeStore>>;
	        $query(parent: IForgeStore): Promise<IQuery<IForgeStore>>;
	        $query(parent: IForgeStore, recursive: boolean): Promise<IQuery<IForgeStore>>;
	        $validate(iStore: IForgeStore): Promise<true | Error[]>;
	        $write(iStore: IForgeStore, data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	        $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<IForgeStore>;
	        $wait(hash: string): Promise<IForgeStore>;
	        $read(iStore: IForgeStore): Promise<[ArrayBuffer, string]>;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	        toString(): string;
	    }
	}
	module "forge/model/store/ForgeStore" {
	
	
	
	export enum ForgeStoreMime {
	        Released = "forge/released",
	        Undefined = "forge/undefined",
	        Number = "forge/number",
	        Binary = "forge/binary",
	        JSON = "application/json",
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
	    export interface IForgeStore {
	        [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	        get hash(): string;
	        get attributes(): Attributes;
	        get $children(): Promise<IForgeStore[]>;
	        get $parent(): Promise<IForgeStore>;
	        get $ancestry(): Promise<IForgeStore[]>;
	        $ready(race: number): Promise<this>;
	        $connect(iModel: IForgeModel): Promise<this>;
	        $purge(): Promise<IForgeStore[]>;
	        $fork(iForgeStore: IForgeStore): Promise<IForgeStore>;
	        $order(iForgeStores: IForgeStore[]): Promise<void>;
	        $find(callback: (value: IForgeStore, attributes: Attributes) => boolean): Promise<IForgeStore[]>;
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
	        static Null: string;
	        static Header: string;
	        static Race: number;
	        static Empty(attributes: Attributes): ForgeStore;
	        static Number(attributes: Attributes, value: number): ForgeStore;
	        static JSON(attributes: Attributes, value: Record<string, unknown>): ForgeStore;
	        static Binary(attributes: Attributes, value: ArrayBuffer): IForgeStore;
	        static Store(attributes: Attributes, value: ArrayBuffer, mime: string): IForgeStore;
	        protected _mime: string;
	        protected _attributes: Attributes;
	        protected _hash: string;
	        protected _lock: string;
	        protected _releasedStore: IForgeStore;
	        protected readonly _$connectModel: $Promise<IForgeModel>;
	        protected readonly _$iModel: $Promise<IForgeModel>;
	        protected readonly _$released: $Promise<IForgeStore>;
	        protected readonly _$body: $Promise<[ArrayBuffer, string]>;
	        protected readonly _$ready: $Promise<this>;
	        constructor(attributes: Attributes);
	        constructor(readStream: DataStreamReader);
	        constructor(attributes: Attributes, iModel: IForgeModel);
	        constructor(readStream: DataStreamReader, iModel: IForgeModel);
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
	        write(data: ArrayBuffer, mime: string): this;
	        $ready(race: number): Promise<this>;
	        $connect(iModel: IForgeModel): Promise<this>;
	        $lock(): Promise<void>;
	        $unlock(): Promise<void>;
	        $hasLock(): Promise<boolean>;
	        $purge(): Promise<IForgeStore[]>;
	        $fork(child: IForgeStore): Promise<IForgeStore>;
	        $order(iForgeStores: IForgeStore[]): Promise<void>;
	        $write(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	        $read(): Promise<[ArrayBuffer, string]>;
	        $mutate(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	        $query(): Promise<IQuery<IForgeStore>>;
	        $query(recursive: boolean): Promise<IQuery<IForgeStore>>;
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
	}
	module "core/collection/Topology" {
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
	        attributes(source: T): Attributes;
	        attributes(source: T, attributes: Attributes): Attributes;
	        traverse(source: T, traversal: Set<T>): Set<T>;
	        index(source: T): number;
	        add(source: T, attributes: Attributes): this;
	        add(source: T, attributes: Attributes, parent: T): this;
	        remove(source: T): this;
	        purge(source: T): void;
	        move(source: T, parent?: T, insert?: number): this;
	        order(parent: T, children: T[]): T[];
	        mutate(source: T, target: T): void;
	        parent(child: T): T;
	        children(source: T): T[];
	        siblings(source: T): Set<T>;
	        ancestry(source: T): T[];
	        depth(source: T): number;
	        has(source: T): boolean;
	        clear(): T[];
	        compile(): void;
	    }
	}
	module "core/collection/TreeNode" {
	
	
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
	}
	module "core/crypto/Cipher" {
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
	}
	module "core/crypto/Hash" {
	    export function MD5(string: string): string;
	}
	module "core/Enforcement" {
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
	}
	module "core/Mimes" {
	    export const Mimes: {
	        Find: (file: string) => string;
	        Set: (file: string, mime: string) => void;
	        $Load: (file: string) => Promise<void>;
	        $Append: () => Promise<void>;
	    };
	}
	module "core/Result" {
	export interface IResult<T = unknown> {
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        values: Map<T, Attributes>;
	        $async: Promise<this>;
	        resolve(): this;
	        reject(): this;
	    }
	    export class Result<T> implements IResult {
	        private readonly _$promise;
	        readonly values: Map<T, Attributes>;
	        constructor();
	        constructor(capture: Capture);
	        [Symbol.iterator](): IterableIterator<[T, Attributes]>;
	        get $async(): Promise<this>;
	        resolve(): this;
	        reject(): this;
	    }
	}
	module "core/thottle/SequentialThottle" {
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
	}
	module "core/timing/Debounce" {
	    export class Debouncer {
	        private readonly _callbackMap;
	        constructor();
	        debounce(delegate: Function, parameters: unknown[], delay: number): void;
	        reset(): void;
	        clear(): void;
	    }
	}
	module "forge/os/io/ForgePath" {
	    export type ForgeParsedPath = {
	        root: string;
	        dir: string;
	        base: string;
	        ext: string;
	        name: string;
	    };
	    export class ForgePath {
	        static Parse(file: string): ForgeParsedPath;
	        static Resolve(...rest: string[]): string;
	        static Relative(source: string, target: string): string;
	        static Contains(source: string, target: string): boolean;
	        static $Status(root: string, target: string): Promise<{
	            isSubdirectory: boolean;
	            exists: boolean;
	            contains: boolean;
	        }>;
	        static Sanitize(...rest: string[]): string;
	    }
	}
	module "forge/os/io/ForgeIO" {
	
	class ForgeFile {
	        static Path: typeof ForgePath;
	        static Stream: {
	            Write: (file: string, options?: {}) => {
	                write: (contents: string | Buffer | ArrayBuffer) => void;
	                $end: () => Promise<string>;
	            };
	        };
	        static $Status(target: string): Promise<any>;
	        static $FileExist(file: string): Promise<boolean>;
	        static $DirectoryExists(path: string): Promise<boolean>;
	        static $MakeDirectory(path: string): Promise<boolean>;
	        static Read(path: string, options?: Record<string, unknown>): ArrayBuffer;
	        static $ReadString(path: string, encoding?: 'utf8' | string): Promise<string>;
	        static $Read(path: string): Promise<ArrayBuffer>;
	        static $Write(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	        static $Write(path: string, contents: string | Buffer | ArrayBuffer, options: {}): Promise<void>;
	        static $Append(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	        static $Append(path: string, contents: string | Buffer | ArrayBuffer, options: {}): Promise<void>;
	        static $Copy(source: string, target: string): Promise<void>;
	        static $Walk(root: string): Promise<string[]>;
	        static $Walk(root: string, recursive: false): Promise<string[]>;
	        static $Walk(root: string, fileList: string[]): Promise<string[]>;
	        static $Watch(root: string): Promise<ForgeFileWatcher>;
	    }
	    export class ForgeFileWatcher extends Subscription {
	        private _$watcher;
	        private _abortController;
	        constructor(root: string);
	        [Symbol.asyncIterator](): AsyncIterableIterator<{
	            event: string;
	            file: string;
	        }>;
	        cancel(): void;
	    }
	    class ForgeWeb {
	        static $Fetch(url: string, options: Record<string, unknown>): Promise<Response>;
	    }
	    export class ForgeIO {
	        static readonly File: typeof ForgeFile;
	        static readonly Web: typeof ForgeWeb;
	        static $Fetch(source: string): Promise<ArrayBuffer>;
	        static $Download(url: string, file: string): Promise<boolean>;
	    }
	}
	module "forge/server/ForgeServer" {
	
	
	export function $ParseRequestBody(request: any): Promise<[ArrayBuffer, string]>;
	    export class RequestBodyParser {
	        private _buffers;
	        private _request;
	        private _$buffer;
	        private _onData;
	        constructor(request: any);
	        private _onEnd;
	        $resolve(): Promise<{
	            mime: string;
	            buffer: Buffer;
	        }>;
	    }
	    export class ForgeServer {
	        private _app;
	        protected _$catchRoute: (error: unknown) => false;
	        readonly routes: Set<IForgeRoute>;
	        constructor(port: number);
	        protected _buildRequest(request: any): ForgeRequest;
	        protected _buildResponse(response: any): ForgeResponse;
	        private _$setupServer;
	        use(delegate: Function): void;
	        protected _$all(request: any, response: any, next: Function): Promise<void>;
	    }
	}
	module "forge/socket/SpawnSocket" {
	
	export class SpawnSocket extends AbstractForgeSocket {
	        private _source;
	        private _commands;
	        constructor(name: string, config: SocketConfig, source?: any);
	        private _onExit;
	        write(header: Serialize, ...data: Serialize[]): void;
	    }
	}
	module "forge/socket/ForkSocket" {
	
	export class ForkSocket extends AbstractForgeSocket {
	        private _source;
	        private _commands;
	        private _args;
	        constructor(name: string, config: SocketConfig, source?: any);
	        private _onExit;
	        write(header: Omit<Serialize, "key">, data: Serialize): void;
	    }
	}
	module "forge/socket/ExecSocket" {
	
	export class ExecSocket extends AbstractForgeSocket {
	        private _source;
	        private _command;
	        private _config;
	        constructor(name: string, config: SocketConfig);
	        private _injectCommand;
	        write(header: Serialize, data: Serialize): void;
	        $signal(signal: string, data: Serialize): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    }
	}
	module "forge/Forge" {
	
	
	
	
	export class Forge {
	        private _forgeServer;
	        private _iModel;
	        private readonly _taskMap;
	        private readonly _ignoreArr;
	        private readonly _controller;
	        readonly sockets: Map<string, IForgeSocket>;
	        private readonly _iStores;
	        constructor();
	        private _addSocket;
	        private _buildSocket;
	        parse(input: string, options?: {}): Record<string, unknown>;
	        get model(): IForgeModel;
	        tasks(): Map<string, ForgeTask>;
	        add(forgeTask: ForgeTask): this;
	        spawn(name: string, config: SocketConfig & {
	            command: string;
	        }): IForgeSocket;
	        fork(name: string, config: SocketConfig & {
	            command: string;
	        }): IForgeSocket;
	        worker(name: string, config: SocketConfig & {
	            command: string;
	        }): IForgeSocket;
	        exec(name: string, config: SocketConfig & {
	            command: string;
	        }): IForgeSocket;
	        plugin(name: string, config: SocketConfig & {
	            command: string;
	        }): IForgeSocket;
	        $watch(folders: string[], options: {
	            ignore: string[];
	            debounce?: number;
	            throttle?: number;
	        }): Promise<void>;
	        $reset(data: Serialize, race?: number): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        abort(): void;
	        $serve(port: number): Promise<ForgeServer>;
	    }
	}
	module "forge/action/ForgeTrigger" {
	export enum ResolverValues {
	        Any = "any",
	        All = "all"
	    }
	    type ActionSearch = {
	        task?: string | undefined;
	        action: string;
	    };
	    export type TriggerData = ({
	        signal: string[];
	    } | {
	        watch: (RegExp | string)[];
	    } | {
	        "resolves:any": ActionSearch[];
	    } | {
	        "resolves:all": ActionSearch[];
	    });
	    export interface IForgeTrigger {
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	    export function ParseTrigger(triggerData: TriggerData): IForgeTrigger;
	    export class SignalTrigger implements IForgeTrigger {
	        private _signals;
	        constructor(signals: string[]);
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	    export class WatchTrigger implements IForgeTrigger {
	        static ParseWatch(watch: string | RegExp): RegExp;
	        private _regExps;
	        constructor(regExps: RegExp[]);
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	    export class ResolveTrigger implements IForgeTrigger {
	        private _resolver;
	        private _resolves;
	        constructor(resolver: ResolverValues, resolves: ({
	            task?: string | undefined;
	            action: string;
	        })[]);
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	    export class RejectTrigger implements IForgeTrigger {
	        private _resolver;
	        private _resolves;
	        constructor(resolver: ResolverValues, resolves: {
	            task?: string | undefined;
	            action: string;
	        }[]);
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	    export class SettledTrigger implements IForgeTrigger {
	        private _resolver;
	        private _allSettled;
	        constructor(resolver: ResolverValues, resolves: {
	            task?: string | undefined;
	            action: string;
	        }[]);
	        $trigger(forgeController: ForgeController): Promise<boolean>;
	    }
	}
	module "forge/action/SocketAction" {
	
	
	export class SocketAction extends AbstractForgeAction {
	        static Parse(iSocket: IForgeSocket, actionData: ActionData, data: Record<string, unknown>): IAction;
	        protected _iSocket: IForgeSocket;
	        constructor(iSocket: IForgeSocket, config: ActionConfig, data: Record<string, unknown>);
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        $reset(data: Serialize): Promise<Serialize>;
	        write(header: Record<string, unknown>, data: Serialize): void;
	    }
	}
	module "forge/ForgeTask" {
	
	
	export type TaskConfig = {
	        name: string;
	        enabled: boolean;
	        actions: ActionConfig[];
	    };
	    export class ForgeTask {
	        private _forge;
	        private readonly _iActions;
	        private _enabled;
	        private _data;
	        name: string;
	        constructor(forge: Forge, config?: Record<string, unknown>);
	        data(): any;
	        actions(): Map<string, IAction>;
	        $reset(data: Serialize): Promise<Serialize>;
	        add(iAction: IAction): this;
	        parse(configObj: any): void;
	    }
	}
	module "forge/ForgeController" {
	
	
	export class ForgeController {
	        private readonly _tasks;
	        private readonly _iActions;
	        private readonly _bindings;
	        private _signal;
	        private _data;
	        readonly settled: Set<IAction>;
	        readonly resolves: Set<IAction>;
	        readonly rejections: Set<IAction>;
	        constructor();
	        private _thenRaced$Execute;
	        private _$catchRaced$Execute;
	        get actions(): Iterable<[string, IAction]>;
	        get signal(): string;
	        get data(): Serialize;
	        add(forgeTask: ForgeTask): this;
	        find(taskName: string, actionName: string): IAction;
	        $reset(): Promise<Serialize>;
	        $signal(signal: string, data?: Serialize, race?: number): Promise<Serialize>;
	    }
	}
	module "forge/action/ForgeAction" {
	
	
	
	
	
	/**
	     * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
	     *
	     * @typedef {Object} ActionData
	     *
	     * @property {TriggerData[]}  triggers - An array of data to instantiate a set of `IForgeTriggers`.
	     * @property {string}  socket - Binds this action to a service provided by the `Forge` instance.
	     * @property {(string|undefined)}  name - (optional) the default error message.
	     * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
	     * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
	     * @property {(boolean|undefined)}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`.
	     *
	     */
	    export type ActionData = {
	        triggers: TriggerData[];
	        socket: string;
	        name?: string;
	        enabled?: boolean;
	    };
	    /**
	     * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
	     *
	     * @typedef {Object} ActionConfig
	     *
	     * @property {(string|undefined)}  name - (optional) the default error message.
	     * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
	     * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
	     * @property {({service: string}|{local: string}|{remote: string})}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`.
	     *
	     */
	    export type ActionConfig = {
	        name?: string;
	        enabled: boolean;
	    };
	    export interface IAction {
	        name: string;
	        task: ForgeTask;
	        route: IForgeRoute;
	        $reset(data: Serialize): Promise<Serialize>;
	        $trigger(controller: ForgeController): Promise<boolean>;
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>;
	        write(...rest: Serialize[]): void;
	        add(overload: IForgeTrigger): this;
	    }
	    /**
	     * ForgeAction is the base class to eval signal dispatching from triggers, dispatch `$signals`, route requests, or stream output during `ForgeStream.$signal( ... )`
	     *
	     */
	    export class AbstractForgeAction extends Subscription implements IAction {
	        protected _data: any;
	        protected _startTime: number;
	        protected _cancelable: boolean;
	        protected readonly _bindings: Map<Function, Function>;
	        protected _iForgeTriggers: Set<IForgeTrigger>;
	        stdout: [string, number][];
	        stderr: [string, number][];
	        name: string;
	        enabled: boolean;
	        task: ForgeTask;
	        route: IForgeRoute;
	        constructor(actionConfig: ActionConfig, data: Record<string, unknown>);
	        protected _subscribeBroadcast(notify: string, header: any, data: any): void;
	        protected _subscribeMessage(notify: string, header: Record<string, unknown>, ...data: Serialize[]): void;
	        add(overload: IForgeTrigger): this;
	        $trigger(controller: ForgeController): Promise<boolean>;
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        $reset(data: Serialize): Promise<Serialize>;
	        $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>;
	        write(header: Record<string, unknown>, data: Serialize): void;
	    }
	}
	module "forge/action/CallbackAction" {
	
	export class CallbackAction extends AbstractForgeAction {
	        static Parse(callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>, actionData: ActionData, data: Record<string, unknown>): IAction;
	        protected _callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>;
	        constructor(callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>, config: ActionConfig, data: Record<string, unknown>);
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        write(header: Record<string, unknown>, data: Serialize): void;
	    }
	}
	module "forge/auth/ForgeAccess" {
	
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
	}
	module "forge/auth/ForgeAuthorization" {
	    export class ForgeAuthorization<S, T> {
	        protected _sources: Map<string, any>;
	        private _generateHash;
	        private _next;
	        register(source: S): void;
	        authorize(source: string, target: string): boolean;
	        frame(): void;
	    }
	}
	module "forge/auth/ForgeAuthSession" { }
	module "forge/auth/ForgePermission" { }
	module "forge/auth/ForgeUser" {
	    export class ForgeUser {
	        private _groups;
	        private: any;
	    }
	}
	module "forge/build/Build" {
	    export type Platform = "browser" | "node" | "neutral";
	    export type Format = "forge-js" | "forge-ts" | "iife" | "cjs" | "esm" | "tsc";
	    export type EsbuildResult = {
	        outputFiles: {
	            text: string;
	        }[];
	        metafile: {
	            inputs: unknown;
	        };
	        errors: unknown[];
	    };
	    export type BuildOptions = {
	        bundled: boolean;
	        platform: Platform;
	        format: Format;
	        metafile: boolean;
	        treeShaking?: boolean;
	        external: string[];
	        target?: string;
	        verbose?: Verbosity;
	        root?: string;
	    };
	    export type ImportEntrty = {
	        path: string;
	        kind: "require-call" | "import-statement";
	        original?: string;
	        external?: boolean;
	    };
	    export type BuildEntry = {
	        bytes: number;
	        imports: ImportEntrty[];
	        format: "cjs" | "esm";
	    };
	    export type SectionEntry = {
	        file: string;
	        code: string;
	        bytes: number;
	        imports: ImportEntrty[];
	        format: Format;
	    };
	    export enum Verbosity {
	        All = 0,
	        Log = 1,
	        Warn = 2,
	        Error = 3
	    }
	    export class BuildConfig {
	        bundled: boolean;
	        platform: Platform;
	        format: Format;
	        metafile: boolean;
	        treeShaking: boolean;
	        external: string[];
	        verbose: Verbosity;
	        constructor(options: Partial<BuildOptions>);
	    }
	}
	module "forge/build/plugin/ForgeBuildPlugin" {
	
	
	export interface IForgeBuildPlugin {
	        atrributes: Attributes;
	        $start(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<void>;
	        $complete(iResult: IResult<Record<string, unknown>>): Promise<void>;
	        $fetch(file: string, results: {
	            contents: string;
	            loader: string;
	        } & Record<string, unknown>): Promise<{
	            contents: string;
	            loader: string;
	        } & Record<string, unknown>>;
	        $resolve(file: string, results: any): Promise<Record<string, unknown>>;
	    }
	    export class ForgeBuildPlugin implements IForgeBuildPlugin {
	        atrributes: Attributes;
	        $start(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<void>;
	        $complete(iResult: IResult<Record<string, unknown>>): Promise<void>;
	        $fetch(file: string, results: {
	            contents: string;
	            loader: string;
	        } & Record<string, unknown>): Promise<{
	            contents: string;
	            loader: string;
	        } & Record<string, unknown>>;
	        $resolve(file: string, results: any): Promise<Record<string, unknown>>;
	    }
	}
	module "forge/build/bundler/ESBuildBundler" {
	
	
	
	
	export class ESBuildBundler extends Subscription {
	        static $Tranform(code: string): Promise<string>;
	        static $Build(entry: string, options: BuildOptions): Promise<IResult<Record<string, unknown>>>;
	        static $Build(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<IResult<Record<string, unknown>>>;
	        private _entry;
	        private _options;
	        private _watcher;
	        private _$context;
	        private _iResult;
	        readonly iPlugins: IForgeBuildPlugin[];
	        readonly cache: Map<string, string>;
	        constructor(entry: string, options: BuildOptions);
	        constructor(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]);
	        protected _setupPlugins(build: PluginBuild): void;
	        get iResult(): IResult<Record<string, unknown>>;
	        $start(): Promise<void>;
	        $complete(): Promise<void>;
	        $fetch(file: string): Promise<{
	            contents: string;
	            loader: string;
	        }>;
	        $watch(root: string, filter: RegExp): Promise<void>;
	        unwatch(): void;
	        $build(): Promise<IResult<Record<string, unknown>>>;
	    }
	}
	module "forge/os/ForgeNPM" {
	    export enum PackageOptions {
	        NPM = "npm",
	        Yarn = "yarn",
	        PNPM = "pnpm"
	    }
	    export class ForgeNPM {
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
	}
	module "forge/build/TypescriptFile" {
	    class TypescriptFileTraversal {
	        private _root;
	        private _$packages;
	        private _$fetch;
	        readonly files: Map<string, TypescriptFile>;
	        constructor(root: string, options: {
	            $fetch: any;
	        });
	        $add(file: string): Promise<boolean>;
	    }
	    export class TypescriptFile {
	        private _path;
	        private _code;
	        private _bundled;
	        private _compiled;
	        private _$fetch;
	        private _root;
	        private readonly _topology;
	        private readonly _imports;
	        constructor(root: string, options?: {
	            root?: string;
	            $fetch: (file: string) => Promise<string>;
	        });
	        get path(): {
	            relative: string;
	            absolute: string;
	        };
	        set code(value: string);
	        set bundled(value: string);
	        reset(): void;
	        $traverse(traversal?: TypescriptFileTraversal): Promise<Map<string, TypescriptFile>>;
	        $compile(): Promise<string>;
	        $imports(): Promise<Map<string, Set<string>>>;
	        $exports(): Promise<Map<string, string>>;
	        $load(file: string): Promise<this>;
	    }
	}
	module "forge/build/bundler/ForgeBundler" {
	
	
	export class ForgeBuilder {
	        static $Build(entry: string, options: BuildOptions): Promise<IResult>;
	        static $Build(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<IResult>;
	    }
	}
	module "forge/os/ForgeOS" {
	export class ForgeOS {
	        static $Exec(command: string, options?: ExecOptions & {
	            stdio: string;
	        }): Promise<string>;
	    }
	}
	module "forge/build/bundler/TSCBundler" {
	export class TSCBundler {
	        private _entry;
	        private _target;
	        private _ignoreList;
	        $types(): Promise<IResult<Record<string, unknown>>>;
	    }
	}
	module "forge/build/dependency/DependencySorter" {
	    export type NodeData = Record<string, unknown> & {
	        id: string;
	        title: string;
	        children: NodeData[];
	    };
	    /**
	     * @constructor { NodeData[] } - dependencies
	     */
	    export class DependencySorter {
	        private _dependencies;
	        private _count;
	        constructor(dependencies?: NodeData[]);
	        [Symbol.iterator](): Iterator<NodeData>;
	        private _has;
	        private _indexOf;
	        private _spliceDependency;
	        /**
	         * intersect :
	         *
	         *
	         * @param { string[] } inputs - This is supplied from the esbuild/typescript during each build step
	         */
	        intersect(inputs: string[]): NodeData[];
	        remove(file: string): void;
	        load(dependencies: NodeData[]): this;
	    }
	}
	module "forge/build/dependency/DependencyManager" {
	
	type ImportEntrty = {
	        path: string;
	        kind: "require-call" | "import-statement";
	        original?: string;
	        external?: boolean;
	    };
	    export type SectionEntry = {
	        file: string;
	        code: string;
	        bytes: number;
	        imports: ImportEntrty[];
	        format: "cjs" | "esm";
	    };
	    export class DependencyManager {
	        private _fileManifest;
	        private _dependencyHelper;
	        private _inputs;
	        entry: string;
	        header: string;
	        footer: string;
	        private readonly _sectionMap;
	        constructor(entry: string, inputs: Record<string, unknown>, buildOptions: BuildOptions);
	        private _sanitizeFileUrl;
	        set code(val: string);
	        $sections(): Promise<SectionEntry[]>;
	        has(file: string): boolean;
	        load(dependencies: NodeData[]): this;
	    }
	}
	module "forge/build/extension/ForgeBuildExtension" {
	export type ExtensionSource = {
	        $start?: (entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>) => Promise<void>;
	        $header?: (content: string) => Promise<string>;
	        $section?: (content: string, sectionEntry: SectionEntry) => Promise<string>;
	        $footer?: (content: string) => Promise<string>;
	        $complete: (content: string) => Promise<string>;
	    };
	    export interface IForgeBuildExtension {
	        $fetch(entry: string, content: string): Promise<string>;
	        $start(entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>): Promise<void>;
	        $header(content: string): Promise<string>;
	        $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	        $footer(content: string): Promise<string>;
	        $complete(content: string): Promise<string>;
	    }
	    export class AcbstractExtension implements IForgeBuildExtension {
	        $fetch(entry: string, content: string): Promise<string>;
	        $start(entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>): Promise<void>;
	        $header(content: string): Promise<string>;
	        $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	        $footer(content: string): Promise<string>;
	        $complete(content: string): Promise<string>;
	    }
	    export class ForgeBuildExtension extends AcbstractExtension {
	        private _source;
	        constructor(source: string);
	        constructor(source: ExtensionSource);
	        $start(entry: string, inputs: Record<string, unknown>, buildOptions: Record<string, unknown>): Promise<void>;
	        $header(content: string): Promise<string>;
	        $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	        $footer(content: string): Promise<string>;
	        $complete(content: string): Promise<string>;
	        toString(): string;
	    }
	}
	module "forge/build/extension/BrowserExtension" {
	
	export class BrowserExtension extends AcbstractExtension {
	        $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	    }
	}
	module "forge/build/extension/ExportExtension" {
	
	
	export class ExportExtension implements IForgeBuildExtension {
	        private _mode;
	        private _base;
	        private _namespace;
	        private _buildOptions;
	        private _transformExports;
	        private _exports;
	        constructor(mode: "flat" | "object");
	        $fetch(entry: string, content: string): Promise<string>;
	        $start(entry: string, inputs: Record<string, unknown>, buildOptions: BuildOptions): Promise<void>;
	        $header(content: string): Promise<string>;
	        $section(content: string, sectionData: SectionEntry): Promise<string>;
	        $footer(content: string): Promise<string>;
	        $complete(output: string): Promise<string>;
	    }
	}
	module "forge/build/extension/NodeExtension" {
	export class NodeExtension extends AcbstractExtension {
	        $complete(content: string): Promise<string>;
	    }
	}
	module "forge/build/TypescriptBuilder" {
	
	export class TypescriptBuilder {
	        static $Library(root: string, options?: {
	            ignore: string[];
	        }): Promise<string>;
	        static $RegenerateBuilder(source: string, target: string): Promise<boolean>;
	        static StripImports(code: string): string;
	        private _entry;
	        private _root;
	        private _options;
	        private _plugins;
	        private readonly _segments;
	        private _order;
	        constructor(entry: string, options: BuildOptions, plugins?: IForgeBuildPlugin[]);
	        $fetch(file: string): Promise<string>;
	        $bundle(): Promise<string>;
	        $library(): Promise<string>;
	    }
	}
	module "forge/model/proxy/socket/ClientSocketModelProxy" {
	
	
	
	
	export class ClientSocketModelProxy extends AbstractForgeModelProxy {
	        private _iSocket;
	        private _rootHash;
	        private _state;
	        private _iStoreRemap;
	        private _$ready;
	        private readonly _queue;
	        constructor(iModel: IForgeModel, iSocket: IForgeSocket);
	        private _$thenISocketReady;
	        protected _$queue(header: Record<string, unknown>, data: Serialize): Promise<Serialize>;
	        get $ready(): Promise<IForgeModel>;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	        $activate(): Promise<void>;
	        $connect(iStore: IForgeStore, hash: string): Promise<void>;
	        $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	        $fork(parent: IForgeStore, child: IForgeStore): Promise<void>;
	        $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	        $frame(): Promise<void>;
	        $flush(): Promise<void>;
	    }
	}
	module "forge/ForgeClient" {
	
	
	
	
	export class ForgeClient extends Subscription {
	        static Arguments(options: Record<string, unknown> & {
	            race: Record<string, number>;
	        }): [string, Record<string, unknown>, Record<string, unknown> & {
	            race: Record<string, number>;
	        }];
	        protected _executing: boolean;
	        protected _queue: [];
	        protected _iSocket: IForgeSocket;
	        protected _iModel: IForgeModel;
	        protected _filters: Set<string>;
	        protected _delegates: Set<{}>;
	        protected readonly _race: ForgeRace;
	        constructor(key: string, data: Record<string, unknown>, options: {
	            race: Record<string, number>;
	        });
	        private _$raceDispatch;
	        protected _$subscribeMessage(notify: string, header: Record<string, unknown>, data: Serialize): Promise<void>;
	        get $ready(): Promise<Serialize>;
	        $start(data: Serialize): Promise<Serialize>;
	        protected $reset(data: Serialize, race: number): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	        $execute(signal: string, data: Serialize, race: number): Promise<Serialize>;
	        $watch(data: Serialize, race: number): Promise<Serialize>;
	        $model(attributes: Attributes): Promise<IForgeModel>;
	    }
	}
	module "forge/model/proxy/FileModelProxy" {
	
	
	export class FileModelPipe extends AbstractForgeModelProxy {
	        static CaptureFileError(error: unknown): ArrayBuffer;
	        private _file;
	        private _permissions;
	        private _capture;
	        constructor(iModel: IForgeModel, file: string);
	        constructor(iModel: IForgeModel, file: string, options: {
	            read?: boolean;
	            write?: boolean;
	            capture?: Capture;
	        });
	        $start(...rest: unknown[]): Promise<void>;
	        $flush(): Promise<void>;
	    }
	}
	module "forge/model/proxy/socket/RootSocketModelProxy" {
	
	
	
	export class RootSocketModelProxy extends AbstractForgeModelProxy {
	        private readonly _roots;
	        readonly _iSockets: Set<IForgeSocket>;
	        constructor(iModel: IForgeModel);
	        private _$waitForStore;
	        private _validateModelState;
	        $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    }
	}
	module "forge/model/store/JSONStore" {
	
	
	export class JSONStore extends ForgeStore {
	        constructor(value: Record<string, unknown>, attributes: Attributes);
	        constructor(value: Record<string, unknown>, attributes: Attributes, iModel: IForgeModel);
	        $value(): Promise<Attributes>;
	    }
	}
	module "forge/model/store/NumberStore" {
	
	
	export class NumberStore extends ForgeStore {
	        constructor(value: number, attributes: Attributes);
	        constructor(value: number, attributes: Attributes, iModel: IForgeModel);
	        $value(): Promise<number>;
	    }
	}
	module "forge/model/store/StringStore" {
	
	
	export class StringStore extends ForgeStore {
	        constructor(value: string, attributes: Attributes);
	        constructor(value: string, attributes: Attributes, iModel: IForgeModel);
	        $value(): Promise<string>;
	    }
	}
	module "forge/os/io/ForgeGit" {
	    export class ForgeGit {
	        static $IsWorkingTree(): Promise<boolean>;
	        static $Clone(url: string): Promise<boolean>;
	        static $Submodule(url: string, target: string): Promise<boolean>;
	        static $Place(url: string, target: string): Promise<boolean>;
	    }
	}
	module "forge/server/route/FileRoute" {
	
	
	export class FileRoute extends ForgeRoute {
	        private _file;
	        private _mime;
	        private _status;
	        private _cache;
	        constructor(config: {
	            components?: IForgeRouteComponent[];
	            file: {
	                path: string;
	                mime?: string;
	                cached?: boolean;
	                preload?: boolean;
	            };
	            race?: number;
	            status: number;
	        });
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        invalidate(): this;
	    }
	    export class FileDirectoryRoute extends ForgeRoute {
	        static Authorize: {
	            Target: (regExp: RegExp, options?: {
	                group?: string;
	                index?: number;
	            }) => RouteDelegate;
	            Match: (...matches: string[]) => RouteDelegate;
	            RegExp: (regExp: RegExp, options?: {
	                groups?: string;
	                index?: number;
	            }) => RouteDelegate;
	            All: (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	        };
	        protected _target: string;
	        protected _root: string;
	        protected _index: string;
	        protected _status: number;
	        protected _$renderCallback: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	        constructor(config: {
	            root: string;
	            index?: string;
	            $render?: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	            components?: IForgeRouteComponent[];
	            race?: number;
	            status?: number;
	        });
	        get target(): string;
	        get root(): string;
	        get index(): string;
	        set relative(value: string);
	        set absolute(value: string);
	        $status(target: string): Promise<{
	            isSubdirectory: boolean;
	            exists: boolean;
	            contains: boolean;
	        }>;
	        $read(target: string): Promise<ArrayBuffer>;
	        protected _$render(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	        add(component: IForgeRouteComponent & {
	            $render?: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	        }): this;
	    }
	}
	module "forge/server/route/HTTPRoute" {
	
	
	export class HTTPRoute extends ForgeRoute {
	        private _root;
	        constructor(route: RegExp, root: string);
	        $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    }
	}
	module "forge/socket/PluginSocket" {
	
	export class PluginSocket extends AbstractForgeSocket {
	        private _source;
	        private _commands;
	        constructor(name: string, config: SocketConfig, source?: any);
	        write(header: Serialize, data: Serialize): void;
	        $reset(data: Serialize, race?: number): Promise<Serialize>;
	        $signal(signal: string, data: Serialize): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    }
	}
	module "forge/socket/RestSocket" {
	
	export class RestSocket extends AbstractForgeSocket {
	        private _source;
	        private _command;
	        private _config;
	        constructor(name: string, config: SocketConfig);
	        private _injectCommand;
	        write(header: Serialize, data: Serialize): void;
	        $signal(signal: string, data: Serialize): Promise<Serialize>;
	        $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    }
	}
	module "forge-bin" { }
	module "regen" { }
	module "index" {
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	export { Accessor, IForgeArguments, CLIArguments, EnvArguments, CompositeArguments, ICollection, ICollectionIterator, IAsyncCollection, MapCollection, Topology, ITreeNode, TreeNode, TreeCollection, Attributes, IntervalClear, TimeoutClear, Serialize, Capture, EmptyData, IsObject, CatchThrowError, CatchCapture, EmptyFunction, EncodeBase64, DecodeBase64, FlattenObject, QuickHash, $Promise, $UsePromise, $RacePromise, $UseRace, $Wait, EscapeHTML, Cipher, DebugCipher, MD5, EncodeNumber, DecodeNumber, EncodedStringSize, EncodeString, DecodeString, DecodeAttributes, EncodeAttributes, Base64, DataStreamWriter, DataStreamReader, DebugForeground, DebugBackground, ColourFormattingReset, DebugFormatter, EnforcementResult, EnforcementInquiry, $Enforce, Enforce, Mimes, IPoolable, PoolManager, AttributesQuery, QueryCallback, IQuery, QueryManager, WaitConfirmation, IWaitingQuery, WaitingQueryManager, IResult, Result, Notification, ISubscription, Unsubscribe, Subscription, IThottle, SequentialThottle, Debouncer, CallbackAction, ActionData, ActionConfig, IAction, AbstractForgeAction, ResolverValues, TriggerData, IForgeTrigger, ParseTrigger, SignalTrigger, WatchTrigger, ResolveTrigger, RejectTrigger, SettledTrigger, SocketAction, ForgeAccess, ForgeAuthorization, ForgeUser, Platform, Format, EsbuildResult, BuildOptions, ImportEntrty, BuildEntry, SectionEntry, Verbosity, BuildConfig, ESBuildBundler, ForgeBuilder, TSCBundler, DependencyManager, NodeData, DependencySorter, BrowserExtension, ExportExtension, ExtensionSource, IForgeBuildExtension, AcbstractExtension, ForgeBuildExtension, NodeExtension, IForgeBuildPlugin, ForgeBuildPlugin, TypescriptBuilder, TypescriptFile, ForgeRace, Forge, ForgeClient, ForgeController, TaskConfig, ForgeTask, $CompareModels, IForgeModel, ForgeModel, FileModelPipe, IForgeModelProxy, AbstractForgeModelProxy, ForgeModelProxyManager, ClientSocketModelProxy, RootSocketModelProxy, ForgeStoreMime, ForgeStoreExport, $CompareStores, IForgeStore, ForgeStore, JSONStore, NumberStore, StringStore, PackageOptions, ForgeNPM, ForgeOS, ForgeGit, ForgeFileWatcher, ForgeIO, ForgeParsedPath, ForgePath, IForgeRequestAdapter, ForgeRequest, ResponseOutput, IResponseAdapter, ForgeResponseChunk, ForgeResponse, $ParseRequestBody, RequestBodyParser, ForgeServer, FileRoute, FileDirectoryRoute, RouteDelegate, IForgeRoute, IForgeRouteComponent, ForgeRoute, CaptureRoute, HTTPRoute, ExecSocket, SocketConfig, IForgeSocket, AbstractForgeSocket, ForkSocket, PluginSocket, RestSocket, SpawnSocket };
	}
	
		
	
	export class CallbackAction extends AbstractForgeAction {
	    static Parse(callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>, actionData: ActionData, data: Record<string, unknown>): IAction;
	    protected _callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>;
	    constructor(callback: (signal: string, data: Serialize, race?: number) => Promise<Serialize>, config: ActionConfig, data: Record<string, unknown>);
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    write(header: Record<string, unknown>, data: Serialize): void;
	}
	
		
	
	
	
	
	
	/**
	 * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
	 *
	 * @typedef {Object} ActionData
	 *
	 * @property {TriggerData[]}  triggers - An array of data to instantiate a set of `IForgeTriggers`.
	 * @property {string}  socket - Binds this action to a service provided by the `Forge` instance.
	 * @property {(string|undefined)}  name - (optional) the default error message.
	 * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
	 * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
	 * @property {(boolean|undefined)}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`.
	 *
	 */
	export type ActionData = {
	    triggers: TriggerData[];
	    socket: string;
	    name?: string;
	    enabled?: boolean;
	};
	/**
	 * The raw data from a JSON for action data. Pulled from a `.Forge` or supplied from a developer
	 *
	 * @typedef {Object} ActionConfig
	 *
	 * @property {(string|undefined)}  name - (optional) the default error message.
	 * @property {(boolean|undefined)}  enabled - (optional) A callback to transform the supplied value for an aurgument.
	 * @property {(number|undefined)}  race - (optional) The alloted time to finish an action.
	 * @property {({service: string}|{local: string}|{remote: string})}  route - (optional) Used by `ForgeServer` to determine if an `IAction` should attempt to route a `signal`.
	 *
	 */
	export type ActionConfig = {
	    name?: string;
	    enabled: boolean;
	};
	export interface IAction {
	    name: string;
	    task: ForgeTask;
	    route: IForgeRoute;
	    $reset(data: Serialize): Promise<Serialize>;
	    $trigger(controller: ForgeController): Promise<boolean>;
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>;
	    write(...rest: Serialize[]): void;
	    add(overload: IForgeTrigger): this;
	}
	/**
	 * ForgeAction is the base class to eval signal dispatching from triggers, dispatch `$signals`, route requests, or stream output during `ForgeStream.$signal( ... )`
	 *
	 */
	export class AbstractForgeAction extends Subscription implements IAction {
	    protected _data: any;
	    protected _startTime: number;
	    protected _cancelable: boolean;
	    protected readonly _bindings: Map<Function, Function>;
	    protected _iForgeTriggers: Set<IForgeTrigger>;
	    stdout: [string, number][];
	    stderr: [string, number][];
	    name: string;
	    enabled: boolean;
	    task: ForgeTask;
	    route: IForgeRoute;
	    constructor(actionConfig: ActionConfig, data: Record<string, unknown>);
	    protected _subscribeBroadcast(notify: string, header: any, data: any): void;
	    protected _subscribeMessage(notify: string, header: Record<string, unknown>, ...data: Serialize[]): void;
	    add(overload: IForgeTrigger): this;
	    $trigger(controller: ForgeController): Promise<boolean>;
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    $reset(data: Serialize): Promise<Serialize>;
	    $stream(stdoutCallback: (message: string | string[]) => void, stderrCallback?: (error: string | string[]) => void): Promise<void>;
	    write(header: Record<string, unknown>, data: Serialize): void;
	}
	
		
	export enum ResolverValues {
	    Any = "any",
	    All = "all"
	}
	type ActionSearch = {
	    task?: string | undefined;
	    action: string;
	};
	export type TriggerData = ({
	    signal: string[];
	} | {
	    watch: (RegExp | string)[];
	} | {
	    "resolves:any": ActionSearch[];
	} | {
	    "resolves:all": ActionSearch[];
	});
	export interface IForgeTrigger {
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	export function ParseTrigger(triggerData: TriggerData): IForgeTrigger;
	export class SignalTrigger implements IForgeTrigger {
	    private _signals;
	    constructor(signals: string[]);
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	export class WatchTrigger implements IForgeTrigger {
	    static ParseWatch(watch: string | RegExp): RegExp;
	    private _regExps;
	    constructor(regExps: RegExp[]);
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	export class ResolveTrigger implements IForgeTrigger {
	    private _resolver;
	    private _resolves;
	    constructor(resolver: ResolverValues, resolves: ({
	        task?: string | undefined;
	        action: string;
	    })[]);
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	export class RejectTrigger implements IForgeTrigger {
	    private _resolver;
	    private _resolves;
	    constructor(resolver: ResolverValues, resolves: {
	        task?: string | undefined;
	        action: string;
	    }[]);
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	export class SettledTrigger implements IForgeTrigger {
	    private _resolver;
	    private _allSettled;
	    constructor(resolver: ResolverValues, resolves: {
	        task?: string | undefined;
	        action: string;
	    }[]);
	    $trigger(forgeController: ForgeController): Promise<boolean>;
	}
	
	
		
	
	
	export class SocketAction extends AbstractForgeAction {
	    static Parse(iSocket: IForgeSocket, actionData: ActionData, data: Record<string, unknown>): IAction;
	    protected _iSocket: IForgeSocket;
	    constructor(iSocket: IForgeSocket, config: ActionConfig, data: Record<string, unknown>);
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    $reset(data: Serialize): Promise<Serialize>;
	    write(header: Record<string, unknown>, data: Serialize): void;
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
	
		
	
		
	
		export class ForgeUser {
	    private _groups;
	    private: any;
	}
	
		export type Platform = "browser" | "node" | "neutral";
	export type Format = "forge-js" | "forge-ts" | "iife" | "cjs" | "esm" | "tsc";
	export type EsbuildResult = {
	    outputFiles: {
	        text: string;
	    }[];
	    metafile: {
	        inputs: unknown;
	    };
	    errors: unknown[];
	};
	export type BuildOptions = {
	    bundled: boolean;
	    platform: Platform;
	    format: Format;
	    metafile: boolean;
	    treeShaking?: boolean;
	    external: string[];
	    target?: string;
	    verbose?: Verbosity;
	    root?: string;
	};
	export type ImportEntrty = {
	    path: string;
	    kind: "require-call" | "import-statement";
	    original?: string;
	    external?: boolean;
	};
	export type BuildEntry = {
	    bytes: number;
	    imports: ImportEntrty[];
	    format: "cjs" | "esm";
	};
	export type SectionEntry = {
	    file: string;
	    code: string;
	    bytes: number;
	    imports: ImportEntrty[];
	    format: Format;
	};
	export enum Verbosity {
	    All = 0,
	    Log = 1,
	    Warn = 2,
	    Error = 3
	}
	export class BuildConfig {
	    bundled: boolean;
	    platform: Platform;
	    format: Format;
	    metafile: boolean;
	    treeShaking: boolean;
	    external: string[];
	    verbose: Verbosity;
	    constructor(options: Partial<BuildOptions>);
	}
	
		
	
	
	
	
	interface IPlugin {
	    name: string;
	    setup: (build: any) => (void | Promise<void>);
	}
	export class ESBuildCompiler extends Subscription {
	    static $Build(entry: string, options: BuildOptions): Promise<IResult>;
	    static $Build(entry: string, options: BuildOptions, plugins: IPlugin[]): Promise<IResult>;
	    private _entry;
	    private _options;
	    private _watcher;
	    private _$context;
	    readonly plugins: [ESbuild.Plugin, Attributes][];
	    constructor(entry: string, options: BuildOptions, plugins: any[]);
	    $watch(root: string, filter: RegExp): Promise<void>;
	    unwatch(): void;
	    $build(): Promise<IResult>;
	}
	
	
		
	
	
	
	
	export class ESBuildBundler extends Subscription {
	    static $Tranform(code: string): Promise<string>;
	    static $Build(entry: string, options: BuildOptions): Promise<IResult<Record<string, unknown>>>;
	    static $Build(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<IResult<Record<string, unknown>>>;
	    private _entry;
	    private _options;
	    private _watcher;
	    private _$context;
	    private _iResult;
	    readonly iPlugins: IForgeBuildPlugin[];
	    readonly cache: Map<string, string>;
	    constructor(entry: string, options: BuildOptions);
	    constructor(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]);
	    protected _setupPlugins(build: PluginBuild): void;
	    get iResult(): IResult;
	    $start(): Promise<void>;
	    $complete(): Promise<void>;
	    $fetch(file: string): Promise<{
	        contents: string;
	        loader: string;
	    }>;
	    $watch(root: string, filter: RegExp): Promise<void>;
	    unwatch(): void;
	    $build(): Promise<IResult>;
	    $library(format: "object" | "flat"): Promise<IResult>;
	}
	
		
	
	
	
	export class ForgeBuilder extends Subscription {
	    static $Build(entry: string, options: BuildOptions): Promise<IResult>;
	    static $Build(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]): Promise<IResult>;
	    private _entry;
	    private _options;
	    private _$packages;
	    readonly cache: Map<string, {
	        contents: string | Uint8Array;
	        loader: string;
	    }>;
	    readonly iPlugins: IForgeBuildPlugin[];
	    constructor(entry: string, options: BuildOptions);
	    constructor(entry: string, options: BuildOptions, iPlugins: IForgeBuildPlugin[]);
	    protected _$resolve(file: string): Promise<string>;
	    protected _$fetch(file: string): Promise<{
	        contents: string | Uint8Array;
	        loader: string;
	    }>;
	    protected _$fetchTypescript(file: string): Promise<string>;
	    $bundle(): Promise<IResult>;
	    $library(): Promise<IResult>;
	}
	
		
	export class TSCBundler {
	    private _entry;
	    private _ignoreList;
	    private _target;
	    constructor(options: {
	        ignore?: string[];
	        target: string | {
	            random: string;
	        };
	    });
	    private get _$target();
	    $types(): Promise<IResult>;
	}
	
		
	
	type ImportEntrty = {
	    path: string;
	    kind: "require-call" | "import-statement";
	    original?: string;
	    external?: boolean;
	};
	export type SectionEntry = {
	    file: string;
	    code: string;
	    bytes: number;
	    imports: ImportEntrty[];
	    format: "cjs" | "esm";
	};
	export class DependencyManager {
	    private _fileManifest;
	    private _dependencyHelper;
	    private _inputs;
	    private _options;
	    entry: string;
	    header: string;
	    footer: string;
	    private readonly _sectionMap;
	    constructor(entry: string, inputs: Record<string, unknown>, buildOptions: BuildOptions);
	    private _sanitizeFileUrl;
	    set code(val: string);
	    $sections(): Promise<SectionEntry[]>;
	    has(file: string): boolean;
	    load(dependencies: NodeData[]): this;
	}
	
	
		export type NodeData = Record<string, unknown> & {
	    id: string;
	    title: string;
	    children: NodeData[];
	};
	/**
	 * @constructor { NodeData[] } - dependencies
	 */
	export class DependencySorter {
	    private _dependencies;
	    private _count;
	    constructor(dependencies?: NodeData[]);
	    [Symbol.iterator](): Iterator<NodeData>;
	    private _has;
	    private _indexOf;
	    private _spliceDependency;
	    /**
	     * intersect :
	     *
	     *
	     * @param { string[] } inputs - This is supplied from the esbuild/typescript during each build step
	     */
	    intersect(inputs: string[]): NodeData[];
	    remove(file: string): void;
	    load(dependencies: NodeData[]): this;
	}
	
		
	
	export class BrowserExtension extends AcbstractExtension {
	    $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	}
	
		
	
	
	export class ExportExtension implements IForgeBuildExtension {
	    private _mode;
	    private _base;
	    private _namespace;
	    private _buildOptions;
	    private _transformExports;
	    private _exports;
	    constructor(mode: "flat" | "object");
	    $fetch(entry: string, content: string): Promise<string>;
	    $start(entry: string, inputs: Record<string, unknown>, buildOptions: BuildOptions): Promise<void>;
	    $header(content: string): Promise<string>;
	    $section(content: string, sectionData: SectionEntry): Promise<string>;
	    $footer(content: string): Promise<string>;
	    $complete(output: string): Promise<string>;
	}
	
		
	export type ExtensionSource = {
	    $start?: (entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>) => Promise<void>;
	    $header?: (content: string) => Promise<string>;
	    $section?: (content: string, sectionEntry: SectionEntry) => Promise<string>;
	    $footer?: (content: string) => Promise<string>;
	    $complete: (content: string) => Promise<string>;
	};
	export interface IForgeBuildExtension {
	    $fetch(entry: string, content: string): Promise<string>;
	    $start(entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>): Promise<void>;
	    $header(content: string): Promise<string>;
	    $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	    $footer(content: string): Promise<string>;
	    $complete(content: string): Promise<string>;
	}
	export class AcbstractExtension implements IForgeBuildExtension {
	    $fetch(entry: string, content: string): Promise<string>;
	    $start(entry: string, manifest: Record<string, unknown>, BuildOptions: Record<string, unknown>): Promise<void>;
	    $header(content: string): Promise<string>;
	    $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	    $footer(content: string): Promise<string>;
	    $complete(content: string): Promise<string>;
	}
	export class ForgeBuildExtension extends AcbstractExtension {
	    private _source;
	    constructor(source: string);
	    constructor(source: ExtensionSource);
	    $start(entry: string, inputs: Record<string, unknown>, buildOptions: Record<string, unknown>): Promise<void>;
	    $header(content: string): Promise<string>;
	    $section(content: string, sectionEntry: SectionEntry): Promise<string>;
	    $footer(content: string): Promise<string>;
	    $complete(content: string): Promise<string>;
	    toString(): string;
	}
	
		
	export class NodeExtension extends AcbstractExtension {
	    $complete(content: string): Promise<string>;
	}
	
		
	
	export interface IForgeBuildPlugin {
	    atrributes: Attributes;
	    $start(iResult: IResult): Promise<void>;
	    $complete(iResult: IResult): Promise<void>;
	    $fetch(file: string, results: IResult): Promise<void>;
	    $resolve(file: string, results: any): Promise<void>;
	}
	export class ForgeBuildPlugin implements IForgeBuildPlugin {
	    atrributes: Attributes;
	    $start(iResult: IResult): Promise<void>;
	    $complete(iResult: IResult): Promise<void>;
	    $fetch(file: string, iResults: IResult): Promise<void>;
	    $resolve(file: string, results: any): Promise<void>;
	}
	
		
	
	
	export class TypescriptBuilder {
	    static $Library(root: string, options?: {
	        ignore: string[];
	    }): Promise<string>;
	    static $RegenerateBuilder(source: string, target: string): Promise<boolean>;
	    static StripImports(code: string): string;
	    private _entry;
	    private _root;
	    private readonly _$package;
	    private _$packages;
	    private _options;
	    private _iPlugins;
	    constructor(entry: string, options: BuildOptions, iPlugins?: IForgeBuildPlugin[]);
	    $fetch(file: string): Promise<string>;
	    $bundle(): Promise<IResult>;
	    $library(): Promise<IResult>;
	}
	
		
	
	
	class TypescriptFileTraversal {
	    private _root;
	    private _$packages;
	    private _$fetch;
	    readonly files: Map<string, TypescriptFile>;
	    constructor(root: string, options: {
	        $fetch: (file: string) => Promise<string>;
	        $package: Promise<Set<string>>;
	    });
	    $add(file: string): Promise<boolean>;
	}
	export class TypescriptFile {
	    static $Fetch(file: string): Promise<string>;
	    private _path;
	    private _code;
	    private _root;
	    private _$fetch;
	    private readonly _$packages;
	    readonly imports: Map<string, Set<string>>;
	    readonly exports: Set<string>;
	    hash: string;
	    constructor(root: string, options?: {
	        root?: string;
	        $fetch?: (file: string) => Promise<string>;
	        $package?: Promise<Set<string>>;
	    });
	    get path(): {
	        relative: string;
	        absolute: string;
	        dir: string;
	    };
	    set code(value: string);
	    reset(): void;
	    $traverse(traversal?: TypescriptFileTraversal): Promise<Map<string, TypescriptFile>>;
	    $load(file: string): Promise<this>;
	    $inline(callback?: (type: string, script: this, file: string, values: string | Set<string>) => string): Promise<string>;
	    $bundle(options: BuildOptions, iPlugins?: IForgeBuildPlugin): Promise<IResult>;
	    $library(): Promise<IResult>;
	}
	
	
		export class ForgeRace {
	    private _default;
	    private _race;
	    constructor(race: Record<string, number>);
	    constructor(race: Map<RegExp, number>);
	    query(): number;
	    query(value: string): number;
	}
	
		
	
	
	
	
	export class Forge {
	    private _forgeServer;
	    private _iModel;
	    private readonly _taskMap;
	    private readonly _ignoreArr;
	    private readonly _controller;
	    readonly sockets: Map<string, IForgeSocket>;
	    private readonly _iStores;
	    constructor();
	    private _addSocket;
	    private _buildSocket;
	    parse(input: string, options?: {}): Record<string, unknown>;
	    get model(): IForgeModel;
	    tasks(): Map<string, ForgeTask>;
	    add(forgeTask: ForgeTask): this;
	    spawn(name: string, config: SocketConfig & {
	        command: string;
	    }): IForgeSocket;
	    fork(name: string, config: SocketConfig & {
	        command: string;
	    }): IForgeSocket;
	    worker(name: string, config: SocketConfig & {
	        command: string;
	    }): IForgeSocket;
	    exec(name: string, config: SocketConfig & {
	        command: string;
	    }): IForgeSocket;
	    plugin(name: string, config: SocketConfig & {
	        command: string;
	    }): IForgeSocket;
	    $watch(folders: string[], options: {
	        ignore: string[];
	        debounce?: number;
	        throttle?: number;
	    }): Promise<void>;
	    $reset(data: Serialize, race?: number): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    abort(): void;
	    $serve(port: number): Promise<ForgeServer>;
	}
	
		
	
	
	
	
	export class ForgeClient extends Subscription {
	    static Arguments(options: Record<string, unknown> & {
	        race: Record<string, number>;
	    }): [string, Record<string, unknown>, Record<string, unknown> & {
	        race: Record<string, number>;
	    }];
	    protected _executing: boolean;
	    protected _queue: [];
	    protected _iSocket: IForgeSocket;
	    protected _iModel: IForgeModel;
	    protected _filters: Set<string>;
	    protected _delegates: Set<{}>;
	    protected readonly _race: ForgeRace;
	    constructor(key: string, data: Record<string, unknown>, options: {
	        race: Record<string, number>;
	    });
	    private _$raceDispatch;
	    protected _$subscribeMessage(notify: string, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    get $ready(): Promise<Serialize>;
	    $start(data: Serialize): Promise<Serialize>;
	    protected $reset(data: Serialize, race: number): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    $execute(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    $watch(data: Serialize, race: number): Promise<Serialize>;
	    $model(attributes: Attributes): Promise<IForgeModel>;
	}
	
		
	
	
	export class ForgeController {
	    private readonly _tasks;
	    private readonly _iActions;
	    private readonly _bindings;
	    private _signal;
	    private _data;
	    readonly settled: Set<IAction>;
	    readonly resolves: Set<IAction>;
	    readonly rejections: Set<IAction>;
	    constructor();
	    private _thenRaced$Execute;
	    private _$catchRaced$Execute;
	    get actions(): Iterable<[string, IAction]>;
	    get signal(): string;
	    get data(): Serialize;
	    add(forgeTask: ForgeTask): this;
	    find(taskName: string, actionName: string): IAction;
	    $reset(): Promise<Serialize>;
	    $signal(signal: string, data?: Serialize, race?: number): Promise<Serialize>;
	}
	
		
	
	
	export type TaskConfig = {
	    name: string;
	    enabled: boolean;
	    actions: ActionConfig[];
	};
	export class ForgeTask {
	    private _forge;
	    private readonly _iActions;
	    private _enabled;
	    private _data;
	    name: string;
	    constructor(forge: Forge, config?: Record<string, unknown>);
	    data(): any;
	    actions(): Map<string, IAction>;
	    $reset(data: Serialize): Promise<Serialize>;
	    add(iAction: IAction): this;
	    parse(configObj: any): void;
	}
	
		
	
	
	
	
	
	export function $CompareModels(iModelA: IForgeModel, iModelB: IForgeModel): Promise<boolean>;
	export interface IForgeModel {
	    [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    get proxies(): ForgeModelProxyManager;
	    get state(): string;
	    get root(): IForgeStore;
	    get(hash: string): IForgeStore;
	    $hash(iStore: IForgeStore): Promise<string>;
	    $attributes(iStore: IForgeStore): Promise<Attributes>;
	    $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $parent(iStore: IForgeStore): Promise<IForgeStore>;
	    $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $fork(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
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
	export class ForgeModel implements IForgeModel {
	    protected _hash: string;
	    protected _root: IForgeStore;
	    protected _state: string;
	    protected _proxies: ForgeModelProxyManager;
	    protected readonly _topology: Topology<IForgeStore>;
	    protected readonly _hashMap: Map<IForgeStore, string>;
	    protected readonly _dataMap: Map<IForgeStore, [ArrayBuffer, string]>;
	    protected readonly _waitMap: Map<string, $Promise<IForgeStore>>;
	    protected readonly _lockMap: Map<IForgeStore, string>;
	    race: number;
	    constructor();
	    constructor(attributes: Attributes);
	    constructor(root: IForgeStore);
	    [Symbol.iterator](): IterableIterator<[IForgeStore, Attributes]>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    protected _$nextHash(): Promise<string>;
	    protected _raceStore(hash: string): $Promise<IForgeStore>;
	    protected _$remove(iStore: IForgeStore): Promise<void>;
	    get state(): string;
	    get root(): IForgeStore;
	    get proxies(): ForgeModelProxyManager;
	    $hash(iStore: IForgeStore): Promise<string>;
	    $attributes(iStore: IForgeStore): Promise<Attributes>;
	    $children(iStore: IForgeStore): Promise<IForgeStore[]>;
	    $parent(iStore: IForgeStore): Promise<IForgeStore>;
	    $ancestry(iStore: IForgeStore): Promise<IForgeStore[]>;
	    get(query: string): IForgeStore;
	    $fork(parent: IForgeStore, child: IForgeStore): Promise<IForgeStore>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $traverse(iStore: IForgeStore): Promise<IForgeStore[]>;
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
	    $hasLock(iStore: IForgeStore): Promise<boolean>;
	    $lock(iStore: IForgeStore): Promise<string>;
	    $unlock(hash: string): Promise<IForgeStore>;
	    $import(iStore: IForgeStore, importData: {
	        parent: string | IForgeStore;
	        data: ArrayBuffer;
	        mime: string;
	    }): Promise<IForgeStore>;
	    $frame(): Promise<this>;
	    $flush(): Promise<this>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(parent: IForgeStore): Promise<IQuery<IForgeStore>>;
	    $query(parent: IForgeStore, recursive: boolean): Promise<IQuery<IForgeStore>>;
	    $validate(iStore: IForgeStore): Promise<true | Error[]>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<IForgeStore>;
	    $wait(hash: string): Promise<IForgeStore>;
	    $read(iStore: IForgeStore): Promise<[ArrayBuffer, string]>;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    toString(): string;
	}
	
		
	
	
	export class FileModelPipe extends AbstractForgeModelProxy {
	    static CaptureFileError(error: unknown): ArrayBuffer;
	    private _file;
	    private _permissions;
	    private _capture;
	    constructor(iModel: IForgeModel, file: string);
	    constructor(iModel: IForgeModel, file: string, options: {
	        read?: boolean;
	        write?: boolean;
	        capture?: Capture;
	    });
	    $start(...rest: unknown[]): Promise<void>;
	    $flush(): Promise<void>;
	}
	
		
	
	
	
	
	export interface IForgeModelProxy {
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    $activate(): Promise<void>;
	    $deactivate(): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $connect(iStore: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $fork(oarent: IForgeStore, child: IForgeStore): Promise<void>;
	    $read(iStore: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	    $purge(iStore: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	export class AbstractForgeModelProxy extends Subscription implements IForgeModelProxy {
	    protected _iModel: IForgeModel;
	    protected _bindings: Map<Function, Function>;
	    constructor(iModel: IForgeModel);
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    $activate(): Promise<void>;
	    $deactivate(): Promise<void>;
	    $fork(parent: IForgeStore, children: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $read(iStore: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	    $purge(iStore: IForgeStore): Promise<void>;
	    $connect(iStore: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	export class ForgeModelProxyManager {
	    private readonly _iProxies;
	    [Symbol.iterator](): IterableIterator<[IForgeModelProxy, Attributes]>;
	    $add(iProxy: IForgeModelProxy, attributes: Attributes): Promise<void>;
	    remove(iProxy: IForgeModelProxy): Promise<void>;
	    $connect(iStore: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $fork(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $order(parent: IForgeStore, children: IForgeStore[]): Promise<void>;
	    $read(iStore: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	    $purge(iStore: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	
		
	
	
	
	
	export class ClientSocketModelProxy extends AbstractForgeModelProxy {
	    private _iSocket;
	    private _rootHash;
	    private _state;
	    private _iStoreRemap;
	    private _$ready;
	    private readonly _queue;
	    constructor(iModel: IForgeModel, iSocket: IForgeSocket);
	    private _$thenISocketReady;
	    protected _$queue(header: Record<string, unknown>, data: Serialize): Promise<Serialize>;
	    get $ready(): Promise<IForgeModel>;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	    $activate(): Promise<void>;
	    $connect(iStore: IForgeStore, hash: string): Promise<void>;
	    $mutate(iStore: IForgeStore, mutateStore: IForgeStore): Promise<void>;
	    $fork(parent: IForgeStore, child: IForgeStore): Promise<void>;
	    $write(iStore: IForgeStore, data: ArrayBuffer, mime: string, replacementStore?: IForgeStore): Promise<void>;
	    $frame(): Promise<void>;
	    $flush(): Promise<void>;
	}
	
		
	
	
	
	export class RootSocketModelProxy extends AbstractForgeModelProxy {
	    private readonly _roots;
	    readonly _iSockets: Set<IForgeSocket>;
	    constructor(iModel: IForgeModel);
	    private _$waitForStore;
	    private _validateModelState;
	    $message(iSocket: IForgeSocket, header: Record<string, unknown>, data: Serialize): Promise<void>;
	}
	
		
	
	
	
	export enum ForgeStoreMime {
	    Released = "forge/released",
	    Undefined = "forge/undefined",
	    Number = "forge/number",
	    Binary = "forge/binary",
	    JSON = "application/json",
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
	export interface IForgeStore {
	    [Symbol.asyncIterator](): AsyncIterableIterator<[IForgeStore, Attributes]>;
	    get hash(): string;
	    get attributes(): Attributes;
	    get $children(): Promise<IForgeStore[]>;
	    get $parent(): Promise<IForgeStore>;
	    get $ancestry(): Promise<IForgeStore[]>;
	    $ready(race: number): Promise<this>;
	    $connect(iModel: IForgeModel): Promise<this>;
	    $purge(): Promise<IForgeStore[]>;
	    $fork(iForgeStore: IForgeStore): Promise<IForgeStore>;
	    $order(iForgeStores: IForgeStore[]): Promise<void>;
	    $find(callback: (value: IForgeStore, attributes: Attributes) => boolean): Promise<IForgeStore[]>;
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
	    static Null: string;
	    static Header: string;
	    static Race: number;
	    static Empty(attributes: Attributes): ForgeStore;
	    static Number(attributes: Attributes, value: number): ForgeStore;
	    static JSON(attributes: Attributes, value: Record<string, unknown>): ForgeStore;
	    static Binary(attributes: Attributes, value: ArrayBuffer): IForgeStore;
	    static Store(attributes: Attributes, value: ArrayBuffer, mime: string): IForgeStore;
	    protected _mime: string;
	    protected _attributes: Attributes;
	    protected _hash: string;
	    protected _lock: string;
	    protected _releasedStore: IForgeStore;
	    protected readonly _$connectModel: $Promise<IForgeModel>;
	    protected readonly _$iModel: $Promise<IForgeModel>;
	    protected readonly _$released: $Promise<IForgeStore>;
	    protected readonly _$body: $Promise<[ArrayBuffer, string]>;
	    protected readonly _$ready: $Promise<this>;
	    constructor(attributes: Attributes);
	    constructor(readStream: DataStreamReader);
	    constructor(attributes: Attributes, iModel: IForgeModel);
	    constructor(readStream: DataStreamReader, iModel: IForgeModel);
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
	    write(data: ArrayBuffer, mime: string): this;
	    $ready(race: number): Promise<this>;
	    $connect(iModel: IForgeModel): Promise<this>;
	    $lock(): Promise<void>;
	    $unlock(): Promise<void>;
	    $hasLock(): Promise<boolean>;
	    $purge(): Promise<IForgeStore[]>;
	    $fork(child: IForgeStore): Promise<IForgeStore>;
	    $order(iForgeStores: IForgeStore[]): Promise<void>;
	    $write(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $read(): Promise<[ArrayBuffer, string]>;
	    $mutate(data: ArrayBuffer, mime: string): Promise<IForgeStore>;
	    $query(): Promise<IQuery<IForgeStore>>;
	    $query(recursive: boolean): Promise<IQuery<IForgeStore>>;
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
	
		
	
	
	export class JSONStore extends ForgeStore {
	    constructor(value: Record<string, unknown>, attributes: Attributes);
	    constructor(value: Record<string, unknown>, attributes: Attributes, iModel: IForgeModel);
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
	
		
	
	class ForgeFile {
	    static Path: typeof ForgePath;
	    static Stream: {
	        Write: (file: string, options?: {}) => {
	            write: (contents: string | Buffer | ArrayBuffer) => void;
	            $end: () => Promise<string>;
	        };
	    };
	    static $Status(target: string): Promise<any>;
	    static $FileExist(file: string): Promise<boolean>;
	    static $DirectoryExists(path: string): Promise<boolean>;
	    static $MakeDirectory(path: string): Promise<boolean>;
	    static Read(path: string, options?: Record<string, unknown>): ArrayBuffer;
	    static $ReadString(path: string, encoding?: 'utf8' | string): Promise<string>;
	    static $Read(path: string): Promise<ArrayBuffer>;
	    static $Write(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	    static $Write(path: string, contents: string | Buffer | ArrayBuffer, options: {}): Promise<void>;
	    static $Append(path: string, contents: string | Buffer | ArrayBuffer): Promise<void>;
	    static $Append(path: string, contents: string | Buffer | ArrayBuffer, options: {}): Promise<void>;
	    static $Copy(source: string, target: string): Promise<void>;
	    static $Walk(root: string): Promise<string[]>;
	    static $Walk(root: string, recursive: false): Promise<string[]>;
	    static $Walk(root: string, fileList: string[]): Promise<string[]>;
	    static $Watch(root: string): Promise<ForgeFileWatcher>;
	}
	export class ForgeFileWatcher extends Subscription {
	    private _$watcher;
	    private _abortController;
	    constructor(root: string);
	    [Symbol.asyncIterator](): AsyncIterableIterator<{
	        event: string;
	        file: string;
	    }>;
	    cancel(): void;
	}
	class ForgeWeb {
	    static $Fetch(url: string, options: Record<string, unknown>): Promise<Response>;
	}
	export class ForgeIO {
	    static readonly File: typeof ForgeFile;
	    static readonly Web: typeof ForgeWeb;
	    static $Fetch(source: string): Promise<ArrayBuffer>;
	    static $Download(url: string, file: string): Promise<boolean>;
	}
	
	
		export type ForgeParsedPath = {
	    root: string;
	    dir: string;
	    base: string;
	    ext: string;
	    name: string;
	};
	export class ForgePath {
	    static IsAbsolute(file: string): boolean;
	    static Parse(file: string): ForgeParsedPath;
	    static Resolve(...rest: string[]): string;
	    static Relative(source: string, target: string): string;
	    static Contains(source: string, target: string): boolean;
	    static $Status(root: string, target: string): Promise<{
	        isSubdirectory: boolean;
	        exists: boolean;
	        contains: boolean;
	    }>;
	    static Sanitize(...rest: string[]): string;
	}
	
		export interface IForgeRequestAdapter {
	    url: string;
	    headers: Record<string, string>;
	    cookies: Record<string, string>;
	    method: string;
	    protocol: string;
	    originalUrl: string;
	    get(key: string): string;
	    on(type: string, delegate: Function): this;
	}
	export class ForgeRequest {
	    private _parseBody;
	    private _$body;
	    source: IForgeRequestAdapter;
	    url: URL;
	    search: Record<string, string>;
	    queryString: string;
	    query: Record<string, string>;
	    method: string;
	    headers: Record<string, string>;
	    cookies: Record<string, string>;
	    routes: string[];
	    constructor(source: IForgeRequestAdapter);
	    $body(race: number): Promise<ArrayBuffer>;
	    get mime(): string;
	    path(startRoute: string): string;
	    fullURL(startRoute?: string): string;
	}
	
		
	
	export type ResponseOutput = string | ArrayBuffer | ArrayBufferView | Buffer;
	export interface IResponseAdapter {
	    setHeader(key: string, value: string): void;
	    status(value: number): any;
	    send(buffer: Buffer): void;
	    end(): void;
	    type(value: string): void;
	    write(data: any): void;
	}
	export class ForgeResponseChunk {
	    private _writes;
	    private _$complete;
	    [Symbol.iterator](): IterableIterator<ResponseOutput>;
	    [Symbol.asyncIterator](): AsyncIterableIterator<ResponseOutput>;
	    constructor();
	    write(data: ResponseOutput): this;
	    clear(): this;
	    end(): void;
	}
	export class ForgeResponse {
	    private _response;
	    private _writes;
	    private _status;
	    private _$end;
	    private _race;
	    errors: Set<unknown>;
	    query: QueryManager<unknown>;
	    constructor(response: IResponseAdapter, race: number);
	    set type(value: string);
	    set status(value: number);
	    header(entries: Record<string, string>): this;
	    header(key: string, value?: string): this;
	    clear(): void;
	    chunk(attributes: Attributes): void;
	    write(data: string | ArrayBuffer | ArrayBufferView | Buffer): void;
	    stream(buffer: ArrayBuffer): void;
	    flush(): void;
	    end(): void;
	    unwrap(): IResponseAdapter;
	}
	
		
	
	
	export function $ParseRequestBody(request: any): Promise<[ArrayBuffer, string]>;
	export class RequestBodyParser {
	    private _buffers;
	    private _request;
	    private _$buffer;
	    private _onData;
	    constructor(request: any);
	    private _onEnd;
	    $resolve(): Promise<{
	        mime: string;
	        buffer: Buffer;
	    }>;
	}
	export class ForgeServer {
	    private _app;
	    protected _$catchRoute: (error: unknown) => false;
	    readonly routes: Set<IForgeRoute>;
	    constructor(port: number);
	    protected _buildRequest(request: any): ForgeRequest;
	    protected _buildResponse(response: any): ForgeResponse;
	    private _$setupServer;
	    use(delegate: Function): void;
	    protected _$all(request: any, response: any, next: Function): Promise<void>;
	}
	
		
	
	
	export class FileRoute extends ForgeRoute {
	    private _file;
	    private _mime;
	    private _status;
	    private _cache;
	    constructor(config: {
	        components?: IForgeRouteComponent[];
	        file: {
	            path: string;
	            mime?: string;
	            cached?: boolean;
	            preload?: boolean;
	        };
	        race?: number;
	        status: number;
	    });
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    invalidate(): this;
	}
	export class FileDirectoryRoute extends ForgeRoute {
	    static Authorize: {
	        Target: (regExp: RegExp, options?: {
	            group?: string;
	            index?: number;
	        }) => RouteDelegate;
	        Match: (...matches: string[]) => RouteDelegate;
	        RegExp: (regExp: RegExp, options?: {
	            groups?: string;
	            index?: number;
	        }) => RouteDelegate;
	        All: (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	    };
	    protected _target: string;
	    protected _root: string;
	    protected _index: string;
	    protected _status: number;
	    protected _$renderCallback: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	    constructor(config: {
	        root: string;
	        index?: string;
	        $render?: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	        components?: IForgeRouteComponent[];
	        race?: number;
	        status?: number;
	    });
	    get target(): string;
	    get root(): string;
	    get index(): string;
	    set relative(value: string);
	    set absolute(value: string);
	    $status(target: string): Promise<{
	        isSubdirectory: boolean;
	        exists: boolean;
	        contains: boolean;
	    }>;
	    $read(target: string): Promise<ArrayBuffer>;
	    protected _$render(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    add(component: IForgeRouteComponent & {
	        $render?: (request: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	    }): this;
	}
	
		
	
	export type RouteDelegate = (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	export interface IForgeRoute {
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	export type IForgeRouteComponent = {
	    $authorize?: RouteDelegate;
	    $resolve?: RouteDelegate;
	    $reject?: RouteDelegate;
	    $finally?: RouteDelegate;
	};
	export class ForgeRoute implements IForgeRoute, IForgeRouteComponent {
	    protected static Race: number;
	    static Authorize: {
	        Match: (...matches: string[]) => RouteDelegate;
	        RegExp: (regExp: RegExp, options?: {
	            groups?: string;
	            index?: number;
	        }) => RouteDelegate;
	        All: (forgeRequest: ForgeRequest, response: ForgeResponse, iRoute: IForgeRoute) => Promise<boolean>;
	    };
	    static RegExpURL(regExp: RegExp): ForgeRoute;
	    protected _components: Set<IForgeRouteComponent>;
	    protected _race: number;
	    constructor();
	    constructor(config: {
	        race?: number;
	        components?: IForgeRouteComponent[];
	    });
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $finally(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    add(component: IForgeRouteComponent): this;
	}
	export class CaptureRoute extends ForgeRoute {
	    private _$delegate;
	    constructor($delegate: RouteDelegate, passthrough?: boolean);
	    $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	    $reject(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
		
	
	
	export class HTTPRoute extends ForgeRoute {
	    private _root;
	    constructor(route: RegExp, root: string);
	    $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean>;
	}
	
		
	
	export class ExecSocket extends AbstractForgeSocket {
	    private _source;
	    private _command;
	    private _config;
	    constructor(name: string, config: SocketConfig);
	    private _injectCommand;
	    write(header: Serialize, data: Serialize): void;
	    $signal(signal: string, data: Serialize): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	}
	
		
	
	
	
	enum StdioOption {
	    Pipe = "pipe",
	    Inherit = "inherit",
	    Silent = "silent"
	}
	export type SocketConfig = {
	    command?: string;
	    debounce?: number;
	    stdio?: string;
	    race?: Record<string, number>;
	    key?: string;
	    reboot?: boolean;
	};
	export interface IForgeSocket extends ISubscription {
	    routes: Set<IForgeRoute>;
	    get key(): string;
	    get name(): string;
	    get $ready(): Promise<Serialize>;
	    race(): number;
	    race(value: string): number;
	    read(message: [string, Record<string, unknown>, Serialize]): void;
	    write(header: Omit<Record<string, unknown>, "key">, data: Serialize): void;
	    resolve(header: Record<string, unknown>, data: Serialize): void;
	    reject(header: Record<string, unknown>, data: Serialize): void;
	    $reset(data: Serialize): Promise<Serialize>;
	    $start(data: Serialize): Promise<Serialize>;
	    $session(header: Record<string, unknown>, data: Serialize, race: number): Promise<Serialize>;
	    $signal(signal: string, data: Serialize): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    $reboot(): Promise<void>;
	}
	export class AbstractForgeSocket extends Subscription implements IForgeSocket {
	    protected _name: string;
	    protected _key: string;
	    protected _reboot: boolean;
	    protected _stdio: StdioOption;
	    protected readonly _race: ForgeRace;
	    protected readonly _sessions: Map<string, $Promise<unknown>>;
	    protected readonly _bindings: Map<Function, Function>;
	    protected readonly _$start: $Promise<Serialize>;
	    protected readonly _$ready: $Promise<Serialize>;
	    readonly routes: Set<IForgeRoute>;
	    constructor(name: string, config: SocketConfig);
	    protected _pipeStdio(message: string): void;
	    protected _pipeError(message: string): void;
	    protected _getSession(race: number, capture: Capture): [string, $Promise<Serialize>];
	    protected _$thenStart(data: Serialize): Promise<void>;
	    get key(): string;
	    get name(): string;
	    race(): number;
	    race(value: string): number;
	    get $ready(): Promise<Serialize>;
	    $start(data: Serialize): Promise<Serialize>;
	    read(message: [string, Record<string, unknown>, Serialize]): boolean;
	    write(header: Record<string, unknown>, data: Serialize): void;
	    resolve(header: Record<string, unknown>, data: Serialize): void;
	    reject(header: Record<string, unknown>, data: Serialize): void;
	    $reset(data: Serialize): Promise<Serialize>;
	    $session(header: Record<string, unknown>, data: Serialize, race: number): Promise<Serialize>;
	    $signal(signal: string, data: Serialize): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	    $broadcast(signal: string, data: Serialize, race?: number): Promise<Serialize>;
	    $reboot(): Promise<void>;
	}
	
	
		
	
	export class ForkSocket extends AbstractForgeSocket {
	    private _source;
	    private _commands;
	    private _args;
	    constructor(name: string, config: SocketConfig, source?: any);
	    private _onExit;
	    write(header: Omit<Serialize, "key">, data: Serialize): void;
	}
	
		
	
	export class PluginSocket extends AbstractForgeSocket {
	    private _source;
	    private _commands;
	    constructor(name: string, config: SocketConfig, source?: any);
	    write(header: Serialize, data: Serialize): void;
	    $reset(data: Serialize, race?: number): Promise<Serialize>;
	    $signal(signal: string, data: Serialize): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	}
	
		
	
	export class RestSocket extends AbstractForgeSocket {
	    private _source;
	    private _command;
	    private _config;
	    constructor(name: string, config: SocketConfig);
	    private _injectCommand;
	    write(header: Serialize, data: Serialize): void;
	    $signal(signal: string, data: Serialize): Promise<Serialize>;
	    $signal(signal: string, data: Serialize, race: number): Promise<Serialize>;
	}
	
		
	
	export class SpawnSocket extends AbstractForgeSocket {
	    private _source;
	    private _commands;
	    constructor(name: string, config: SocketConfig, source?: any);
	    private _onExit;
	    write(header: Serialize, ...data: Serialize[]): void;
	}
	
		
	
		
	
	
}