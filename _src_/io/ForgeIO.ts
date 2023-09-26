const $fs = require("node:fs/promises");

export class ForgeIO {

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

}