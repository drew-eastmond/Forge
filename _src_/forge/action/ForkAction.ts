import { Serialize } from "../../core/Core";
import { AbstractAction } from "./AbstractAction";

const { spawn, fork, exec, execSync } = require('child_process');

export class ForkAction extends AbstractAction {

    private _child;
    constructor(key: string, taskData: any) {

        super(key, taskData);

        this._bindings.set(this._onStdout, this._onStdout.bind(this));
        this._bindings.set(this._onStdErr, this._onStdErr.bind(this));
        this._bindings.set(this._onMessage, this._onMessage.bind(this));
        this._bindings.set(this._onExit, this._onExit.bind(this));

        const commands: string[] = this.data[this._implement].fork.split(/\s+/g);

        console.log("(Forking)", commands[0], commands.slice(1));

        this._child = fork(commands[0], commands.slice(1), { stdio: "pipe" });
        this._child.on("message", this._bindings.get(this._onMessage));
        this._child.on("exit", this._bindings.get(this._onExit));

        this._child.stdout.on("data", this._bindings.get(this._onStdout));
        this._child.stderr.on("data", this._bindings.get(this._onStdErr));

    }

    private _onExit(code: number, signal: string): void {

        console.log("exit", code, signal);

    }

    private _onMessage(message: unknown): void {

        console.log("message pareent", message);

        this.notify("message", message);

        this.read

    }

    private _onStdout(data: Buffer): void {

        console.log("captured (stdout)", String(data));
        this.stdout.push([String(data), Date.now() - this._startTime]);

    }

    private _onStdErr(data: Buffer): void {

        console.log("captured (stderr)", String(data));
        this.stderr.push([String(data), Date.now() - this._startTime]);

    }

    public write(...data: Serialize[]): void {

        this._child.send(data);
        
    }

}

/* private _wrapExecution;

private _onClose(code: number): void {

if (code == 0) {

console.log(`child process exited with code ${code}`);

} else {

console.log(`child process exited with code ${code}`);

}

console.log(this.stdout);
console.log(this.stderr);

} */

/* public async $signal(signal: string, data: any, race?: number): Promise<unknown> {

const child = this._child;
const _this: this = this;

return await new Promise(function (resolve, reject) {

let timeout;

const session: string = QuickHash();
const onMessage = function (message) {

    console.log("signal received", message);

    try {

        const [response, data] = message;

        if (response.session != session) return;

        if (response.resolve == signal) {

            child.off("message", onMessage);
            clearTimeout(timeout);
            resolve(data);

        } else if (response.reject == signal) {

            child.off("message", onMessage);
            clearTimeout(timeout);
            reject(data);

        }

    } catch (error) {

        // ignore message!!
        console.error("message ignored", message);

    }

};
 
_this.$write([{ signal, session }, data]);
 

if (race === undefined) return;
timeout = setTimeout(function () {

    console.log("singal failed");
    reject(new Error("signal expiry"));

}, race);

});

} */