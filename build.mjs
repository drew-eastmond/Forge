import * as esbuild from "esbuild";
import * as $fs from 'node:fs/promises';
import * as fs from "fs";
import path from "path";
// import { exec } from "node:child_process";
// import vm from 'node:vm';

const startTime = Date.now();
const Loaded = $Promise();

// /:task/:action/storage/save/:key
const API_BASE = "http://localhost:1234/esbuild/typescript";
const REQUEST_TIMEOUT = 125;

function SanitizeFileUrl(...rest) {

    let resolvedUrl = path.resolve(...rest);

    resolvedUrl = (/\.\w+$/.test(resolvedUrl)) ? resolvedUrl : resolvedUrl + ".ts"

    return resolvedUrl.replace(/[\\\/]+/g, "/");

}

async function SortDependencies(code, storeKey, fileManifest) {

    // now extract any modified dependencies
    return await fetch(`${API_BASE}/storage/load/${storeKey}/dependencies`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
        .then(async function (response) {

            let dependencyHelper;

            const contentType = response.headers.get("Content-Type");
            switch (contentType) {

                case "application/json":

                    dependencyHelper = new DependencyHelper(await response.json());
                    dependencyHelper.intersect(fileManifest);
                    break;

                default:
                    throw new Error(`error fetching dependencies for "${storeKey}"`);

            }

            // split the compiled code into segments using 
            const compiledSegments = code.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
            const header = compiledSegments[0];

            const segmentMap = new Map();
            for (let i = 1; i < compiledSegments.length; i += 2) {

                for (const file of fileManifest) {

                    const importName = SanitizeFileUrl(compiledSegments[i]);

                    if (file.indexOf(importName) == 0) {

                        segmentMap.set(file, compiledSegments[i + 1]);
                        break;

                    }

                }

            }

            let output = header;
            for (const nodeData of dependencyHelper) {

                const file = nodeData.title;

                if (segmentMap.has(file) === false) {

                    console.log(segmentMap.keys())

                }

                
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
        .catch(function (error) {

            // no storeKey, no need to change any of the code
            console.log(error);
            return code;

        });

}
function $Promise(key) {

    let resolver, rejector;

    const $promise = new Promise(function (resolve, reject) {

        resolver = resolve;
        rejector = reject;

    });

    return [$promise, { resolve: resolver, reject: rejector }];

}

function CLIArguments() {

    const _this = this;

    const _args = {};
    const _validationMap = new Map();

    _this.get = function (key) {

        return (key === undefined) ? _args : _args[key];

    };
    _this.add = function (key, config) {

        _validationMap.set(key, {
            default: config.default,
            validator: config.validator,
            required: config.required || false,
            error: config.error
        });

        return this;

    }

    _this.compile = function (args) {

        for (let i = 2; i < args.length; i) {

            // validate if the arguments match the formattung for parsing keys
            const keyQuery = args[i++];

            // --{key}-- parses into a key:value pair
            if (/--(.+?)--/.test(keyQuery)) {

                const results = /--(.+?)--/.exec(keyQuery);
                _args[results[1]] = args[i++];

                // --{key} parses into a key:true flag with a default value of true
            } else if (/--(.+?)$/.test(keyQuery)) {

                const results = /--(.+?)$/.exec(keyQuery);
                _args[results[1]] = true;

                // no formatting found, abort!!! This is a simple script
            } else {

                // give a meanful error and exit
                console.error(`(Executing) node ${args.slice(1).join(" ")}

\u001b[31;1mIncorrect formatting encountered parsing key arguments : "\u001b[34;1m${keyQuery}\u001b[31;1m"\u001b[0m
${JSON.stringify(_args, undefined, 2)}`);

                process.exit(1);

            }

        }

        const errors = [];

        for (const [key, validation] of _validationMap) {

            // assign all default values
            if (validation.default !== undefined) _args[key] = (_args[key] === undefined) ? validation.default : _args[key];

            // now validate each entry added
            if (validation.required && (key in _args) === false) {

                errors.push(validation.error || `\u001b[31; 1mMissing or incorrect \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`);

            } else if (validation.validator) {

                if (validation.validator(_args) === false) {

                    errors.push(validation.error || `\u001b[31; 1mValidation Failed for \u001b[36; 1m--${key}--\u001b[0m\u001b[31; 1m argument\u001b[0m)`);

                }

            }

        }

        if (errors.length) {

            console.log(errors);

            throw "Errors";

        }


        console.log(_args);

    }

}



class DependencyHelper {

    _dependencies;
    _count = 0;

    constructor(dependencies) {

        this._dependencies = dependencies;
        for (const nodeData of this) {

            nodeData.id = String(this._count++);

        }

    }

    *[Symbol.iterator]() {

        for (const nodeData of this._dependencies) {

            yield nodeData;

            for (const childData of nodeData.children) {

                yield childData;

            }

        }

    }

    _has(file) {

        for (const nodeData of this._dependencies) {

            if (nodeData.title == file) return true;

            for (const childData of nodeData.children) {

                if (childData.title == file) return true;

            }

        }

        return false;

    }

    _indexOf(file) {

        for (let i = 0; i < this._dependencies.length; i++) {

            const nodeData = this._dependencies[i];
            if (nodeData.title == file) return i;

            // now check the children for a dependency match
            for (const childData of nodeData.children) {

                if (childData.title == file) return i;

            }

        }

        return -1;

    }

    _spliceDependency(file, inputs) {

        const inputIndex = inputs.indexOf(file);
        const startIndex = Math.max(inputIndex - 1, 0);


        for (let i = startIndex; i > -1; i--) {

            const queryFile = inputs[i];
            const queryIndex = this._indexOf(queryFile);

            if (queryIndex > -1) {

                this._dependencies.splice(queryIndex + 1, 0, { id: String(this._count++), title: file, children: [] });
                return;

            }

        }

        const insertIndex = this._dependencies.length - 1;
        this._dependencies.splice(insertIndex, 0, { id: String(this._count++), title: file, children: [] });

    }

    intersect(inputs) {

        // 1. first prune any files from the dependencies that no longer exist
        let hasRemoval = true;
        whileRemoval: while (hasRemoval) {

            hasRemoval = false;

            for (const nodeData of this._dependencies) {

                const children = nodeData.children;
                for (let i = 0; i < children.length; i++) {

                    const childData = children[i];
                    const childTitle = childData.title;

                    if (inputs.indexOf(childTitle) == -1) {

                        // a. this entry no loner is in the import chain, so remove it
                        children.splice(i, 1);

                        // b. reset the `hasRemoval` flag
                        hasRemoval = true;

                        // c. contine the `whileRemoval`. ( Well no shit!!! )
                        continue whileRemoval;

                    }

                }

            }

        }

        // 2. now add imports that we're not part . This is a new file recent;y added since it was sorted
        for (const file of inputs) {

            if (this._has(file) === false) this._spliceDependency(file, inputs);

        }

        return this._dependencies;

    }

    remove(file) {

        for (let i = 0; i < this._dependencies.length; i++) {

            const nodeData = this._dependencies[i];

            if (nodeData.title == file) {

                this._dependencies.splice(i, 1, ...nodeData.children);
                return;

            }

            for (const childData of nodeData.children) {

                if (childData.title == file) {

                    nodeData.children.splice(i, 1, ...nodeData.children);
                    return;

                }

            }

        }

    }

}






/*
*
* Parse the parameters from the CLI (command line)
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

            //console.error(

        },
    })
    .add("metafile", {
        "default": false
    })
    .compile(process.argv);

const entryFile = cliArguments.get("in");
const outFile = cliArguments.get("out");

const override = cliArguments.get("override");
const format = cliArguments.get("format");
const bundled = cliArguments.get("bundled");
const dependencyPromotions = cliArguments.get("promotions");

const platform = cliArguments.get("platform");

const metaFile = cliArguments.get("meta");

const outFilePath = path.parse(outFile);

const yourPlugin = {
    name: 'your-plugin',
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {

            let css = String(await $fs.readFile(args.path));
            // css = await esbuild.transform(css, { loader: 'css', minify: true })

            const output = `
            /* Inline CSS ( ${path} ) */
            document.head.insertAdjacentHTML("beforeend", "<style>${css}</style>");
            `;

            return { contents: "/* -------------- */" }
        })
    },
}

const result = await esbuild.build({
    entryPoints: [entryFile],
    bundle: bundled,
    platform: platform, // "browser" | "neutral" | "node",
    write: false,
    format: format,
    metafile: true,
    loader: { '.ts': 'tsx', '.js': 'jsx' },
    outdir: outFilePath.dir,
    plugins: [yourPlugin]
});

// console.log(result);

const inputManifest = Object.keys(result.metafile.inputs);

let code;
for (const out of result.outputFiles) {

    code = out.text;
    break;

}

// /:task/:action/storage/save/:key
await fetch(`${API_BASE}/storage/save/${entryFile}/metadata`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(inputManifest),
    signal: AbortSignal.timeout(125)
})
    .then(async function (response) {

        console.log("\n!!!meta file savedddd\n", response.code);

        // now extract any modified dependencies
        await fetch(`${API_BASE}/storage/load/${entryFile}/dependencies`)
            .then(function (response) {

                // flatten then entries then intersect each entry. We may have added to removed files.
                // The dependencies are a conveient way to help reorder the imported files


            });

    })
    .catch(function (error) {

        console.log(error);

    })

code = await SortDependencies(code, entryFile, inputManifest);
await $fs.writeFile(outFile, code);

if (metaFile === true) {

    await $fs.writeFile(outFilePath.dir + "/" + outFilePath.name + ".meta", JSON.stringify(result.metafile));

}


console.log(`\u001b[32;1mBuild Successful (${((Date.now() - startTime) / 1000).toFixed(3)}s)\u001b[0m
\t* ${(bundled) ? "bundled" : "unbundled"} : ${bundled}\n
\t* format : ${format}\n
\t* promotions : "${dependencyPromotions}"
`);
