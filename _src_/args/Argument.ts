import { DecodeBase64 } from "../core/Core";

type ValidationEntry = {
    default?: unknown,
    required?: boolean,
    error?: string,
    validator?: (value: unknown) => unknown;
}

export interface IArguments {

    get(): unknown;
    get(key?: string): unknown;
    get(key?: string): unknown

    add(key: string, config: ValidationEntry): this;

    compile(): void;

}

class AbstractArguments implements IArguments {

    protected readonly _args: Record<string, unknown> = {};
    protected readonly _validationMap: Map<string, ValidationEntry> = new Map();
    protected readonly _errors: string[] = [];

    constructor() {

    }
    
    protected _validateEntry(key: string, value: unknown, validation: ValidationEntry): unknown {

        // assign all default values
        if (validation.default !== undefined) value = (value === undefined) ? validation.default : value;

        // now validate each entry added
        if (validation.required && value === undefined) {

            const errorMessage: string = validation.error || `\u001b[31; 1mMissing or incorrect \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`
            this._errors.push(errorMessage);

        } else if (validation.validator) {

            const result: unknown = validation.validator(this._args);
            if (result && result instanceof Error) {
                
                const errorMessage: string = validation.error || `\u001b[31; 1mValidation Failed for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`
                this._errors.push(errorMessage);

            }

            return result; 

        }

        return value;

    }

    public get(): unknown;
    public get(key?: string): unknown;
    public get(key?: string): unknown {

        return (key === undefined) ? this._args : this._args[key];

    }

    public add(key: string, config: ValidationEntry): this {

        this._validationMap.set(key, {
            default: config.default,
            validator: config.validator,
            required: config.required || false,
            error: config.error
        });

        return this;

    }

    compile(): void {

        for (const [key, validation] of this._validationMap) {

            const value: unknown = this._args[key];
            this._validateEntry(key, value, validation);

        }

        if (this._errors.length) {

            console.log(this._errors);

            throw "Errors";

        }

    }

}

export class CLIArguments extends AbstractArguments {

    public compile(): void {

        const args: string[] = process.argv;

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

\u001b[31;1mIncorrect formatting encountered parsing key arguments : "\u001b[34;1m${keyQuery}\u001b[31;1m"\u001b[0m
${JSON.stringify(this._args, undefined, 2)}`);

            }

        }

        super.compile();

    }

}

export class EnvArguments extends AbstractArguments {

    public get(): unknown;
    public get(key?: string): unknown;
    public get(key?: string): unknown {

        return (key === undefined) ? { ...this._args, ...process.env } : this._args[key] || process.env[key];

    }

    public compile(): void {

        /*
        * 1. We only have to parse entries in the `this._validationMap` 
        */
        for (const [key, validation] of this._validationMap) {
         
            const value: unknown = this.get(key);
            this._args[key] = validation.validator(value);

        }

    }

    public parse(contents: string): this {

        for(const line of contents.split(/\n/)) {

            const [key, value]: string[] = line.split("=");
            this._args[key] = value;

        }

        return this;

    }

}


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

    public parse(contents: string): this {

        this._envArguments.parse(contents);

        return this;

    }
    
}