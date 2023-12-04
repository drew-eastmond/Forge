const $fs = require("node:fs/promises");
const fs = require("fs");
const path = require("path");
const { spawn, fork, exec, execSync } = require("child_process");

const { Readable } = require('stream');
const { finished } = require('stream/promises');

const fflate = require("fflate");

class ForgeFile {

    public static async $FileExist(file: string): Promise<boolean> {

        return $fs.access(file, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

    }

    public static async $DirectoryExists(path: string): Promise<boolean> {

        try {

            const stats = await $fs.stat(path);
            if (stats.isDirectory()) {

                // Directory exists
                return true;

            } else {

                // Path exists, but it is not a directory
                return false;

            }

        } catch (error: unknown) {

            // if (error.code === 'ENOENT') Directory does not exist. 
            // Otherwise there was an Error occurred while checking

            return false;

        }

    }

    public static async $MakeDirectory(path: string): Promise<boolean> {

        return $fs.mkdir(path, { recursive: true }).then(function () {

            console.log('Directory created successfully', path);
            return true;

        }).catch(function () {

            console.log('failed to create directory', path);
            return false;

        });

    }

    public static async $Read(path: string): Promise<Buffer> {

        return new Promise<Buffer>(async function (resolve: Function, reject: Function) {
            
            try {
                
                resolve(await $fs.readFile(path));

            } catch (error: unknown) {

                reject(new Error(`Error reading file: "${path}"`));

            } 

        });

    }

    public static async $Write(path: string, contents): Promise<boolean> {

        return new Promise<boolean>(async function (resolve: Function, reject: Function) {

            try {

                const data = new Uint8Array(Buffer.from('Hello Node.js'));
                await $fs.writeFile(path, data);

                resolve(true);

            } catch (error: unknown) {

                reject(new Error(`Error write file: "${path}"`));

            }

        });
        
    }

}



class ForgeNPM {

    private _packageManager:  "npm" | "yarn" | "pnpm";

    manager(packageManager: "npm" | "yarn" | "pnpm") {

        this._packageManager = packageManager;

    }

    public async $list(): Promise<Record<string, string>> {

        let stdio: string;
        switch (this._packageManager) {
            case "npm":
                stdio = execSync("npm list").toString();
                break;
            case "yarn":
                stdio = execSync("yarn list").toString();
                break;
            case "pnpm":
                stdio = execSync("pnpm list").toString();
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

        return dependencies;

    }

    public async $install(name: string): Promise<boolean> {

        
        switch (this._packageManager) {
            case "npm":
                execSync(`npm install ${name}`, { stdio: "inherit" });
                break;
            case "yarn":
                execSync(`yarn install ${name}`, { stdio: "inherit" });
                break;
            case "pnpm":
                execSync(`pnpm install ${name}`, { stdio: "inherit" });
                break;

        }

        return true;

    }

}

class ForgeWeb {

    public static $Fetch(url: string, options: Record<string, unknown>): Promise<Response> {

        if (options.race === undefined && options.signal === undefined) throw new Error(`please provide a { race } or { signal } property for $Fetch("{url}", ... )`);

        const race: number = options.race as number;

        return new Promise(function (resolve: Function, reject: Function) {

            fetch(url, {
                ...options,
                signal: options.signal as AbortSignal || AbortSignal.timeout(race)
            });

        });

    }

}

export class ForgeIO {

    public static readonly File = ForgeFile;

    public static readonly Web = ForgeWeb;

    public async $FileExist(file: string): Promise<boolean> {

        return $fs.access(file, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

    }

    public static async $DirectoryExists(path: string): Promise<boolean> {

        try {

            const stats = await $fs.stat(path);
            if (stats.isDirectory()) {
                
                // Directory exists
                return true;

            } else {

                // Path exists, but it is not a directory
                return false;

            }

        } catch (error: unknown) {

            // if (error.code === 'ENOENT') Directory does not exist. 
            // Otherwise there was an Error occurred while checking

            return false;

        }

    }

    public static async $MakeDirectory(path: string): Promise<boolean> {

        return $fs.mkdir(path, { recursive : true }).then(function () {

            console.log('Directory created successfully', path);
            return true;

        }).catch(function () {

            console.log('failed to create directory', path);
            return false;

        }); 

    }

    public static async $Download(url: string, file: string): Promise<boolean> {
    
        return await new Promise(async function (resolve : Function, reject: Function) {

            // const response: Response = await fetch(url);
            const fileStream = fs.createWriteStream(file);

            // const stream = fs.createWriteStream('output.txt');

            const { body } = await fetch(url);
            await finished(Readable.fromWeb(body).pipe(fileStream));

            resolve(true);

            /* response.body.pipe(fileStream);
            response.body.on("error", (err) => {
                reject(false);
            });
            fileStream.on("finish", function () {

                resolve(true);

            }); */

        })
            .catch(function (error: unknown) {

                console.error(error);

                return false;

            }) as Promise<boolean>;

    }

    public static async $UnZip(compressedData: Uint8Array, directory: string): Promise<boolean> {

        /* const compressed = new Uint8Array(
            await fetch(url).then(res => res.arrayBuffer())
        ); */

        return new Promise<boolean>(function (resolve, reject) {

            fflate.unzip(compressedData, async function (err, unzipped: Record<string, Uint8Array>) {

                
                for (const [key, uint8Array] of Object.entries(unzipped)) {

                    const unwrappedFileName: string = key.split(/[\\\/]/).slice(1).join("/");

                    if (key[key.length - 1] == "/") {

                        // is this the home directory
                        if (unwrappedFileName == "") continue;

                        await ForgeIO.$MakeDirectory(path.resolve(directory, unwrappedFileName));

                    } else {

                        await $fs.writeFile(path.resolve(directory, unwrappedFileName), uint8Array);

                    }

                }

                resolve(true);

            });

        });

    }

}