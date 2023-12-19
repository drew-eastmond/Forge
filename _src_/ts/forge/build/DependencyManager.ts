import { DependencyHelper } from "./DependencyHelper";

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

export type SectionEntry = {
    file: string,
    code: string,
    bytes: number,
    imports: ImportEntrty[], // [[Object], [Object], [Object], [Object], [Object], [Object]],
    format: "cjs" | "esm"
};

export class DependencyManager {

    private _fileManifest: string[];
    
    private _dependencyHelper: DependencyHelper; 

    private _inputs: Record<string, BuildEntry>;

    public entry: string;

    public header: string;
    public footer: string;

    private readonly _sectionMap: Map<string, SectionEntry> = new Map();

    public get sections(): IterableIterator<SectionEntry> {

        /* const results: [string, string, SectionEntry][] = [];
        for (const [key, buildEntry] of ) {

            results.push([key, buildEntry])

        } */

        return this._sectionMap.values();

    }

    constructor(entry: string, inputs: Record<string, unknown>) {

        this.entry = entry;


        this._dependencyHelper = new DependencyHelper();

        this._inputs = inputs as Record<string, BuildEntry>;

        this._fileManifest = Object.keys(inputs);

    }

    private _sanitizeFileUrl(...rest: string[]): string {

        let resolvedUrl: string = path.resolve(...rest);
        resolvedUrl = (/\.\w+$/.test(resolvedUrl)) ? resolvedUrl : resolvedUrl + ".ts";
        return path.relative(process.cwd(), resolvedUrl.replace(/[\\\/]+/g, "/"));

    }

    public set code(val: string) {

        // split the compiled code into segments using 
        const compiledSections: string[] = val.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
        this.header = compiledSections[0];

        for (let i = 1; i < compiledSections.length; i += 2) {

            for (const [file, buildEntry] of Object.entries(this._inputs)) {

                const importName: string = this._sanitizeFileUrl(compiledSections[i]);

                if (file.indexOf(importName) == 0) {

                    const sectionEntry: SectionEntry = { ...buildEntry, code: compiledSections[i + 1], file: importName };
                    this._sectionMap.set(file, sectionEntry);

                    break;

                }

            }

        }

        this.footer = "";

    }

    public has(file: string): boolean {

        for (const [key, entry] of Object.entries(this._inputs)) {

            if (key === file) return true;

        }

        return false;

    }

    public get(file: string): SectionEntry {

        if (this._inputs[file] === undefined) throw new Error(`file ("${file}") not found in manifest`);

        return this._inputs[file];

    }

    public load(dependencies: NodeData[]): this {

        this._dependencyHelper
            .load(dependencies)
            .intersect(this._fileManifest);

        return this;

    }
}