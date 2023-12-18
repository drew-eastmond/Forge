const path = require("path");

type ImportEntrty = {
    path: string,
    kind: "require-call" | "import-statement",

    original?: string,
    external?: boolean,
};

type BuildEntry = {
    bytes: number,
    imports: ImportEntrty[], // [[Object], [Object], [Object], [Object], [Object], [Object]],
    format: "cjs" | "esm"
};

export class BuildManifest {

    private _inputs: Record<string, BuildEntry>[];

    constructor(inputs: Record<string, BuildEntry>[]) {

        this._inputs = inputs;

    }

    public has(file: string): boolean {

        for (const [key, entry] of Object.entries(this._inputs)) {

            if (key === file) return true;

        }

        return false;

    }
}