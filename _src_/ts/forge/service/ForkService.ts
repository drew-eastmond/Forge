const { spawn, fork, exec, execSync } = require("child_process");

import { EncodeBase64, Serialize } from "../../core/Core";
import { AbstractServiceAdapter, ServiceConfig } from "./AbstractServiceAdapter";

export class ForkService extends AbstractServiceAdapter {

    private _source: any;
    private _commands: string[];

    constructor(name: string, config: ServiceConfig, source?: any) {

        super(name, config);

        if (source === undefined) {

            const controller = new AbortController();
            const { signal } = controller;

            this._commands = config.command.split(/\s+/g);
            const args: string[] = [...this._commands.slice(1), "--key--", this._key, "{{data}}", EncodeBase64(config)];

            this._source = source || fork(this._commands[0], args, { stdio: "pipe", signal });

        } else {

            this._source = source;

        }

        this._source.stdout.on("data", this._bindings.get(this._pipeStdio));
        this._source.stderr.on("data", this._bindings.get(this._pipeError));

        this._source.on("exit", this._onExit.bind(this));

        this._source.on("message", this._bindings.get(this.read));

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