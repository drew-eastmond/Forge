import { $Promise, $UseRace, Serialize } from "../core/Core";
import { Subscription } from "../core/Subscription";
import { IServiceAdapter } from "./service/AbstractServiceAdapter";
import { ForkService } from "./service/ForkService";
import { SpawnService } from "./service/SpawnService";

const { Worker, isMainThread } = require("worker_threads");
const $fs = require("fs").promises;
const path = require("path");
const mime = require("mime-types");

interface IClientDelegate {
    $execute(...data: Serialize[]): Promise<Serialize>;
}

class AbstractDelegate implements IClientDelegate {

    protected _$delegate: Function;
    constructor($delegate: Function) {

        this._$delegate = $delegate;

    }

    public $execute(...data: Serialize[]): Promise<Serialize> {

        return this._$delegate(...data);

    }

}

export class ResetDelegate extends AbstractDelegate { }

export class ExecuteDelegate extends AbstractDelegate { }

export class RouteDelegate extends AbstractDelegate { }

export class ForgeClient extends Subscription {

    protected _race: number;

    protected _executing: boolean;
    protected _queue: [] = [];
    protected _routeRoot = "./build/_route_/typescript";

    protected _iServiceAdapter: IServiceAdapter;

    protected _filters: Set<string> = new Set();

    protected _delegates: Set<{}> = new Set();

    constructor(key: string) {

        super();

        if (process.send === undefined) {

            console.log("started directly (spawn/exec)");
            this._iServiceAdapter = new SpawnService("client interface", { key, race : 1000 }, process);
        

        } else if (isMainThread === true) {

            console.log("started from fork");
            this._iServiceAdapter = new ForkService("client interface", { key, race: 1000 }, process);

        } else {

            console.log("started from worker");

        }

        this._iServiceAdapter.subscribe("message", this._$subscribeMessage.bind(this));

    }

    private async _$raceDispatch(header: Record<string, unknown>, ...$rest: Promise<Serialize>[]): Promise<void> {

        const race: number = header.race as number || this._race;

        const $race: $Promise = $UseRace(race);
        const result: Serialize = await Promise.race([$race[0], ...$rest]) as Serialize;

        // get serialized! or die trying. Either return a `Serialize` result or let a outer scope cature the error.
        this._iServiceAdapter.resolve(header, result);

    }

    private async _$subscribeMessage(notify: string, header: Record<string, unknown>, data: Serialize) {// message: [ header: Record<string, unknown>, data: Serialize]): void {

        let race: number = 250;
        let result: unknown;

        try {

            const { signal, session } = header as { signal: string, session: string };

            switch (signal) {

                case "reset":
                    await this._$raceDispatch(header, this.$reset(data, race));
                    break;
                case "construct":
                case "route":
                    console.log("ROUTED CHILD", data);
                    const { route, params } = data as { route: string, params: Serialize[] };
                    await this._$raceDispatch(header, this.$route(route, params, race));
                    // this._iServiceAdapter.resolve(header, JSON.stringify(await this.$route(route, params, race)));
                    break;
                case "watch":
                    // result = await this._$raceDispatch(race, this.$watch(data, race));
                    await this._$raceDispatch(header, this.$watch(data, race))
                        /*.then(function (result: Serialize) {

                            this._iServiceAdapter.resolve(header, result);

                        })
                        .catch(function (error: unknown) {

                            this._iServiceAdapter.reject(header, result);

                        }); */
                    break;

                default:

                    await this._$raceDispatch(header, this.$execute(signal, data, race))
                        /*.then(function (result: Serialize) {

                            this._iServiceAdapter.resolve(header, result);

                        })
                        .catch(function (error: unknown) {

                            

                        }); */

            }

        } catch (error) {

            console.error(error);
            this._iServiceAdapter.reject(header, error);

        }

    }

    public async $signal(signal: string, data: Serialize, race?: number): Promise<Serialize> {

        console.log("$signal called")

        return this._iServiceAdapter.$signal(signal, data, race);

    }

    public async $reset(data: Serialize, race: number): Promise<Serialize> {

        return { "reset" : "empty function"};

    }

    public async $execute(signal: string, data: Serialize, race: number): Promise<Serialize> {

        return { "execute": "empty function" };

    }

    public async $watch(data: Serialize, race: number): Promise<Serialize> {


        return { "watched": true };

    }

    public async $route(route: string, parameters: Serialize[], race: number): Promise<{mime: string, contents : Buffer}> {

        route = route || "index.html";

        console.log("<cyan>resolving >></cyan>", path.resolve(this._routeRoot, route));

        const buffer = await $fs.readFile(path.resolve(this._routeRoot, route))
            .catch(function (error: unknown) {

                console.log(error);

                return Buffer.from("route error found file found", "utf8");

            });

        return { mime: mime.lookup(route), contents: buffer.toString("base64") };

    }

}


/* const driver = new function (process, delegates) {

    const _this = this;

    let _$execute;

    let _key;
    let _data;

    const _process = process;

    let _$resetDelegate = delegates.$reset;
    let _$executeDelegate = delegates.$execute;

    let _routeRoot;

    const _database = new Map();

    function _construct() {

        _this.args = _parseArgs(_process.argv);
        // _this.args.$signal = Buffer.from(_this.args.$signal, 'base64').toString(); 

        _key = _this.args.key;
        _data = _this.args.data;

        if (_key === undefined) {

            console.log("key not assigned in args `--key--`");
            process.exit(1);

        } else {

            console.log("key assigned", _key);

        }

        _routeRoot = _data.route_root;
        if (_routeRoot === undefined) throw new Error(`base need for routing : "${_routeRoot}"`);

        console.log("constructed", _this.args);
        _process.on("message", _this.$message);


        _process.stdin.resume();
        _process.stdin.setEncoding("ascii");
        _process.stdin.on("data", function (inputs) {

            console.log("stdin received", inputs.split("\n"));

            for (const input of inputs.split("\n")) {

                console.log(input);

                try {

                    _this.$message(JSON.parse(input));

                } catch (error) {

                    // console.error(error);

                }

            }

        });
    }

    function _parseArgs(args) {

        const result = {};

        for (let i = 2; i < _process.argv.length; i) {

            // validate if the arguments match the formattung for parsing keys
            const keyQuery = args[i++];

            // --{key}-- parses into a key:value pair (no translate)
            if (/{{(.+?)}}/.test(keyQuery)) {

                const results = /{{(.+?)}}/.exec(keyQuery);
                const key = results[1];

                try {

                    result[key] = JSON.parse(Buffer.from(args[i++], "base64").toString("ascii"));

                } catch (err) {

                    console.error(`${key} parameter parsed incorrectly`);
                    result[key] = new Error(`"${key}" parameter parsed incorrectly`);

                }

                // --{key}-- parses into a key:value pair (no translate)
            } else if (/--(.+?)--/.test(keyQuery)) {

                const results = /--(.+?)--/.exec(keyQuery);
                result[results[1]] = args[i++];

                // --{key} parses into a key:true flag with a default value of true
            } else if (/--(.+?)$/.test(keyQuery)) {

                const results = /--(.+?)$/.exec(keyQuery);
                result[results[1]] = true;

                // no formatting found, abort!!! This is a simple script
            } else {

                // give a meanful error and exit
                console.error(`(Executing) node ${args.slice(1).join(" ")}

\u001b[31;1mIncorrect formatting encountered parsing key arguments : "\u001b[34;1m${keyQuery}\u001b[31;1m"\u001b[0m
${JSON.stringify(_args, undefined, 2)}`);

                process.exit(1);

            }

        }

        return result;
    }

    function _$promise() {

        let resolver;
        let rejector;

        const promise = new Promise(function (resolve, reject) {

            resolver = resolve;
            rejector = reject;

        });

        return { $: promise, resolve: resolver, reject: rejector };

    }

    _this.$message = async function (message) {

        try {

            const [protocol, { signal, session, key }, data] = message;


            if (key != _key) return;

            switch (signal) {

                case "--reset":
                    await _this.$reset(data);
                    _this.write({ resolve: session, key: _key }, "reset successful");
                    break;
                case "construct":
                case "execute":
                    console.log(`${signal} $dispatched`);
                    const result = await _this.$dispatch(signal, data);
                    console.log(`${signal} complete`, result);
                    _this.write({ resolve: session, key: _key }, result);
                    break;

                case "test--":
                    console.log(`${signal} $dispatched`);
                    // const result = await _this.$dispatch(signal, data);
                    console.log(`${signal} complete`, "drew random but good");
                    _this.write({ resolve: session, key: _key }, "drew random but good");
                    break;
                case "route":
                    console.log("ROUTED CHILD", data);
                    const { route, params } = data;
                    _this.write({ resolve: session, key: _key }, JSON.stringify(await _this.$route(route, params)));
                    break;
                case "watch":

                    console.log(data);
                    console.log("cwd:", process.cwd());
                    execSync(`node ./forge/build.js --in-- ${data.file} --out-- ./build/www/js/compiled.js --platform-- browser --format-- cjs --bundled`);
                    execSync(`npx tailwindcss -i ./src/css/style.css -o ./build/www/css/output.css`);
                    break;

                default:

                    _this.write({ reject: session, key: _key }, { "unknown signal for": "me", signal });

            }

        } catch (error) {

            console.error(error);

        }

    };

    _this.$reset = async function (data) {

        _executing = false;

        if (_$resetDelegate !== undefined) {

            await _$resetDelegate(resetData);

        }

    };

    _this.$dispatch = function (signal, data) {

        console.log("$execute called")

        if (_$execute !== undefined) return _$execute;
        _$execute = new Promise(async function (resolve, reject) {

            if (_$executeDelegate === undefined) return resolve(undefined);

            const result = await _$executeDelegate(data);
            resolve(result);

        });

        return _$execute;

    };

    _this.$signal = async function (signal, data, race) {

        console.log("$signal called")

        _process.send([{ signal: signal }, data]);

        return await new Promise(function (resolve, reject) {

            onMessage = function (message) {

                const [{ signal }, data] = message;

                console.log("signal received", message);

                if (message.resolve == signal) {

                    console.log("ALL done forked", message);

                } else if (message.reject == signal) {

                    console.log("rejected");


                }

            };
            _process.on("message", onMessage);

            if (race === undefined) return;

            setTimeout(function () {

                reject(new Error(`$signal expired ${signal}`));

            });

        });

    };

    _this.write = function (...data) {

        if (_process.send === undefined) {

            console.log(JSON.stringify(["forge://", ...data]));

        } else {

            _process.send(data);

        }

    };

    _this.$route = async function (route, parameters) {

        route = route || "index.html";

        console.log("<cyan>resolving</cyan>", path.resolve(_routeRoot, route));

        const buffer = await $fs.readFile(path.resolve(_routeRoot, route))
            .catch(function () {

                return Buffer.from("route error", "utf8");

            });


        return { mime: mime.lookup(route), contents: buffer.toString("base64") };

    };

    _construct();

}(process, { $execute: $execute }); */