const { spawn, fork, exec, execSync } = require("child_process");

import { CLIArguments } from "./_src_/ts/core/Argument";
import { Serialize } from "./_src_/ts/core/Core";
import { ForgeClient } from "./_src_/ts/forge/ForgeClient";


const cliArguments: CLIArguments = new CLIArguments();
cliArguments.
    add("key", {
        required: true
    })
    .compile();

const CLIENT_KEY: string = cliArguments.get("key") as string;
new class extends ForgeClient {

    public async $execute(signal: string, data: Serialize, race: number): Promise<Serialize> {

        console.log("come at me", signal, data, race);
        return;

    }

    public async $watch(data: Serialize, race: number): Promise<Serialize> {

        console.log("cwd:", process.cwd());
        console.log(data);


        execSync(`node ./forge/build.js --in-- ${data.in} --out-- ${data.out} --platform-- ${data.platform} --format-- ${data.format} --bundled`, { stdio: 'inherit' });
        execSync(`npx tailwindcss -i ./src/css/style.css -o ./build/www/css/output.css`, { stdio: 'inherit' });

        return { "just a": "test" };

    }

}(CLIENT_KEY);