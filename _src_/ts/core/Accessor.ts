import { FlattenObject } from "./Core";

export class Accessor {

    private _source: Record<string, unknown>;
    private _seperator: string;
    private _entries: { access: string, value: unknown }[]

    constructor(source: Record<string, unknown>, seperator?: string) {

        this._source = source;
        this._seperator = seperator;

        this._entries = FlattenObject(this._source);

    }

    /**
     * Iterates via Object.entries(...) on the internal _args property
     * 
     * @generator
     * @yields {[string, unknown]}
     */
    public *[Symbol.iterator](): Iterator<{ access: string, value: unknown }> {

        for (const entry of this._entries) {

            yield entry;

        }

    } 

    public has(accessor: string[]): boolean {

        let value: unknown = this._source;
        try {

            for (const access of accessor) {

                if ((access in value) === false) return false;

                value = value[access];

            }

            return (value instanceof Object) ? false : true;

        } catch (error) {

            return false;

        }

    }

    public extract(accessor: string[]): unknown {

        let value: unknown = this._source;
        try {

            for (const access of accessor) {

                value = value[access];

            }

        } catch (error) {

            return new Error(`property does not exist for ${accessor}`);

        }

        return value;

    }

    public parse(query: string): unknown {

        const accessor: string[] = query.split(this._seperator);
        let value: unknown = this._source;
        try {

            for (const access of accessor) {

                value = value[access];

            }

        } catch (error) {

            return new Error("value ");

        }

        return value;

    }

    public inject(input: string, regExp: RegExp, delegate?: (match: string, access: string) => string): string {

        let results: RegExpExecArray;
        while (results = regExp.exec(input)) {

            const match: string = results[0];
            const access: string = results[1];
            const accessSequence: string[] = access.split(".");

            // console.log(results[1], accessor.has(results[1].split(".")));
            if (this.has(accessSequence)) {

                // const value: unknown = 

                // console.log(results[1]);
                input = input.replace(`{${access}}`, this.extract(accessSequence) as string);

            } else {

                if (delegate instanceof Function) {

                    const value: string = delegate(match, access);
                    input = input.replace(`{${access}}`, value);

                }

            }

        }

        return input;

    }


}