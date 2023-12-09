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
import { DependencyHelper } from "./util/DependencyHelper";
import { CLIArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { ForgeClient } from "./forge/ForgeClient";
import { QuickHash, Serialize } from "./core/Core";

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
*  types / enums
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
    run: boolean
}

/*
*
* functions
*
*/
function SanitizeFileUrl(...rest: string[]) {

    let resolvedUrl: string = path.resolve(...rest);
    resolvedUrl = (/\.\w+$/.test(resolvedUrl)) ? resolvedUrl : resolvedUrl + ".ts";
    return resolvedUrl.replace(/[\\\/]+/g, "/");

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

            console.log(`\nmeta data for "${entryName}" stored\n`, "" + response);

        })
        .catch(function (error: unknown) {

            if (error instanceof Error) console.parse(`<red>${error.message}</red> from <cyan>${fetchURL}<cyan>`);

        });

}

async function $SortDependencies(code: string, storeKey: string, fileManifest: string[]): Promise<string> {

    // now extract any modified dependencies
    return await fetch(`${API_BASE}/storage/load/${storeKey}/dependencies`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response: Response) {

            let dependencyHelper: DependencyHelper;

            const contentType: string = response.headers.get("Content-Type") as string;
            switch (contentType) {

                case "application/json":

                    dependencyHelper = new DependencyHelper(await response.json());
                    dependencyHelper.intersect(fileManifest);
                    break;

                default:
                    throw new Error(`error fetching dependencies for "${storeKey}"`);

            }

            // split the compiled code into segments using 
            const compiledSegments: string[] = code.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
            const header: string = compiledSegments[0];

            const segmentMap: Map<string, string> = new Map();
            for (let i = 1; i < compiledSegments.length; i += 2) {

                for (const file of fileManifest) {

                    const importName = SanitizeFileUrl(compiledSegments[i]);

                    if (file.indexOf(importName) == 0) {

                        segmentMap.set(file, compiledSegments[i + 1]);
                        break;

                    }

                }

            }

            let output: string = header;
            for (const nodeData of dependencyHelper) {

                const file: string = nodeData.title;
                output += `// (Forge) ${file}\n` + segmentMap.get(file); // `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;

            }

            return output;

            // let output = JSON.stringify(Array.from(dependencyMap.entries())) + "\n";
            /*output += fs.readFileSync("./_src_/_templates_/header.js") + "\n\n" + header + "\n\n";
            for (const file of sortedManifest) {

                output += `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;

            }

            output += "\n" + fs.readFileSync("./_src_/_templates_/footer.js"); */

        })
        .catch(function (error: unknown) {

            // no storeKey, no need to change any of the code 
            return code;

        });


            // flatten then entries then intersect each entry. We may have added to removed files.
            // The dependencies are a conveient way to help reorder the imported files

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
        // outfile: outFile,
        // sourcemap: "linked"


        // plugins: [yourPlugin]
        external: ["esbuild", ...options.external]
    });

    const fileManifest: string[] = Object.keys(result.metafile.inputs);

    let code: string;
    for (const out of result.outputFiles) {

        code = out.text;
        break;

    }

    await $SaveMetaFile(entryFile, outFile, fileManifest, options.metafile)

    code = await $SortDependencies(code, entryFile, fileManifest.filter(function (value) {

        return /node_modules/.test(value) === false;

    }));

    if (outFile !== undefined) {

        await $fs.writeFile(outFile, code);

    }

    console.parse(`<green>Build Successful : from "<yellow>${entryFile}</yellow>" to "<yellow>${outFile}</yellow>" <cyan>(${((Date.now() - startTime) / 1000).toFixed(3)}s)</green>
\t* ${(options.bundled) ? "<cyan>bundled</cyan>" : "<blue>unbundled</blue>"} : ${options.bundled}
\t* <cyan>format</cyan> : ${options.format}
\t* <cyan>platform</cyan> : ${options.platform}
\t* <cyan>tree shaking</cyan> : ${options.treeShaking || false}
\t* <cyan>run</cyan> : ${options.run || false}
`);

    return code;

}

async function $watch(key: string, data: Record<string, unknown>): Promise<void> {

    const forgeClient = new class extends ForgeClient {

        public async $watch(data: Serialize, race?: number): Promise<Serialize> {

            console.parse(">>>>>>>(watch)<<<<<<\n", data);

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

    /* process.on("message", function (message: ) {

        const entryFile: string = cliArguments.get("in") as string; // entry file location
        const outFile: string = cliArguments.get("out") as string; // build location
        const override: boolean = cliArguments.get("override") as boolean; // prevent overwriting build location in case of accident
        const format: Format = cliArguments.get("format") as Format; // esbuild format ( "cjs" | "esm" | "iife" )
        const bundled: boolean = cliArguments.get("bundled") as boolean; // bundle into one build file or leave as imports, basically do nothing
        const platform: Platform = cliArguments.get("platform") as Platform; // esbuild format ( "node" | "neutral" | "broswer" )
        const writeMeta: boolean = cliArguments.get("write_meta") as boolean; // write the metadata for further inquiries / errors checking
        const watch: boolean = cliArguments.get("watch") as boolean;
        const externals: string[] = cliArguments.get("external") as string[];



    }); */

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

                console.log()

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



                // if (fs.existsSync(args.out) === false) return `\u001b[31;1m(Aborting) To prevent accidentally overwritting compile target \u001b[36;1m--out--\u001b[0m. \u001b[31;1mPlease add \u001b[36;1m--override\u001b[0m \u001b[31;1margument\u001b[0m\n`;

                return true;

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
    // const plugins: IForgePlugin = cliArguments.get(/plugins/i) as IForgePlugin;

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

        const code: string = await $build(entryFile, outFile, { bundled, format, platform, metafile: writeMeta, treeShaking: false, write: true, external: externals, run });

        if (run) {

            const tempFile: string = `./forge-temp-run.${Date.now()}.${QuickHash()}.js`;
            await $fs.writeFile(tempFile, code);

            process.on("exit", function () {

                console.parse(`\n<yellow>unlinking <cyan>${tempFile}`);
                fs.unlinkSync(tempFile);

            });

            process.on('SIGINT', function () {

                console.log("Caught interrupt signal");

                process.exit();

            });

            try {

                execSync(`node ${tempFile}`, {
                    stdio: "inherit",
                    cwd: process.cwd()
                });

            } catch (error: unknown) {



            }

            




            return;

            // const child = eval(code);
            // var script = new vm.Script(code);
            // script.runInThisContext(); //  ({ require, process, module });

            const cloneGlobal = () => Object.defineProperties(
                { ...global },
                Object.getOwnPropertyDescriptors(global)
            )

            const context = vm.createContext(cloneGlobal());

            const vmResult = vm.runInNewContext(code, context); //  { ...global, ...process, require, process, module, console });


        }

    }

}());