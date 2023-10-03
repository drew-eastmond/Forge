import { $UseRace, Serialize } from "../../core/Core";
import { Expiry } from "../../core/Expiry";
import { IClientAdapter } from "./ClientAdapter";

const $fs = require("fs").promises;
const path = require("path");
const mime = require('mime-types');
const { spawn, fork, exec, execSync } = require('child_process');

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

class ForgeClient {

    protected _executing: boolean;
    protected _queue: [] = [];

    protected _iClientAdapter: IClientAdapter;

    protected _filters: Set<string> = new Set();

    protected _delegates: Set<{}> = new Set();

    constructor(iClientAdapter: IClientAdapter) {

        this._iClientAdapter = iClientAdapter;
        this._iClientAdapter.subscribe("message", this._onMessage.bind(this));
        // this._iServiceAdapter.subscribe("broadcast", this._onMessage.bind(this));

    }

    private _onMessage(message: [protocol: string, header: Record<string, unknown>, data: Serialize]): void {

        try {

            const [protocol, { signal, session }, data] = message;

            switch (signal) {

                case "--reset":
                    this._iClientAdapter.write({ resolve: session, key: _key }, await this.$reset(data));
                    break;
                case "construct":
                case "execute":
                    const results: Serialize = await this.$execute(signal, data);
                    console.log(`${signal} $dispatched`, result);
                    this._iClientAdapter.write({ resolve: session }, result);
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

                    this._iClientAdapter.write({ reject: session }, { reason: `unknown signal : "${signal}"`});

            }

        } catch (error) {

            console.error(error);

        }

    }

    public async $reset(...data: Serialize[]): Promise<Serialize> {

        this._executing = false;

        const results: Serialize[] = []
        for (const iClientDelegate of this._delegates) {

            if (iClientDelegate instanceof ResetDelegate) {

                const $result: Serialize = await iClientDelegate.$execute(...data);
                results.push($result);

            }

        }

        return results;

    }

    public async $execute(signal: string, ...data: Serialize[]): Promise<Serialize> {

        const results: Serialize[] = []; 
        for (const iClientDelegate of this._delegates) {

            if (iClientDelegate instanceof ExecuteDelegate) {

                const $result: Serialize = await iClientDelegate.$execute(...data);
                results.push($result);

            }

        }

        return results;

    }

    public async $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        console.log("$signal called")

        this._iClientAdapter.write([{ signal: signal }, data]);
        this._iClientAdapter.$listen("message", function (message: ) {

            const [{ signal }, data] = message;

            console.log("signal received", message);

            if (message.resolve == signal) {

                console.log("ALL done forked", message);

            } else if (message.reject == signal) {

                console.log("rejected");


            }

        }, new Expiry(race));

        return new Promise(function (resolve: Function, reject: Function) {




        });

        /* return await new Promise(function (resolve, reject) {

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

            }, race);

        }); */

    }

    public async $route(route: string, parameters: Serialize[]): Promise<Serialize> {

        route = route || "index.html";

        console.log("<cyan>resolving</cyan>", path.resolve(_routeRoot, route));

        const buffer = await $fs.readFile(path.resolve(_routeRoot, route))
            .catch(function () {

                return Buffer.from("route error", "utf8");

            });


        return { mime: mime.lookup(route), contents: buffer.toString("base64") };

    }

    public add(iClientDelegate: IClientDelegate): void {

        this._delegates.add(iClientDelegate);

    }

}




const driver = new function (process, delegates) {

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

}(process, { $execute: $execute });