const { spawn, fork, exec, execSync } = require("child_process");

import { CLIArguments } from "./_src_/ts/core/Argument";
import { Serialize } from "./_src_/ts/core/Core";
import { AbstractForgeClient } from "./_src_/ts/forge/client/AbstractForgeClient";


const cliArguments: CLIArguments = new CLIArguments();
cliArguments.
    add("key", {
        required: true
    })
    .compile();

const CLIENT_KEY: string = cliArguments.get("key") as string;
new class extends AbstractForgeClient {

    public async $execute(signal: string, data: Serialize, race: number): Promise<Serialize> {

        console.log("come at me", signal, data, race);
        return;

    }

    public async $watch(data: Serialize, race: number): Promise<Serialize> {

        console.log("cwd:", process.cwd());
        execSync(`node ./forge/build.js --in-- ${data.file} --out-- ./build/www/js/compiled.js --platform-- browser --format-- cjs --bundled`, { stdio: 'inherit' });
        execSync(`npx tailwindcss -i ./src/css/style.css -o ./build/www/css/output.css`, { stdio: 'inherit' });

        return { "just a": "test" };

    }

}(CLIENT_KEY);