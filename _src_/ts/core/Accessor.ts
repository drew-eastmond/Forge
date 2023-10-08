export class Accessor {

    private _source: Record<string, unknown>;
    private _seperator: string;

    constructor(source: Record<string, unknown>, seperator: string) {

        this._source = source;
        this._seperator = seperator;

    }

    public extract(accessor: string[]): unknown {

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

    public inject(input: string, prefix: string, suffix: string): string {

        const regExp: RegExp = new RegExp(prefix + "(.+?)" + suffix, "g");

        let results: RegExpExecArray;
        while (results = regExp.exec(input)) {

            const accessor: string[] = results[1].split(this._seperator);
            let value: unknown = this._source;
            try {

                for (const access of accessor) {

                    value = value[access];

                }

            } catch (error) {

                continue;

            }

            // inject eh current value
            input = input.replace(new RegExp(`{{${results[1]}}}`), String(value));

        }

        return input;

    }


}