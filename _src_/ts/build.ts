/*
*
* require and external imports
*
*/
const path = require("path");
const fs = require("fs");
const $fs = require("node:fs/promises");
const { spawn, fork, exec, execSync } = require("child_process");
const vm = require('node:vm');

import { Format, Platform, build as esBuild } from "esbuild";

/*
*
* imports
*
*/
import { DependencyHelper } from "./forge/build/DependencyHelper";
import { CLIArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { ForgeClient } from "./forge/ForgeClient";
import { QuickHash, Serialize } from "./core/Core";
import { chown } from "fs/promises";
import { ForgeBuildPlugin, IForgeBuildPlugin } from "./forge/build/ForgeBuildPlugin";
import plugin = require("../../../plugin");
import { BuildEntry, BuildManifest } from "./forge/build/BuildManifest";
import { DependencyManager } from "./forge/build/DependencyManager";

/*
*
* envrioments variables
*
*/
const API_BASE: string = "http://localhost:1234/esbuild/typescript";
const REQUEST_TIMEOUT: number = 125;


/*
*
*  application const
*
*/


/*
*
*  types / enums / interfaces
*
*/
type EsbuildResult = {
    outputFiles: { text: string }[],
    metafile: {
        inputs: unknown
    }
}

type BuildOptions = {
    bundled: boolean,
    platform: Platform,
    write: boolean,
    format: Format,
    metafile: boolean,
    treeShaking: boolean,
    external: string[],
    plugins: IForgeBuildPlugin[],
}

/*
*
* functions
*
*/
function SanitizeFileUrl(...rest: string[]): string {

    let resolvedUrl: string = path.resolve(...rest);
    resolvedUrl = (/\.\w+$/.test(resolvedUrl)) ? resolvedUrl : resolvedUrl + ".ts";
    return path.relative(process.cwd(), resolvedUrl.replace(/[\\\/]+/g, "/"));

}

function FilterNodeModules(file: string): boolean {

    return /node_modules/.test(file) === false; 

}

async function $SaveMetaFile(entryFile: string, outFile: string, fileManifest: string[], writeMeta: boolean) {

    if (writeMeta === true) {

        const outFilePath = path.parse(outFile);
        await $fs.writeFile(outFilePath.dir + "/" + outFilePath.name + ".meta", JSON.stringify(fileManifest));

    }

    const entryName: string = path.parse(entryFile).base;
    const fetchURL: string = `${API_BASE}/storage/save/${entryName}/metadata`;
    await fetch(fetchURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fileManifest),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response: Response) {

            console.log(`\nmeta data for "<white>${entryName}</white>" stored\n`);

        })
        .catch(function (error: unknown) {

            if (error instanceof Error) console.parse(`<red>${error.message}</red> from <cyan>${fetchURL}<cyan>`);

        });

}

async function $transformSections(plugins: Iterable<IForgeBuildPlugin>, header: string, sections: Iterable<[string, string]>, footer: string): Promise<string> {

    let output: string = "";

    /*
     *  tranform the header
     */
    //  header: string = `// (Forge) Header\n\n${header}`;
    for (const plugin of plugins) header = await plugin.$header(header);
    output += header;

    /*
     *  Transform each section
     */
    for (const [content, file] of sections) {

        const file: string = nodeData.title;
        let section: string = `// (Forge) ${file}\n${content}`;

        for (const plugin of plugins) section = await plugin.$section(section, file);

        output += section; // `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;

    }

    /*
     *  Tranform the footer
     */
    // let footer: string = "// (Forge) Footer\n\n";
    for (const plugin of plugins) footer = await plugin.$footer(footer);
    output += footer;


    return output;

}

async function $SortDependencies(code: string, storeKey: string, fileManifest: string[], plugins: IForgeBuildPlugin[], inputs?: Record<string, unknown>): Promise<string> {

    const dependencyManager: DependencyManager = new DependencyManager(storeKey, inputs);
    dependencyManager.code = code;

    // now extract any modified dependencies
    return await fetch(`${API_BASE}/storage/load/${storeKey}/dependencies`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response: Response) {

            // let dependencyHelper: DependencyHelper;

            const contentType: string = response.headers.get("Content-Type") as string;
            switch (contentType) {

                case "application/json":

                    // dependencyHelper = new DependencyHelper(await response.json());
                    // dependencyHelper.intersect(fileManifest);
                    dependencyManager.load(await response.json());
                    break;

                default:
                    throw new Error(`error fetching dependencies for "${storeKey}"`);

            }

            // split the compiled code into segments using 
            /* const compiledSections: string[] = code.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
            const headerSection: string = compiledSections[0];

            const sectionMap: Map<string, string> = new Map();
            for (let i = 1; i < compiledSections.length; i += 2) {

                for (const file of fileManifest) {

                    const importName: string = SanitizeFileUrl(compiledSections[i]);

                    if (file.indexOf(importName) == 0) {

                        sectionMap.set(file, compiledSections[i + 1]);
                        break;

                    }

                }

            } */

            let output: string = "";

            /*
             *  tranform the header
             */
            let header: string = `// (Forge) Header\n\n${headerSection}`;
            for (const plugin of plugins) header = await plugin.$header(header);
            output += header;

            /*
             *  Transform each section
             */
            for (const nodeData of dependencyHelper) {

                const file: string = nodeData.title;
                let section: string = `// (Forge) ${file}\n${sectionMap.get(file)}`;

                for (const plugin of plugins) section = await plugin.$section(section, file);

                output += section; // `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;
                
            }

            /*
             *  Tranform the footer
             */
            let footer: string = "// (Forge) Footer\n\n";
            for (const plugin of plugins) footer = await plugin.$footer(footer);
            output += footer;


            return output;

        })
        .catch(async function (error: unknown) {

            if (plugins.length === 0) return code;

            const compiledSections: string[] = code.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
            const headerSection: string = compiledSections[0];


            let output: string = "";

            /*
             *  tranform the header
             */
            let header: string = `// (Forge) Header\n\n${headerSection}`;
            for (const plugin of plugins) header = await plugin.$header(header);
            output += header;

            /*
             *  Transform each section
             */
            for (let i = 1; i < compiledSections.length; i += 2) {

                const importName: string = SanitizeFileUrl(compiledSections[i]);
                let section: string = `// (Forge) ${importName}\n${compiledSections[i + 1]}`;

                for (const plugin of plugins) section = await plugin.$section(section, importName);

                output += section; // `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;

            }

            /*
             *  Tranform the footer
             */
            let footer: string = "// (Forge) Footer\n\n";
            for (const plugin of plugins) footer = await plugin.$footer(footer);
            output += footer;


            return output;

        })
        /* .then(async function () {

        }) */

}

async function $build(entryFile: string, outFile: string, options: BuildOptions): Promise<string> {

    const startTime: number = Date.now();

    const outFilePath = path.parse(outFile);

    const result: EsbuildResult = await esBuild({
        entryPoints: [entryFile],
        bundle: options.bundled,
        platform: options.platform,
        write: false, // dont produce a build file, but give me the build in as a result
        format: options.format,
        metafile: true,
        loader: { ".ts": "tsx", ".js": "jsx" },
        outdir: outFilePath.dir,

        treeShaking: options.treeShaking,
        // outfile: "./drew-tester.js",
        // sourcemap: "linked"
        // target: ["node18"],

        // plugins: [yourPlugin]
        external: ["esbuild", ...options.external]
    });

    const fileManifest: string[] = Object.keys(result.metafile.inputs);

    const buildManifest: BuildManifest = new BuildManifest(entryFile, result);

    console.log(...buildManifest); // ["_src_\ts\core\Core.ts"]);
    // process.exit(1);

    let code: string;
    for (const out of result.outputFiles) {

        code = out.text;
        break;

    }

    await $SaveMetaFile(entryFile, outFile, fileManifest, options.metafile)


    code = await $SortDependencies(code, entryFile, fileManifest.filter(FilterNodeModules), options.plugins);

    /*
    *  
    */
    if (outFile !== undefined) await $fs.writeFile(outFile, code);


    console.parse(`<green>Build Successful : from "<yellow>${entryFile}</yellow>" to "<yellow>${outFile}</yellow>" <cyan>(${((Date.now() - startTime) / 1000).toFixed(3)}s)</green>
\t* ${(options.bundled) ? "<cyan>bundled</cyan>" : "<blue>unbundled</blue>"} : ${options.bundled}
\t* <cyan>format</cyan> : ${options.format}
\t* <cyan>platform</cyan> : ${options.platform}
\t* <cyan>tree shaking</cyan> : ${options.treeShaking || false}`);

    return code;

}

async function $watch(key: string, data: Record<string, unknown>): Promise<void> {

    const forgeClient = new class extends ForgeClient {

        public async $watch(data: Serialize, race?: number): Promise<Serialize> {

            // console.parse(">>>>>>>(watch)<<<<<<\n", data);

            if (("in" in data) === false) throw `"in" property missing`;
            if (("out" in data) === false) throw `"out" property missing`;
            if (("format" in data) === false) throw `"format" property missing`;
            if (("platform" in data) === false) throw `"platform" property missing`;

            const inFile: string = data.in as string;
            const outFile: string = data.out as string;

            await $build(inFile, outFile, { ...data, external : data.external || [] } as BuildOptions); // { bundled: data.bundled, format: data.format, data.platform, metafile: writeMeta, treeShaking: false, write: true, external: externals });

            return { build: true };

        }

    } (key, data);

}

DebugFormatter.Init({ platform: "node", default: { foreground: "", background: "" }});

(async function () {
    /*
    *
    * 1. Parse the parameters from the CLI (command line)
    *
    */
    const cliArguments = new CLIArguments();
    cliArguments
        .add("in", {
            // required: true,
            validate: (value: unknown, args: Record<string, unknown>) => {

                return Object.hasOwn(args, "in");

            },
            error: `\u001b[31;1mMissing or incorrect \u001b[36;1m--in--\u001b[0m\u001b[31;1m argument\u001b[0m`
        })
        .add("out", {
            // required: true,
            validate: (value: unknown, args: Record<string, unknown>) => {

                return Object.hasOwn(args, "out");

            },
            error: `\u001b[31;1mMissing or incorrect \u001b[36;1m--out--\u001b[0m\u001b[31;1m argument\u001b[0m`
        }).
        add("format", {
            default: "cjs"
        })
        .add("bundled", {
            default: false
        })
        .add("platform", {
            default: "neutral",
            validate: (value: unknown, args: Record<string, unknown>) => {

                switch (value as unknown as string) {
                    case "node":
                    case "neutral":
                    case "browser":
                        return true;

                }

                return false;
                // return `\u001b[31;1m(Aborting) To prevent accidentally overwritting compile target \u001b[36;1m--out--\u001b[0m. \u001b[31;1mPlease add \u001b[36;1m--override\u001b[0m \u001b[31;1margument\u001b[0m\n`;

            }
        })
        .add("override", {
            default: false,
            sanitize: (value: unknown, args: Record<string, unknown>) => {

                if (args.override) return true;

                if (fs.existsSync(args.out) === false) return `\u001b[31;1m(Aborting) To prevent accidentally overwritting compile target \u001b[36;1m--out--\u001b[0m. \u001b[31;1mPlease add \u001b[36;1m--override\u001b[0m \u001b[31;1margument\u001b[0m\n`;

                return true;

            }
        })
        .add("write_meta", {
            default: false
        })
        .add("watch", {
            default: false
        })
        .add("plugins", {
            default: [],
            sanitize: (value: unknown, args: Record<string, unknown>) => {

                if (args.plugins === undefined) return [];

                const plugins: IForgeBuildPlugin[] = []; 

                const sources: string[] = (args.plugins as string).split(",");
                for (const source of sources) {

                    plugins.push(new ForgeBuildPlugin(source));

                }

                return plugins;

            },
        })
        .add("external", {
            default: [],
            sanitize: (value: unknown, args: Record<string, unknown>) => {

                if (value === undefined) return value;
                if (value instanceof Array) return value;

                return String(value).split(/,/g);

            },
        });


    try {

        cliArguments.compile();

    } catch (error: unknown) {

    }
        


    /*
    *
    * 2. extract the relevant CLI values (command line)
    *
    */
    const entryFile: string = cliArguments.get("in") as string; // entry file location
    const outFile: string = cliArguments.get("out") as string; // build location
    const override: boolean = cliArguments.get("override") as boolean; // prevent overwriting build location in case of accident
    const format: Format = cliArguments.get("format") as Format; // esbuild format ( "cjs" | "esm" | "iife" )
    const bundled: boolean = cliArguments.get("bundled") as boolean; // bundle into one build file or leave as imports, basically do nothing
    const platform: Platform = cliArguments.get("platform") as Platform; // esbuild format ( "node" | "neutral" | "broswer" )
    const writeMeta: boolean = cliArguments.get("write_meta") as boolean; // write the metadata for further inquiries / errors checking
    const externals: string[] = cliArguments.get("external") as string[];

    const watch: boolean = cliArguments.get("watch") as boolean;
    const fork: boolean = cliArguments.get("fork") as boolean;
    const run: boolean = cliArguments.get("run") as boolean;
    // const worker: boolean = cliArguments.get("worker") as boolean; 
    const plugins: IForgeBuildPlugin[] = cliArguments.get(/plugins/i) as IForgeBuildPlugin[];

    /* console.log(plugins);
    for (const plugin of plugins) {

        await plugin.$start([""]);

        console.log(await plugin.$header(""));
        console.log(await plugin.$section(""));
        console.log(await plugin.$footer(""));

        console.log(await plugin.$complete(""));

    }
    console.log(plugins);
    process.exit(); */

    // parse the folder and filename from the --out-- CLI arguments
    // const outFilePath = path.parse(outFile);

    /*
    *
    * ! 3. build this bad boy! THe Star of the show
    *
    */
    if (watch) {

        $watch(cliArguments.get("key") as string, cliArguments.get(/data/i) as Record<string, unknown>,);
        return 0;

    } else {

        const code: string = await $build(entryFile, outFile, { bundled, format, platform, metafile: writeMeta, treeShaking: false, write: true, external: externals, run, plugins });

        if (run) {

            /*
             *  Spawn a node instance ( fresh Node enviroment ) and eval the code. No need to create a temp file, but unlimted messaging size
             */
            const child = spawn("node", ["-e", `
                // process.stdin.setEncoding("utf-8");
                process.stdin.on("data", (data) => { eval(String(data))});` ], { stdio: ['pipe', 'inherit', 'inherit'] }); 

            child.stdin.write(code);

        }

        console.parse(`\t<green>* <cyan>run</cyan> : ${run || false}`);

    }

}());