const $fs = require("node:fs/promises");
const { spawn, fork, exec, execSync } = require("child_process");
const path = require("path");

import { CLIArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";

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
async function $LoadPackageFile(file: string): Promise<void> {

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

                InstallPackage(packageName, version);

            }

        }

    }

    console.parse(`already installed: <yellow>${alreadyInstalledPackages.join(", ")}`);

}

function InstallPackage(command: string, version: string): void {

    execSync(`pnpm install ${command}`, { stdio: "inherit" });

}

function gitClone(url: string) {

    execSync(`git clone ${url} --branch ${branch} --single-branch`, (error, stdout, stderr) => {

        if (error) {

            // reject({ "reject": `execution error (${error})` });

        } else {

            // resolve({ "resolve": "successfully executed" });

        }

    });
}


if (require.main === module) {

    (async function () {

        const cliArguments: CLIArguments = new CLIArguments();
        cliArguments
            .add("PORT", {
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
            .add("I", {
                default: false,
                validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

                    // return ($fs.existsSync(value));
                    return true;

                }
            })
            .compile();


        const currentPath = path.parse(__filename);
        console.log(currentPath);

        const INIT: boolean = (cliArguments.get("INIT") || cliArguments.get("I")) as boolean;

        await $LoadPackageFile(path.resolve(currentPath.dir, "package.json"))
            .catch((error) => {

                console.log(error, "read file failed");

            });



        if (INIT) {

            await $fs.readFile("./.forge", "utf-8")
                .then((fileData: string) => {

                    console.parse("<red>'.forge'</forge> already installed");

                })
                .catch(async (error: unknown) => {

                    console.log(error);

                    $fs.writeFile("./.forge", JSON.stringify(forgeTpl));

                });

        }

        

    }());

}