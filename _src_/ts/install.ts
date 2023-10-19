const $fs = require("node:fs/promises");
const { spawn, fork, exec, execSync } = require("child_process");
const path = require("path");

// insta
async function $LoadPackageFile(file) {

    const packageData = JSON.parse(await $fs.readFile(file, "utf-8"));

    console.log(packageData);

    if ("dependencies" in packageData) {

        const entries = Object.entries(packageData["dependencies"]);
        for (const [package, version] of entries) {

            InstallPackage(package, version);

        }

    }

    if ("devDependencies" in packageData) {

        const entries = Object.entries(packageData["devDependencies"]);
        for (const [package, version] of entries) {

            InstallPackage(package, version);

        }

    }

}

function InstallPackage(command, version) {

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

        const currentPath = path.parse(__filename);

        await $LoadPackageFile(path.resolve(currentPath.dir, "package.json"))
            .catch((error) => {

                console.log(error, "read file failed");

            });

        await $fs.readFile("./.forge")
            .then((fileData) => {

                console.parse("<green>forge already installed");

            })
            .catch(() => {

                $fs.writeFile("./.forge", "testing");

            });

    }());

}