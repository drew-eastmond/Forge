const { spawn, fork, exec, execSync } = require("child_process");
const chokidar = require("chokidar");
const $fs = require("fs").promises;
const glob = require("glob");
const express = require("express");
const url = require("url");
const path = require("path");

import { EncodeBase64, FlattenObject, IntervalClear, Serialize, TimeoutClear } from "../core/Core";
import { ForgeIO } from "./io/ForgeIO";
import { ForgeStream } from "./ForgeStream";
import { ForgeTask, TaskConfig } from "./ForgeTask";
import { ForgeServer } from "./server/ForgeServer";
import { IServiceAdapter, ServiceConfig } from "./service/AbstractServiceAdapter";
import { ExecService } from "./service/ExecService";
import { ForkService } from "./service/ForkService";
import { SpawnService } from "./service/SpawnService";
import { Accessor } from "../core/Accessor";
import { PluginService } from "./service/PluginService";

type ForgeServices = {
    spawn?: Record<string, ServiceConfig>,
    fork?: Record<string, ServiceConfig>,
    exec?: Record<string, ServiceConfig>,
    worker?: Record<string, ServiceConfig>,
    plugin?: Record<string, ServiceConfig>
}

type ForgeConfig = {
    forge: Record<string, unknown>,
    variables: Record<string, unknown>,
    services: ForgeServices,
    tasks: TaskConfig[]
}

export class Forge {

    public static Search(glob: string) : void {
        
        
        
    }

    private _forgeServer: ForgeServer;

    private readonly _taskMap: Map<string, ForgeTask> = new Map();

    private readonly _ignoreArr = [/(^|[\/\\])\../];

    private readonly _forgeStream: ForgeStream = new ForgeStream();

    public readonly services: Map<string, IServiceAdapter> = new Map();

    constructor() {

    }

    private _buildService(services: ForgeServices, errors: string[]): void {

        if (services === undefined) throw new Error(`No services assigned`);

        const spawnObj: Record<string, ServiceConfig> = services.spawn;
        if (spawnObj) {

            for (const [key, serviceConfig] of Object.entries(spawnObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for SPAWN service "${key}"`);
                if (serviceConfig.race === undefined) errors.push(`Invalid \`race\` parameter provided for SPAWN service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.spawn(key, serviceConfig);

            }

        }

        const forkObj: Record<string, ServiceConfig> = services.fork;
        if (forkObj) {
            for (const [key, serviceConfig] of Object.entries(forkObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for FORK service "${key}"`);
                if (serviceConfig.race === undefined) errors.push(`Invalid \`race\` parameter provided for FORK service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.fork(key, serviceConfig);

            }
        }

        const execObj: Record<string, ServiceConfig> = services.exec;
        if (execObj) {
            for (const [key, serviceConfig] of Object.entries(execObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for EXEC service "${key}"`);
                if (serviceConfig.race === undefined) errors.push(`Invalid \`race\` parameter provided for EXEC service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.exec(key, serviceConfig);

            }
        }

        const pluginObj: Record<string, ServiceConfig> = services.plugin;
        if (pluginObj) {
            for (const [key, serviceConfig] of Object.entries(pluginObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for PLUGIN service "${key}"`);
                if (serviceConfig.race === undefined) errors.push(`Invalid \`race\` parameter provided for PLUGIN service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.plugin(key, serviceConfig);

            }
        }

    }

    public parse(input: string, options?: {}): Record<string, unknown> {

        // extract the "variables" properties from the input string. I'm using a niave method to extract the 
        const result: RegExpExecArray = /"variables":\s*\{/i.exec(input);
        const start: number = result.index + result[0].length;
        // console.log(result.index);
        // console.log(input.charAt(result.index), result[0].length);

        let closureTracking: number = 1;
        let i: number;
        for (i = start; i < input.length; i++) {

            switch (input[i]) {

                case "{":
                    closureTracking++;
                    break;

                case "}":
                    closureTracking--;
                    break;

            }

            if (closureTracking == 0) {

                console.log(JSON.parse("{" + input.substring(start, i) + "}"));
                break;

            }

        }

        const variables: Record<string, unknown> = JSON.parse("{" + input.substring(start, i) + "}");
        const accessor: Accessor = new Accessor(variables);

        /* for (const { access, value } of accessor) {

            console.log(access, value);

        } */

        // const regExp: RegExp = ;


        /* const missedInjections: Set<string> = new Set();

        let results: RegExpExecArray;
        while (results = regExp.exec(input)) {

            const access: string = results[1];
            const accessSequence: string[] = access.split(".");

            // console.log(results[1], accessor.has(results[1].split(".")));
            if (accessor.has(accessSequence)) {

                // const value: unknown = 

                console.log(results[1]);
                input = input.replace(`{${access}}`, accessor.extract(accessSequence) as string);

            } else {

                missedInjections.add(results[1]);

            }

        }


        console.log(missedInjections); */
        input = accessor.inject(input, /[^\{]\{\s*([\w_\.]+?)\s*\}[^\}]/g, (match: string, access: string): string => {
        
            switch (access) {
                case "forge":
                    return "./forge";

                case "build.root":
                    return "./www";

            }

            throw new Error(`unhandled injection property {${access}}`);

        });
        // console.log(input);

        

        /*
        * 2. Reparse the new config string and add all the supplied forege task
        */
        const configObj: ForgeConfig = JSON.parse(input);

        /*
        *
        * 3. 
        *   instantiate all the spawn processes from this data structure
        * 
        * "spawn" : {
        *   "{name: string}": {
        *           "command": "{string}",
        *           "race": {number},
        *           "reboot" : {boolean}
        *           ...{extra_data_passed_to_process}
        *       } 
        *   },
        *   ...
        * }
        * 
        */
        this._buildService(configObj.services, []);


        for (const taskObj of configObj.tasks) {

            const forgeTask: ForgeTask = new ForgeTask(this, taskObj);
            this.add(forgeTask);

        }

        return configObj;

    }

    public tasks(): Map<string, ForgeTask> {

        return this._taskMap;

    }

    public add(forgeTask: ForgeTask): this {

        const name: string = forgeTask.name;

        if (this._taskMap.has(name)) throw new Error(`task with "${name}" name already exist`);

        this._taskMap.set(name, forgeTask);

        this._forgeStream.add(forgeTask);

        return this;

    }

    public spawn(name: string, config?: ServiceConfig): IServiceAdapter {

        // no duplicate entries
        if (this.services.has(name)) throw new Error(`IServiceAdapter (spawn) already exists "${name}"`);

        const spawnService: SpawnService = new SpawnService(name, config);
        this.services.set(name, spawnService);

        return spawnService;

    }

    public fork(name: string, config?: ServiceConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (fork) already exists "${name}"`);

        const forkService: ForkService = new ForkService(name, config);
        this.services.set(name, forkService);

        return forkService;

    }

    public worker(name: string, config: ServiceConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (worker) already exists "${name}"`);

        // const workerService = {}; // = new ExecService(name, config);
        // this.services.set(name, workerService);

        // return workerService;
        return;

    }

    public exec(name: string, config: ServiceConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (exec) already exists "${name}"`);

        const execService: ExecService = new ExecService(name, config);
        this.services.set(name, execService);

        return execService;

    }

    public plugin(name: string, config: ServiceConfig): IServiceAdapter {

        if (this.services.has(name) && config === undefined) throw new Error(`IServiceAdapter (plugin) already exists "${name}"`);

        const pluginService: PluginService = new PluginService(name, config);
        this.services.set(name, pluginService);

        return pluginService;

    }

    public watch(glob: string[], options: { ignore: string[], debounce?: number, throttle?: number }): void {

        const watcher = chokidar.watch(glob, { 'ignored': this._ignoreArr });

        const forge: Forge = this;
        watcher.on("ready", function () {
            watcher.on("all", async function (event: string, file : string) {

                const resetNow: number = Date.now();
                console.group("------------------ watch ------------------");
                const resets: Serialize = await forge.$reset({ file, event });
                console.parse("<blue>start:", resetNow, "<blue>reset complete:", Date.now() - resetNow);

                const signalNow: number = Date.now();
                await forge.$signal("watch", { file, event });
                console.parse(`<blue>end: <yellow>${Date.now() - signalNow}ms`);
                console.log("");
                console.groupEnd();

            });

        });

    }

    public async $reset(data: Serialize, race?: number): Promise<Serialize> {

        const $promises: Promise<Serialize>[] = [];
        for (const [name, iService] of this.services) {

            $promises.push(iService.$reset(data));

        }

        // we need to await services for synchronization reasons.
        await Promise.allSettled($promises);

        $promises.push(this._forgeStream.$reset());
        await Promise.allSettled($promises);

        /*
        * x. ForgeTask is implmented via inheritance. Otherwise returna  
        */
        for (const [name, forgeTask] of this._taskMap) {

            // await forgeTask.$reset(data);
            $promises.push(forgeTask.$reset(data));

        }
        
        return { reset: await Promise.allSettled($promises) };

    }

    public async $signal(signal: string, data: Serialize, race?: number): Promise<Serialize> {

        if (data === undefined) throw new Error(`Forge.$signal("${signal}", data ) \`data\` parameter is undefined`);

        return this._forgeStream.$signal(signal, data, race);

    }



    public abort(): void {

        // oh fuck! Hurry up and clean up...



    }

    public async $serve(port: number, base: string): Promise<ForgeServer> {

        // validate the port
        if (isNaN(port)) throw new Error("No port assigned");

        // validate the base and test if the directory exists
        if (await ForgeIO.$DirectoryExists(base) === false) throw new Error(`Serve base provided is invalid "${base}"`);
        
        // the params will be validated in the  `ForgeServer` constructor
        this._forgeServer = new ForgeServer(this, port, base);

        return this._forgeServer;

    }

    public async $load(): Promise<void> {

    }

    public async $save(): Promise<void> {



    }

}