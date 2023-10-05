import { AbstractAction } from "./AbstractAction";

const { spawn, fork, exec, execSync } = require('child_process');

export class WorkerAction extends AbstractAction {

    private static readonly RegisteredWorkers: Map<string, Worker> = new Map();

    private _worker: Worker;
    constructor(pareentNode: GenericNode, key: string, taskData: any) {

        super(key, taskData);

        this._worker = new Worker(this.data[this._implement].worker);

        return;

        this._bindings.set(this._onStdout, this._onStdout.bind(this));
        this._bindings.set(this._onStdErr, this._onStdErr.bind(this));
        this._bindings.set(this._then$execute, this._then$execute.bind(this));

        this._child.stdout.on("data", this._bindings.get(this._onStdout));
        this._child.stderr.on("data", this._bindings.get(this._onStdErr));

    }

    private _onStdout(data: Buffer): void {

        console.log("captured (stdout)", String(data));
        this.stdout.push([String(data), Date.now() - this._startTime]);

    }

    private _onStdErr(data: Buffer): void {

        console.log("captured (stderr)", String(data));
        this.stderr.push([String(data), Date.now() - this._startTime]);

    }

    public async $signal(signal: string, data: any, race: number) {

        return await new Promise(function (resolve, reject) {

            let timeout;
            let onMessage = function (message) {

                console.log("signal received", message);

                try {

                    const [response, data] = message;

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
            child.on("message", onMessage);

            child.send([{ signal }, data]);

            if (race === undefined) return;
            timeout = setTimeout(function () {

                console.log("singal failed");
                reject(new Error("signal expiry"));

            }, race);

        });

    }


    public async $execute(forgeStream: ForgeStream): Promise<void> {

        // send the child a start message
        await this.$signal("$execute", { happy: true }, this._race)
            .then(this._bindings.get(this._then$execute) as (value: unknown) => void)
            .catch(function (error: unknown) {

                console.log("Error excuting")

            })

        return;

    }

}