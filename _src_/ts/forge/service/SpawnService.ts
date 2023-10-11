const { spawn, fork, exec, execSync } = require("child_process");

import { EncodeBase64, Serialize } from "../../core/Core";
import { AbstractServiceAdapter, ServiceConfig } from "./AbstractServiceAdapter";

export class SpawnService extends AbstractServiceAdapter {

    private _source: any;
    private _commands: string[];

    constructor(name: string, config: ServiceConfig, source?: any) {

        super(name, config);

        this._commands = config.command.split(/\s+/g);
        const args: string[] = [...this._commands.slice(1), "--key--", this._key, "{{data}}", EncodeBase64(config)];
        this._source = source || spawn(this._commands[0], args, { stdio: "pipe" });

        this._source.on("exit", this._onExit.bind(this));
        this._source.stdout.on("data", this._onStdoutData.bind(this));
        this._source.stderr.on("data", this._onStdoutError.bind(this));

    }

    private _onStdoutData(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);

        for (const line of lines) {

            try {

                const [forge, header, data] = JSON.parse(line);

                if (header.key != this._key) return;

                this.read([forge, header, data]);

            } catch (error: unknown) {

                // message ignored
                // console.log("ignore -- ", error);
                // console.log("line", line);

                if (line != "") {

                    console.parse(`<cyan>${line}</cyan>`);

                }

            }




        }

    }

    private _onStdoutError(message: string): void {

        const lines: string[] = String(message).split(/\r\n|\r|\n/g);
        // console.log("_onStdoutData", String(message), lines);
        for (const line of lines) {

            console.parse(`<cyan>${line}</cyan>`);

        }

    }

    private _onExit(): void {

        // const commands: string[] = this._command.split(/\s+/g);
        // this._child = spawn(commands[0], commands.slice(1));

    }

    public write(header: Serialize, ...data: Serialize[]): void {

        // absolutely important to append a new line in case to many messages are concatenated 
        // sent before the process finally read.
        this._source.stdin.write(JSON.stringify(["forge://", header, ...data]) + "\n");

    }

}