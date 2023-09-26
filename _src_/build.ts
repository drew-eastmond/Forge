/*
*
* imports
*
*/
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as $fs from "node:fs/promises";
import path from "path";

import { CLIArguments } from "./args/Argument";
import { $UsePromise } from "./core/Core";
import { DependencyHelper } from "./core/DependencyHElper";
// regular imports

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
const startTime: number = Date.now();

/*
*
*  types
*
*/
type EsbuildResult = {
    outputFiles: { text: string }[],
    metafile: {
        inputs: unknown
    }
}

/*
*
* 1. Parse the parameters from the CLI (command line)
*
*/
const cliArguments = new CLIArguments();
cliArguments
    .add("in", {
        "required": true,
        "validator": (args) => { return Object.hasOwn(args, "in") },
        "error": `\u001b[31;1mMissing or incorrect \u001b[36;1m--in--\u001b[0m\u001b[31;1m argument\u001b[0m`
    })
    .add("out", {
        "required": true,
        "validator": (args) => { return Object.hasOwn(args, "out") },
        "error": `\u001b[31;1mMissing or incorrect \u001b[36;1m--out--\u001b[0m\u001b[31;1m argument\u001b[0m`
    }).
    add("format", {
        "default": "cjs"
    })
    .add("bundled", {
        "default": false
    })
    .add("platform", {
        "default": "neutral"
    })
    .add("override", {
        "default": false,
        "validator": (args) => {
            if (args.override) return true;

            if (fs.existsSync(args.out) === false) return `\u001b[31;1m(Aborting) To prevent accidentally overwritting compile target \u001b[36;1m--out--\u001b[0m. \u001b[31;1mPlease add \u001b[36;1m--override\u001b[0m \u001b[31;1margument\u001b[0m\n`;

            return true;

        },
    })
    .add("write_meta", {
        "default": false
    })
    .compile(process.argv);


/*
*
* 2. extract the relevant CLI values (command line)
*
*/
const entryFile: string = cliArguments.get("in") as string; // entry file location
const outFile: string = cliArguments.get("out") as string; // build location
const override: boolean = cliArguments.get("override") as boolean; // prevent overwriting build location in case of accident
const format: string = cliArguments.get("format") as string; // esbuild format ( "cjs" | "esm" | "iife" )
const bundled: boolean = cliArguments.get("bundled") as boolean; // bundle into one build file or leave as imports, basically do nothing
const platform: string = cliArguments.get("platform") as string; // esbuild format ( "node" | "neutral" | "broswer" )
const writeMeta: boolean = cliArguments.get("write_meta") as boolean; // write the metadata for further inquiries / errors checking

// parse the folder and filename from the --out-- CLI arguments
const outFilePath = path.parse(outFile);


/*
*
* 3. build this bad boy
*
*/
const result: EsbuildResult = await esbuild.build({
    entryPoints: [entryFile],
    bundle: bundled,
    platform: platform,
    write: false, // dont produce a build file, but give me the build in as a result
    format: format,
    metafile: true,
    loader: { '.ts': 'tsx', '.js': 'jsx' },
    outdir: outFilePath.dir,
    // plugins: [yourPlugin]
});

const fileManifest: string[] = Object.keys(result.metafile.inputs);

let code: string;
for (const out of result.outputFiles) {

    code = out.text;
    break;

}


await $SaveMetaFile(fileManifest, writeMeta);

code = await $SortDependencies(code, entryFile, fileManifest.filter(function (value) {

    return /node_modules/.test(value) === false;

}));

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

async function $SaveMetaFile(fileManifest: string[], writeMeta: boolean) {

    if (writeMeta === true) {

        fs.writeFileSync(outFilePath.dir + "/" + outFilePath.name + ".meta", JSON.stringify(result.metafile));

    }

    await fetch(`${API_BASE}/storage/save/${entryFile}/metadata`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fileManifest),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response: Response) {

            console.log("\n!!!meta file savedddd\n", response.code);

        })
        .catch(function (error: unknown) {

            console.log(error);

        });


}

async function $SortDependencies(code: string, storeKey: string, fileManifest: string[]): Promise<string> {

    // now extract any modified dependencies
    return await fetch(`${API_BASE}/storage/load/${storeKey}/dependencies`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response: Response) {

            let dependencyHelper: DependencyHelper;

            const contentType: string = response.headers.get("Content-Type");
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
            const fileObj = {};
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
                output += segmentMap.get(file); // `// ${file}\nForgeAnalytics.Analytics().Segments().Next("${file}");\n` + fileObj[file] + `\n\n`;

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