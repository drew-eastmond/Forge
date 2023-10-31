const $fs = require("node:fs/promises");
const { spawn, fork, exec, execSync } = require("child_process");
const path = require("path");
const fflate = require("fflate");

import { CLIArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { ForgeIO } from "./forge/ForgeIO";

DebugFormatter.Init({ platform: "node" });

const forgeTpl: Record<string, unknown> = {
    forge: {
        port: 1234,
        www: false,
        watch: [],
    },
    variables: {},
    services: {
        spawn: {},
        fork: {},
        exec: {},
        plugin: {}
    },
    tasks: []
};

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
async function $LoadPackageFile(file: string): Promise<boolean> {

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

                    InstallPackage(packageName, version);

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

                    InstallPackage(`${packageName} --save-dev`, version);

                }

            }

        }

        console.parse(`already installed: <yellow>${alreadyInstalledPackages.join(", ")}`);

        return true;

    } catch (error: unknown) {

        return false;

    }

}

function InstallPackage(command: string, version?: string): void {

    execSync(`pnpm install ${command}`, { stdio: "inherit" });

}

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

    (async function () {

        const cliArguments: CLIArguments = new CLIArguments();
        cliArguments
            .add(/port/i, {
                // required: true,
                default: 1234,
                sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

                    return parseInt(value as string);

                }
            })
            .add(/init/i, {
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    console.log("init is good", value);
                    //return ($fs.existsSync(value));
                    return true;

                },
                sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

                    return String(value).toUpperCase();

                }
            })
            .add(/i/i, {
                default: false,
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    // return ($fs.existsSync(value));
                    return true;

                }
            })
            .compile();


        const currentPath = path.parse(__filename);
        const currentDirecctory: string = currentPath.dir;

        const INIT: boolean = (cliArguments.get(/init/i) || cliArguments.get("I")) as boolean;
        const FLATTEN: boolean = (cliArguments.get(/init/i) || cliArguments.get("I")) as boolean;

        if (await ForgeIO.$DirectoryExists("./Forge/") === false) {

            // ok! we need to clone a git repo
            if (await ForgeIO.$DirectoryExists("./Forge/.git/") === false) {


                // throw new Error(`Forge folder exists or it is not the correct repo`);

                await $GitClone("https://github.com/drew-eastmond/Forge.git");

            }

        }

        await $LoadPackageFile(path.resolve(currentDirecctory, "package.json"))
            .catch((error) => {

                console.log(error, "read file failed");

            });



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

        if (cliArguments.get(/typescript/i)) {

            await ForgeIO.$MakeDirectory("./Forge/typescript/");

            // InstallPackage("esbuild");
            if (await ForgeIO.$Download("https://github.com/drew-eastmond/forge-typescript/archive/refs/heads/main.zip", "./Forge/typescript/test.zip")) {

                console.log("goood");

            }

            const fileData: Uint8Array = new Uint8Array((await $fs.readFile("./Forge/typescript/test.zip")));
            if (await ForgeIO.$UnZip(fileData, "./Forge/typescript/")) {

                console.log("unzipped");

                // install packages
                await $LoadPackageFile("./Forge/typescript/package.json");

            }



        }

        if (cliArguments.get(/sass/i)) {

            await ForgeIO.$MakeDirectory("./Forge/sass/");

        }

        if (cliArguments.get(/tailwindcss/i)) {

            InstallPackage("tailwindcss");
            execSync("npx tailwindcss init");

            $fs.writeFile(path.resolve(currentPath, ".forge"), JSON.stringify(forgeTpl));

        }

        if (cliArguments.get(/twig/i)) {

            InstallPackage("twig");

        }

    }());

}