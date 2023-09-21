type ValidationnEntry = {
    default?: unknown,
    required?: boolean,
    error?: string,
    validator?: Function
}
export class CLIArguments {

    private readonly _args = {};
    private readonly _validationMap: Map<string, ValidationnEntry> = new Map();

    public get(): unknown;
    public get(key?: string): unknown;
    public get(key?: string): unknown {

        return (key === undefined) ? this._args : this._args[key];

    };
    public add(key: string, config: ValidationnEntry): this {

        this._validationMap.set(key, {
            default: config.default,
            validator: config.validator,
            required: config.required || false,
            error: config.error
        });

        return this;

    }

    public compile(args: string[]) {

        for (let i: number = 2; i < args.length; i) {

            // validate if the arguments match the formattung for parsing keys
            const keyQuery: string = args[i++];

            // --{key}-- parses into a key:value pair
            if (/--(.+?)--/.test(keyQuery)) {

                const results: RegExpExecArray = /--(.+?)--/.exec(keyQuery);
                this._args[results[1]] = args[i++];

                // --{key} parses into a key:true flag with a default value of true
            } else if (/--(.+?)$/.test(keyQuery)) {

                const results: RegExpExecArray = /--(.+?)$/.exec(keyQuery);
                this._args[results[1]] = true;

                // no formatting found, abort!!! This is a simple script
            } else {

                // give a meanful error and exit
                console.error(`(Executing) node ${args.slice(1).join(" ")}

\u001b[31;1mIncorrect formatting encountered parsing key arguments : "\u001b[34;1m${keyQuery}\u001b[31;1m"\u001b[0m
${JSON.stringify(this._args, undefined, 2)}`);

                process.exit(1);

            }

        }

        const errors: string[] = [];

        for (const [key, validation] of this._validationMap) {

            // assign all default values
            if (validation.default !== undefined) this._args[key] = (this._args[key] === undefined) ? validation.default : this._args[key];

            // now validate each entry added
            if (validation.required && (key in this._args) === false) {

                errors.push(validation.error || `\u001b[31; 1mMissing or incorrect \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`);

            } else if (validation.validator) {

                if (validation.validator(this._args) === false) {

                    errors.push(validation.error || `\u001b[31; 1mValidation Failed for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`);

                }

            }

        }

        if (errors.length) {

            console.log(errors);

            throw "Errors";

        }


        console.log(this._args);

    }

}