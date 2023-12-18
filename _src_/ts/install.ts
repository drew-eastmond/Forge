#!/usr/bin/env node

const $fs = require("node:fs/promises");
const { spawn, fork, exec, execSync } = require("child_process");
const path = require("path");
const fflate = require("fflate");

import { CLIArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { ForgeIO } from "./forge/io/ForgeIO";

DebugFormatter.Init({ platform: "node" });

enum PackageManagerOptions {
    NPM = "npm",
    PNPM = "pnpm",
    YARN = "yarn"
}

class PackageManager {

    private _type: PackageManagerOptions;

    constructor(type: PackageManagerOptions) {

        this._type = type;

    }

    public $list(): Promise<string> {

        const type: string = this._type;
        return new Promise(function (resolve: Function, reject: Function) {

            let stdio: string;
            switch (type) {
                case PackageManagerOptions.NPM:
                    execSync("npm list").toString();
                    break;
                case PackageManagerOptions.PNPM:
                    execSync("pnpm list").toString();
                    break;
                case PackageManagerOptions.YARN:
                    execSync("yarn list").toString();
                    break;
            }
            
            const lines: string[] = stdio.split(/\n/g);

            // const regExp: RegExp = /(.+?)(\s(\d+\.\d+\.\d+)$)/gi;


            const dependencies: Record<string, string> = {};
            for (const line of lines) {

                let matched: boolean = false;

                const tokens: string[] = line.split(/\s+/g);
                for (const token of tokens) {

                    if (/\d+\.\d+\.\d+/.test(token)) matched = true;

                }

                if (matched) dependencies[tokens[0]] = tokens[tokens.length - 1];

            }

            resolve(dependencies);

        });

    }

    public $install(name: string): Promise<boolean> {

        switch (this._type) {
            case PackageManagerOptions.NPM:
                execSync(`npm install ${name}`, { stdio: "inherit" });
                break;
            case PackageManagerOptions.PNPM:
                execSync(`pnpm install ${name}`, { stdio: "inherit" });
                break;
            case PackageManagerOptions.YARN:
                execSync(`yarn install ${name}`, { stdio: "inherit" });
                break;
        }

    }

    public $add(name: PackageManagerOptions): Promise<boolean> {



    }

    public async $load(file: string): Promise<boolean> {

        try {

            const installedPackages: Record<string, string> = await $installedPackages();

            const packageData: Record<string, unknown> = JSON.parse(await $fs.readFile(file, "utf-8"));

            // console.log(packageData);

            const alreadyInstalledPackages: string[] = [];

            if ("dependencies" in packageData) {

                const entries: [string, string][] = Object.entries(packageData["dependencies"]);
                for (const [packageName, version] of entries) {

                    if (packageName in installedPackages) {

                        alreadyInstalledPackages.push(packageName);

                    } else {

                        await this.$install(packageName, version);

                    }



                }

            }

            if ("devDependencies" in packageData) {

                const entries: [string, string][] = Object.entries(packageData["devDependencies"]);
                for (const [packageName, version] of entries) {

                    // InstallPackage(package, version);
                    if (packageName in installedPackages) {

                        alreadyInstalledPackages.push(packageName);

                    } else {

                        await this.$install(`${packageName} --save-dev`, version);

                    }

                }

            }

            console.parse(`already installed: <yellow>${alreadyInstalledPackages.join(", ")}`);

            return true;

        } catch (error: unknown) {

            return false;

        }

    }

}

const forgeTpl: Record<string, unknown> = {
    forge: {
        port: 1234,
        www: false,
        watch: [],
    },
    variables: {},
    services: {
        spawn: {},
        worker: {},
        fork: {},
        exec: {},
        plugin: {}
    },
    tasks: []
};


async function $InstallModule(target: string, repo: String, flatten: boolean): Promise<boolean> {

    const moduleName: string = target.split("/").pop();

    console.parse(`<yellow>Installing: <cyan>${moduleName}`);

    const now: number = Date.now();

    if (await ForgeIO.$DirectoryExists(target) === true) {

        console.parse(`<red>${target} already exists`);
        return false;

    }

    return true;

    if (flatten === true) {

        

    } else {

        await ForgeIO.$MakeDirectory("./Forge/typescript/");

        await fetch("https://github.com/drew-eastmond/forge-typescript/archive/refs/heads/main.zip")
            .then((response) => {

                if (!response.ok) {
                    throw new Error(`HTTP error, status = ${response.status}`);
                }

                return response.arrayBuffer();

            })
            .then(async function (arraybuffer: ArrayBuffer) {

                const fileData: Uint8Array = new Uint8Array(arraybuffer); //  (await $fs.readFile("./Forge/typescript/test.zip")));
                if (await ForgeIO.$UnZip(fileData, "./Forge/typescript/")) {

                    // install packages
                    await $LoadPackageFile("./Forge/typescript/package.json");

                }

            });


    }

    console.parse(`<yellow>Installing: <cyan>typescript <yellow>complete`);

}

async function $installedPackages(): Promise<Record<string, string>> {

    return new Promise(function (resolve, reject) {

        const stdio = execSync("pnpm list").toString();
        const lines: string[] = stdio.split(/\n/g);

        // const regExp: RegExp = /(.+?)(\s(\d+\.\d+\.\d+)$)/gi;


        const dependencies: Record<string, string> = {};
        for (const line of lines) {

            let matched: boolean = false;

            const tokens: string[] = line.split(/\s+/g);
            for (const token of tokens) {

                if (/\d+\.\d+\.\d+/.test(token)) matched = true;

            }

            if (matched) dependencies[tokens[0]] = tokens[tokens.length - 1];

        }

        resolve(dependencies);

    });

}

// install


async function $GitClone(url: string, submodule?: { folder: string }): Promise<void> {

    if (submodule === undefined) {

        execSync(`git clone ${url}`, (error, stdout, stderr) => { // --branch ${branch} --single-branch

            if (error) {

                // reject({ "reject": `execution error (${error})` });
                console.log(`git clone ${url} failed`);

            } else {

                console.log(`git clone ${url} successful`);
                // resolve({ "resolve": "successfully executed" });

            }

        });

    } else {

        execSync(`git submodule add ${url} ${submodule.folder}`, (error, stdout, stderr) => { // --branch ${branch} --single-branch

            if (error) {

                // reject({ "reject": `execution error (${error})` });
                console.log(`git submodule add ${url} failed`);

            } else {

                console.log(`git submodule add ${url} successful`);
                // resolve({ "resolve": "successfully executed" });

            }

        });


    }

    
}

if (require.main === module) {

    // Need to 
    (async function () {

        const cliArguments: CLIArguments = new CLIArguments();
        cliArguments
            .add(/^port$/i, {
                // required: true,
                default: 1234,
                sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

                    return parseInt(value as string);

                }
            })
            .add(/^init$|^i$/i, {
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    console.log("init is good", value);
                    //return ($fs.existsSync(value));
                    return true;

                },
                sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

                    return String(value).toUpperCase();

                }
            })
            .add(/^flatten$|^git$|^submodule$/i, {
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    return (cliArguments.get(/flatten/i) === true || cliArguments.get(/^git$/i) === true || cliArguments.get(/^submodule$/i)) as boolean;

                }
            })
            .add(/^package/i, {
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    const valueStr: string = String(value).toLowerCase();
                    return (valueStr === "npm" || valueStr === "pnpm" || valueStr === "yarn") as boolean;

                }
            })
            .compile();

        /*
        * 1. Advanced Error checking including errors based on dependencies. Mid-Boss error checking... Abobo error checking (Your old if you know this one)
        */
        if (cliArguments.has(/^flatten$|^git$|^submodule$|/) === false) throw "Forge must be added as a git repo or flattened. Use --repo";
        if (cliArguments.has(/^package$/) === false) throw "Forge Modules needs a package manager. Use --package-- npm|pnpm|yarn";

        const currentPath = path.parse(__filename);
        const currentDirecctory: string = currentPath.dir;


        const INIT: boolean = (cliArguments.get(/init/i) || cliArguments.get(/i/i)) as boolean;
        const FLATTEN: boolean = (cliArguments.get(/^flatten$|^f$/i) === true || cliArguments.get(/^repo$|^r$/i) === false) as boolean || true;
        const PACKAGE_MANAGER: PackageManagerOptions = cliArguments.get(/^package$/i) as PackageManagerOptions;

        /*
         *
         * Install the Forge as a repo or flattened zip
         * 
         */
        if (await ForgeIO.$DirectoryExists("./Forge/") === false) {

            if (FLATTEN) {

                await ForgeIO.$MakeDirectory("./Forge/");

                await fetch("https://github.com/drew-eastmond/Forge/archive/refs/heads/main.zip")
                    .then(async function (response) {

                        if (!response.ok) {
                            throw new Error(`HTTP error, status = ${response.status}`);
                        }

                        const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
                        const fileData: Uint8Array = new Uint8Array(arrayBuffer); // (await $fs.readFile("./Forge/typescript/test.zip")));
                        if (await ForgeIO.$UnZip(fileData, "./Forge/")) {

                            // install packages
                            await $LoadPackageFile("./Forge/package.json");

                        }

                    })
                    .catch(function (error: unknown) {

                        throw "Can not find Forge repo '.zip'";

                    });


            } else {

                // ok! we need to clone a git repo
                if (await ForgeIO.$DirectoryExists("./Forge/.git/") === false) {


                    // throw new Error(`Forge folder exists or it is not the correct repo`);

                    await $GitClone("https://github.com/drew-eastmond/Forge.git");

                } else {

                    console.parse(`<cyan>./Forge <red>is already a git repo`);

                }

            }

            

        }

        const packageManager: PackageManager = new PackageManager(PACKAGE_MANAGER);
        await packageManager.$load(path.resolve(currentDirecctory, "package.json"))
            .catch((error) => {

                console.log(error, "read file failed");

            });

        /* await $LoadPackageFile(path.resolve(currentDirecctory, "package.json"), )
            .catch((error) => {

                console.log(error, "read file failed");

            }); */



        if (INIT) {

            await $fs.readFile("./.forge", "utf-8")
                .then((fileData: string) => {

                    console.parse("<red>'.forge'</red> already present");

                })
                .catch(async (error: unknown) => {

                    console.log(error);

                    await $fs.writeFile(path.resolve(currentDirecctory, ".forge"), JSON.stringify(forgeTpl));

                });

        }

        if (cliArguments.get(/$typescript/i)) {

            await $InstallModule("./Forge/typescript", "https://github.com/drew-eastmond/forge-typescript/archive/refs/heads/main.zip", FLATTEN);

        }

        if (cliArguments.get(/sass/i)) {

            await ForgeIO.$MakeDirectory("./Forge/sass/");

        }

        if (cliArguments.get(/tailwindcss/i)) {

            await $InstallModule("tailwindcss");
            execSync("npx tailwindcss init");

            $fs.writeFile(path.resolve(currentPath, ".forge"), JSON.stringify(forgeTpl));

        }

        if (cliArguments.get(/twig/i)) {

            $InstallModule("twig");

        }

    }());

}