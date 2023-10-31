const $fs = require("node:fs/promises");
const fs = require("fs");
const path = require("path");

const { Readable } = require('stream');
const { finished } = require('stream/promises');

const fflate = require("fflate");

class ForgeFile {

    public async $FileExist(file: string): Promise<boolean> {

        return $fs.access(file, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

    }

    public async 


}

export class ForgeIO {

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

    public static async $Download(url: string, fileName: string): Promise<boolean> {
    
        return await new Promise(async function (resolve, reject) {

            // const response: Response = await fetch(url);
            const fileStream = fs.createWriteStream(fileName);

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