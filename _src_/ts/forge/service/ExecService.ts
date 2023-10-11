const { spawn, fork, exec, execSync } = require("child_process");

import { EncodeBase64, Serialize } from "../../core/Core";
import { AbstractServiceAdapter, ServiceConfig } from "./AbstractServiceAdapter";

export class ExecService extends AbstractServiceAdapter {

    private _source: any;
    private _command: string;
    private _config: Record<string, unknown>;

    constructor(name: string, config: ServiceConfig) {

        super(name, config);

        this._config = config;
        this._command = config.command as string;

    }

    private _injectCommand(data: Serialize): string {

        let output: string = this._command;

        const accessSource: Record<string, unknown> = { ...this._config, ...data };

        let results: RegExpExecArray;
        const regExp: RegExp = /{{(.+?)}}/g
        while (results = regExp.exec(this._command)) {

            const accessor: string[] = results[1].split(".");
            let value: unknown = accessSource;
            try {

                for (const access of accessor) {

                    value = value[access];

                }

            } catch (error) {

                value = undefined;

            }

            // inject eh current value
            output = output.replace(new RegExp(`{{${results[1]}}}`), String(value));

        }
            

        return output;

    }

    private _onExit(): void {

        // const commands: string[] = this._command.split(/\s+/g);
        // this._child = spawn(commands[0], commands.slice(1));

    }

    public write(header: Serialize, data: Serialize): void {

        // ! `ExecService` write is not supported

    }

    public $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        // sanitize
        race = race || this._race;
        const name: string = this._name;
        const pipeStdio: Function = this._bindings.get(this._pipeStdio);
        const pipeError: Function = this._bindings.get(this._pipeError);

        // todo replace with `Accessor` class
        // just do this manually for now. Ideally l Accessor class
        const command: string = this._command
            .replace(/\{\{command\}\}/g, data.command as string);

        return new Promise(function (resolve: Function, reject: Function) {

            const child = exec(command, { stdio: "pipe" });

            child.on("exit", function (error, stdout, stderr) {

                if (error) {

                    reject({ name, "reject": "hehehe" });

                } else {

                    resolve({ name, "resolve": "hehehe" });

                }

            });

            child.stdout.on("data", pipeStdio);
            child.stderr.on("data", pipeError);

            setTimeout(function () {

                reject({ name, "rejected": "timeout" });

            }, race);

        }.bind(this));

    } 

}


/*const commandData: string = EncodeBase64({ ...this._config, ...data });

// 1. Replace all `static variables` : {var}
for (const { access, value } of entries) {

config = config.replace(new RegExp(`{{${access}}}`, "g"), String(value));

}


const command: string = `${this._command} "--key--", ${this._key} "{{data}}", ${commandData}`; */