const { spawn, fork, exec, execSync } = require("child_process");
const chokidar = require("chokidar");
const $fs = require("fs").promises;
const glob = require("glob");
const express = require("express");
const url = require("url");
const path = require("path");

import { EncodeBase64, FlattenObject, IntervalClear, Serialize, TimeoutClear } from "../core/Core";
import { Debouncer } from "../core/timing/Debounce";
import { ForgeIO } from "../io/ForgeIO";
import { ForgeStream } from "./ForgeStream";
import { ForgeTask, TaskConfig } from "./ForgeTask";
import { ForgeServer } from "./server/ForgeServer";
import { IServiceAdapter, ServiceConfig } from "./service/AbstractServiceAdapter";
import { ExecService } from "./service/ExecService";
import { ForkService } from "./service/ForkService";
import { SpawnService } from "./service/SpawnService";

type ForgeConfig = {
    forge: Record<string, unknown>,
    variables: Record<string, unknown>,
    services: {
        spawn?: Record<string, ServiceConfig>,
        fork?: Record<string, ServiceConfig>,
        exec?: Record<string, ServiceConfig>,
        worker?: Record<string, ServiceConfig>
    },
    tasks: TaskConfig[]
}

// relay class defitions

class WatchManager {

    private _forge: Forge;

    private _delay: number;
    private _debouncer: Debouncer = new Debouncer();

    private readonly _watchEntries: Set<{ event: string, file: string }> = new Set(); 

    constructor(forge: Forge, delay: number) {

        this._forge = forge;
        this._delay = delay;

    }

    private async _debounceWatch (): Promise<void> {

        const watchEntries: { file: String, event: string }[] = Array.from(this._watchEntries);
        this._watchEntries.clear();
        for (const watchEntry of watchEntries) {

            await this._forge.$signal("watch", watchEntry);

        }

    }

    public add(file: string, event: string): void {

        this._watchEntries.add({ file, event });

        this._debouncer.debounce(this._debounceWatch, [], this._delay);

    }

}

export class Forge {

    public static Search(pattern: string) : void {
        
        
        
    }

    private _lastUpdate: number = Date.now();

    private _forgeServer: ForgeServer;

    private readonly _taskMap: Map<string, ForgeTask> = new Map();

    private readonly _ignoreArr = [/(^|[\/\\])\../];

    private readonly _forgeStream: ForgeStream = new ForgeStream();

    public readonly services: Map<string, IServiceAdapter> = new Map();

    constructor() {

    }

    private _buildService(services: { spawn?: Record<string, ServiceConfig>, fork?: Record<string, ServiceConfig>, exec?: Record<string, ServiceConfig> }, errors: string[]): void {

        if (services === undefined) throw new Error(`No services assigned`);

        const spawnObj: Record<string, ServiceConfig> = services.spawn;
        if (spawnObj) {

            for (const [key, serviceConfig] of Object.entries(spawnObj)) {

                // todo Replace these queries with `Enforce`
                // Validate required parameters for command and race

                if (serviceConfig.command === undefined) errors.push(`Invalid \`command\` parameter provided for SPAWN service "${key}"`);
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for SPAWN service "${key}"`);

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
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for FORK service "${key}"`);

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
                if (isNaN(serviceConfig.race)) errors.push(`Invalid \`race\` parameter provided for EXEC service "${key}"`);

                // truthfully, we dont really use the return value
                const service: IServiceAdapter = this.exec(key, serviceConfig);

            }
        }

    }

    public parse(input: string): void {

        const variables = JSON.parse(input).variables;

        const entries: { access: string, value: unknown }[] = FlattenObject(variables);

        /*
        * 1. Replace all `static variables` : {variable} 
        */
        for (const { access, value } of entries) {

            input = input.replace(new RegExp(`{${access}}`, "g"), String(value));

        }

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

    public watch(glob: string[], options: { ignore: string[], debounce?: number }): void {

        const watcher = chokidar.watch(glob, { 'ignored': this._ignoreArr });

        const forge: Forge = this;
        watcher.on("ready", function () {
            watcher.on("all", async function (event: string, file : string) {

                const resetNow: number = Date.now();
                const resets: Serialize = await forge.$reset({ file, event });
                console.log("resetTime:", Date.now() - resetNow);
                // console.log("ForgeStream reset", resets);

                const watchNow: number = Date.now();
                await forge.$signal("watch", { file, event });
                console.log("watchTime:", Date.now() - watchNow);

            });

        });

    }

    public async $reset(data: Serialize): Promise<Serialize> {

        const $promises: Promise<Serialize>[] = [];
        for (const [name, iService] of this.services) {

            $promises.push(iService.$reset(data));

        }

        // we need to await services for synchronization reasons.
        await Promise.allSettled($promises);

        for (const [name, forgeTask] of this._taskMap) {

            await forgeTask.$reset(data);

        }

        await Promise.allSettled($promises);

        $promises.push(this._forgeStream.$reset());

        return { reset: Promise.allSettled($promises) };

    }

    public async $signal(signal: string, data: Serialize): Promise<Serialize> {

        const results: Serialize = await this._forgeStream.$signal(signal, data);

        return results;

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