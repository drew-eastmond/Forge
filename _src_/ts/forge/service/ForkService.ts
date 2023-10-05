const { spawn, fork, exec, execSync } = require("child_process");

import { EncodeBase64, Serialize } from "../../core/Core";
import { AbstractServiceAdapter, ServiceAdpaterConfig } from "./AbstractServiceAdapter";

export class ForkService extends AbstractServiceAdapter {

    private _source: any;
    private _commands: string[];

    constructor(config: ServiceAdpaterConfig, source?: any) {

        super(config);

        if (source === undefined) {

            const controller = new AbortController();
            const { signal } = controller;

            this._commands = config.command.split(/\s+/g);
            const args: string[] = [...this._commands.slice(1), "--key--", this._key, "{{data}}", EncodeBase64(config)];

            this._source = source || fork(this._commands[0], args, { stdio: "pipe", signal });

        } else {

            this._source = source

        }

        

        this._source.stdout.on("data", this._onStdoutData.bind(this));
        this._source.stderr.on("data", this._onStdoutError.bind(this));

        this._source.on("exit", this._onExit.bind(this));

        this._source.on("message", function (message) {

            console.log(message);
            this.read(message);

        }.bind(this));

        

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

    public write(header: Serialize, data: Serialize): void {

        // absolutely important to append a new line in case to many messages are concatenated 
        // sent before the process finally read.
        this._source.send(["forge://", header, data]);

    }

}