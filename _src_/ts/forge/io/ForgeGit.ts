const { spawn, fork, exec, execSync } = require("child_process");

class ForgeGit {

    public static async $IsWorkingTree(): Promise<boolean> {

        const stdio: string = execSync("git rev-parse --is-inside-work-tree").toString();

        if (stdio == "true") return true;

    }

    public static async $Clone(url: string): Promise<boolean> {

        return new Promise(function (resolve: Function, reject: Function) {

            execSync(`git clone ${url}`, (error, stdout, stderr) => { // --branch ${branch} --single-branch

                if (error) {

                    // `execution error (${error})`
                    console.log(`git clone ${url} failed`);
                    reject({ "reject": `git clone ${url} failed` });
                    
                } else {

                    console.log(`git clone ${url} successful`);
                    resolve({ "resolve": `git clone ${url} successful` });

                }

            });

        });

    }

    public static async $Submodule(url: string, target: string): Promise<boolean> {

        return new Promise(function (resolve: Function, reject: Function) {

            execSync(`git submodule add ${url} ${target}`, (error, stdout, stderr) => { // --branch ${branch} --single-branch

                if (error) {

                    reject({ "reject": `execution error (${error})` });
                    console.log(`git submodule add ${url} failed`);

                } else {

                    console.log(`git submodule add ${url} successful`);
                    resolve({ "resolve": `git submodule add ${url} successful` });

                }

            });

        });

    }

    public static async $Place(url: string, target: string): Promise<boolean> {

        // Is the the CWD current within a git working tree?
        if (ForgeGit.$IsWorkingTree()) {

            // add as a submodule
            return await ForgeGit.$Submodule(url, target);

        } else {

            // add as a cloned repo
            return await ForgeGit.$Clone(url);

        }

    }

}