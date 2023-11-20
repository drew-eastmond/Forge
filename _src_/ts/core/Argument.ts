import { DecodeBase64 } from "../core/Core";

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
    default?: unknown,
    required?: boolean,
    error?: string,
    sanitize?: (value: unknown, args: Record<string, unknown>) => unknown;
    validate?: (value: unknown, args: Record<string, unknown>) => boolean | Error;
}

export interface IArguments {

    get(): unknown;
    get(key?: string): unknown;
    get(key?: string): unknown

    add(key: string, config: ValidationEntry): this;

    compile(): void;

}

/**
 * Provides a base to store validation data and arguments formatted as a Record. 
 * After the subclass populates the arguments store, and add validation for each key.
 * The `compile` member will test each key, and throw an error before resolving all validation queries.
 * 
 */
class AbstractArguments implements IArguments {

    protected readonly _args: Record<string, unknown> = {};
    protected readonly _validationMap: Map<string | RegExp, ValidationEntry> = new Map();
    protected readonly _errors: string[] = [];

    constructor() {

    }


    /**
     * Iterates via Object.entries(...) on the internal _args property
     * 
     * @generator
     * @yields {[string, unknown]}
     */
    public *[Symbol.iterator](): Iterator<[string, unknown]> {

        for (const entry of Object.entries(this._args)) {

            yield entry;

        }

    } 

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

    protected _validate(key: string | RegExp, value: unknown, validation: ValidationEntry): unknown {

        // if (key instanceof RegExp && key.test(value as string) === false) return true;


        // Assign all default values
        if (validation.default !== undefined) value = (value === undefined) ? validation.default : value;
       
        // Now validate each entry added, or append the assigned/default error message to be resolved later
        if (validation.required && value === undefined) {

            const errorMessage: string = validation.error || `\u001b[31; 1mRequired value for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`
            this._errors.push(errorMessage);

        }

        // Optional validation delegate to provide insight. 
        // The `validation.validate ( ... )` should return `boolean`, or a `Error` for a custom message.
        if (validation.validate) {

            // use the delegate validate and check the results.
            const result: boolean | Error = validation.validate(value, this._args);

            if (result === false || result === undefined) {

                console.log(validation);

                const errorMessage: string = validation.error || `\u001b[31; 1mValidation Failed for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`
                this._errors.push(errorMessage);

            } else if (result instanceof Error) {


                const error: Error = result;
                const errorMessage: string = error.message;
                this._errors.push(errorMessage);

            }

        }

        // Optional sanitation delegate to correct values or provide insight.
        // The `validation.sanitize ( ... )` should return `unknown` corrected value, or a `Error` for a custom message.
        if (validation.sanitize) {

            // let the developer decide how to validate the value. If the function returns a error then use the `error.message`
            const result: unknown = validation.sanitize(value, this._args);
            if (result && result instanceof Error) {

                const error: Error = result;
                const errorMessage: string = error.message || `\u001b[31; 1mSanitation Failed for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`
                this._errors.push(errorMessage);

            }

            // let just assume this is now a santized value
            return result; 

        }

        // no fuss, no muss! Just return the value as is...
        return value;

    }

    /**
     * Find the requested key in the internal args members. Can evaluate using `String` or `RegExp`
     * 
     * @param key {string|RegExp} Optional 
     * @returns {boolean} 
     */

    public has(key: string | RegExp): boolean {

        if (key.constructor === RegExp) {

            const regExp: RegExp = key as RegExp;

            for (const [key, value] of Object.entries(this._args)) {

                if (regExp.test(key)) return true;

            }

        } else if (key.constructor === String) {

            return (key in this._args);

        }

        return false;

    }

    /**
     * Getter that will return the value associated with the key, or the arguments collection {Record<string, unknown>) 
     * if a RegExp the is passed then this function will returnt he first value that matches.
     * if a string is pass then the value of the indexed value will be returned.
     * if no value is passed then the whole arg object is returned.
     * 
     * @param key {string|RegExp|undefined} Optional 
     * @returns {unknown} DO l really need to explain this
     */

    public get(): unknown;
    public get(key: string | RegExp): unknown;
    public get(key?: string | RegExp): unknown {

        if (key && key.constructor === RegExp) {

            const regExp: RegExp = key as RegExp;

            for (const [key, value] of Object.entries(this._args)) {

                if (regExp.test(key)) return value;

            }

            return undefined;

        }

        return (key === undefined) ? this._args : this._args[key as string];

    }

    /**
     * Assigns a validation check to specific arguments via the key provided
     * 
     * @param key {string|RegExp} A string or RegExp to match the Arguments and dispatch delegate
     * @param validationEntry {ValidationEntry}
     * @returns {this} return this so you can daisy chain calls
     */

    public add(key: string | RegExp, validationEntry: ValidationEntry): this {

        this._validationMap.set(key, { ...validationEntry, required: validationEntry.required || false });

        return this;

    }

    /**
     * Subclasses are responsible for assigning a data source (CLI, .Env, Remote/Server) into a arguments {Record<string, unknown>}
     *      1. After using `add` member to set all the validation entries. 
     *      2. `compile` will validate/sanitize each entry. If there any errors then join all errors messages into a single Error and throw it!
     */
    compile(): void {

        // sanitize each entry
        for (const [key, validation] of this._validationMap) {

            if (key.constructor === RegExp) continue;

            const value: unknown = this._args[key as string];
            this._args[key as string] = this._validate(key as string, value, validation);

        }

        for (const [key, value] of Object.entries(this._args)) {

            for (const [query, validation] of this._validationMap) {

                if (query.constructor === String) continue;
                if ((query as RegExp).test(key) === false) continue;

                // console.log(key, query, (query as RegExp).test(key));

                const value: unknown = this._args[key];
                this._args[key] = this._validate(key, value, validation);

            }

        }

        // if we did get errors then let the developer catch the error. Let that mutha***er sort this mess out!
        if (this._errors.length) {

            // console.log(this._errors);
            throw new Error(this._errors.join("\n"));

        }

    }

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

    public compile(): void {

        const args: string[] = process.argv;

        // parameters start after the second argument
        for (let i: number = 2; i < args.length; i) {

            // validate if the arguments match the formattung for parsing keys
            const keyQuery: string = args[i++];

            if (/{{(.+?)}}/.test(keyQuery)) { // {{key}} parses from a base64 encoded JSON string
            
                const results: RegExpExecArray = /{{(.+?)}}/.exec(keyQuery);
                const base64: string = args[i++];
                this._args[results[1]] = JSON.parse(DecodeBase64(base64));
            
            } else if (/--(.+?)--/.test(keyQuery)) { // --key-- parses into a key:value pair

                const results: RegExpExecArray = /--(.+?)--/.exec(keyQuery);
                this._args[results[1]] = args[i++];

            } else if (/--(.+?)$/.test(keyQuery)) { // --key parses into a key:true flag with a default value of true

                const results: RegExpExecArray = /--(.+?)$/.exec(keyQuery);
                this._args[results[1]] = true;

            } else { // no formatting found, abort!!! This is a simple script

                // give a meanful error and exit
                throw new Error(`(Executing) node ${args.slice(1).join(" ")}
<red>Incorrect formatting encountered parsing key arguments : "<blue>${keyQuery}</blue>"
${JSON.stringify(this._args, undefined, 2)}`);

            }

        }

        super.compile();

    }

}

// todo Add base64 formattings
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
    public get(): unknown;
    public get(key?: string): unknown;
    public get(key?: string): unknown {

        return (key === undefined) ? { ...this._args, ...process.env } : this._args[key] || process.env[key];

    }

    /* public compile(): void {

        /*
        * 1. We only have to parse entries in the `this._validationMap` 
        * /
        for (const [key, validation] of this._validationMap) {
         
            const value: unknown = this.get(key);
            this._args[key] = validation.sanitize(value);

        }

    } */

    // todo change to rexexp 
    /**
     * Simple split alorithm to populate the arguemnt store
     * @param contents {string} Content pulled from a .env or similiar formatted content; or you know... DIY if your a smart ass!
     * @returns {this} Daisy chain this bad boi!
     */

    public parse(contents: string): this {

        for(const line of contents.split(/\n/)) {

            const [key, value]: string[] = line.split("=");
            this._args[key] = value;

        }

        return this;

    }

}

/**
 * Combines the `CLIArgument` and `EnvArgument` into a composite so development becomes easier. The priority is
 * CLIArguments then EnvArguments. It's important to call the `parse` memeber for `EnvArgument`
 * @class
 */
export class CompositeArguments extends AbstractArguments {

    private readonly _cliArguments: CLIArguments = new CLIArguments();
    private readonly _envArguments: EnvArguments = new EnvArguments(); 

    public compile(): void {

        this._cliArguments.compile();
        this._envArguments.compile();

        const entries: Record<string, unknown> = { 
            ...this._envArguments.get() as Record<string, unknown>, 
            ...this._cliArguments.get() as Record<string, unknown> 
        };
        for(const [key, value] of Object.entries(entries)) {

            this._args[key] = value;

        }

        /*
        * 1. We only have to parse entries in the `this._validationMap` 
        */
        super.compile();

    }

    /**
     * Invokes the `EnvArgument.parse ( ... )` 
     * 
     * @param contents 
     * @returns {this}
     */
    public parse(contents: string): this {

        this._envArguments.parse(contents);

        return this;

    }
    
}