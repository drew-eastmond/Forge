import { IServiceAdapter } from "../service/AbstractServiceAdapter";
import { AbstractAction } from "./AbstractAction";

export class SpawnAction extends AbstractAction {

    constructor(iService: IServiceAdapter, implement: string, data: any) {

        super(iService, implement, data);

        this._bindings.set(this._onStdout, this._onStdout.bind(this));
        this._bindings.set(this._onStdErr, this._onStdErr.bind(this));

        // const key: string = this._key;
        // const commands: string[] = this.data.spawn.split(/\s+/g);
        // const args: string[] = [...commands.slice(1), "--key--", key];
        
        // const args: string[] = [...commands.slice(1), "--$signal--", EncodeBase64([{ signal, session, key }, data]), "--key--", key];

        console.log("Spawn Action constructed", String(this._iServiceAdapter), this._data);

        //console.log("(signalling)", commands[0], args);
        //console.log(this.data, this._implement);
        //console.log(this._stdio);

        return;

        /* switch (this._stdio.toLowerCase()) {
            case ActionStdioType.Default:
            case ActionStdioType.Pipe:
                this._iProcessAdapter = spawn(commands[0], args, { stdio: "pipe" });
                // this._child.stdout.pipe(process.stdout);
                // this._child.stderr.pipe(process.stderr);
                this._iProcessAdapter.stdout.on("data", this._bindings.get(this._onStdout));
                this._iProcessAdapter.stderr.on("data", this._bindings.get(this._onStdErr));
                break;
            case ActionStdioType.Inherit:
                this._iProcessAdapter = spawn(commands[0], args, { stdio: "inherit" });

                break;
            case ActionStdioType.Silent:
                this._iProcessAdapter = spawn(commands[0], args, { stdio: "silent" });
                break;
            default:

        } */

        // process.stdin.pipe(this._child.stdin);
        // this._child.stdin.setEncoding("utf-8");

    }

    private _onStdout(output: Buffer): void {

        const outputStr: string = String(output);
        for (const line of outputStr.split(/\r\n|\r|\n/g)) {

            try {

                const parsedData = JSON.parse(line);
                const [{ key, session }, data] = parsedData;
                // this.read(parsedData);

                // console.log("read successful", parsedData);

            } catch (error: unknown) {

                // message ignored
                // console.log("ignore -- ", error);
                // console.log("line", line);

            }

            
            if (line != "") {

                console.parse(`<cyan>${line}</cyan>`);

            }

        }

        this.stdout.push([outputStr, Date.now() - this._startTime]);

    }

    private _onStdErr(data: Buffer): void {

        const outputStr: string = String(data);
        for (const line of outputStr.split(/\r\n|\r|\n/g)) {

            if (line != "") {

                console.parse(`<red>${line}</red>`);

            }
            
        }

        this.stderr.push([String(data), Date.now() - this._startTime]);

    }

}


/*


return;

        // sanitize the race value
        race = race || this._race;

        if (this._child !== undefined) {

            console.log("look out remakde");
            return;

        }

        console.log(this.data, this._implement, data);

        const commands: string[] = this.data[this._implement].spawn.split(/\s+/g);

        const session: string = QuickHash();
        const key: string = this._key;

        const args: string[] = [...commands.slice(1), "--$signal--", EncodeBase64([{ signal, session, key }, data]), "--key--", key];

        console.log("(signalling)", commands[0], args);

       

        switch (this._stdio.toLowerCase()) {
            case ActionStdioType.Default:
            case ActionStdioType.Pipe:
                this._child = spawn(commands[0], args, { stdio: "pipe" });
                this._child.stdout.pipe(process.stdout);
                this._child.stderr.pipe(process.stderr);
                break;
            case ActionStdioType.Inherit:
                this._child = spawn(commands[0], args, { stdio: "inherit" });

                break;
            case ActionStdioType.Silent:
                this._child = spawn(commands[0], args, { stdio: "inherit" });
                break;
            default:

        }

        process.stdin.pipe(this._child.stdin);

        this._child.stdin.setEncoding("utf-8");

        this.write({ signal: "$reset", session, key }, { "crap": "data" });

        
        this._child.stdout.on("data", this._bindings.get(this._onStdout));
        this._child.stderr.on("data", this._bindings.get(this._onStdErr));

        

        let raceTimeout: IntervalClear;
        return new Promise(function (resolve: Function, reject: Function) {

            // { "spawn": "untracked response" };


            if (race === undefined) return;

            raceTimeout = setTimeout(function () {

                console.log("singal failed");
                reject(new Error("signal expiry"));

            }, race);

        })
            .finally(function () {

                clearTimeout(raceTimeout);

            });


        /* this._child = spawn(commands[0], commands.slice(1));

        this._child.stdin.setEncoding('utf-8');


        if (this._stdio.length == 1 && this._stdio[0] == ActionStdioType.Default) {

            this._child.stdout.pipe(process.stdout);
            this._child.stderr.pipe(process.stderr);

        } else {

            for (const io of this._stdio) {

                switch (io) {
                    case ActionStdioType.Stdout:
                        this._child.stdout.pipe(process.stdout);
                        break;
                    case ActionStdioType.Dependency:

                        break;
                }

            }

        }

        process.stdin.pipe(this._child.stdin);

        this._child.stdout.on("data", this._bindings.get(this._onStdout));
        this._child.stderr.on("data", this._bindings.get(this._onStdErr));

        const child = this._child;
        await new Promise<void>(function (resolve, reject) {

            let timeout;

            child.on("close", (code) => {

                console.log("closed", code)

                clearTimeout(timeout);

                resolve();

            });

            if (isNaN(race) === false) {

                timeout = setTimeout(function () {

                    console.log("ACtion timeout");
                    child.kill();
                    // reject("timeout")

                }, race);

            }

        });

        return { "spawn": "untracked response" };
;

        const child = this._child;

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
            child.on("message", onMessage);

            child.send([{ signal, session }, data]);

            if (race === undefined) return;
            timeout = setTimeout(function () {

                console.log("singal failed");
                reject(new Error("signal expiry"));

            }, race);

        }); */

/* private _wrapExecution;

private _onClose(code: number): void {

if (code == 0) {

console.log(`child process exited with code ${code}`);

} else {

console.log(`child process exited with code ${code}`);

}

console.log(this.stdout);
console.log(this.stderr);









public async $execute(): Promise<void> {

        return;

        const commands: string[] = this.data[this._implement].split(/\s+/g);

        console.log("(Executing)", commands[0], commands.slice(1));

        this._child = spawn(commands[0], commands.slice(1));

        this._child.stdin.setEncoding('utf-8');


        if (this._stdio.length == 1 && this._stdio[0] == ActionStdioType.Default) {

            this._child.stdout.pipe(process.stdout);
            this._child.stderr.pipe(process.stderr);

        } else {

            for (const io of this._stdio) {

                switch (io) {
                    case ActionStdioType.Stdout:
                        this._child.stdout.pipe(process.stdout);
                        break;
                    case ActionStdioType.Dependency:

                        break;
                }

            }

        }

        process.stdin.pipe(this._child.stdin);

        this._child.stdout.on("data", this._bindings.get(this._onStdout));
        this._child.stderr.on("data", this._bindings.get(this._onStdErr));

        const race: number = this._race;
        const child = this._child;
        await new Promise<void>(function (resolve, reject) {

            let timeout;

            child.on("close", (code) => {

                console.log("closed", code)

                clearTimeout(timeout);

                resolve();

            });

            if (isNaN(race) === false) {

                timeout = setTimeout(function () {

                    console.log("ACtion timeout");
                    child.kill();
                    // reject("timeout")

                }, race);

            }

        });

    }


} */
