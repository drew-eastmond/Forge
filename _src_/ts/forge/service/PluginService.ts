import { $Promise, $UseRace, EncodeBase64, Serialize } from "../../core/Core";
import { AbstractServiceAdapter, ServiceConfig } from "./AbstractServiceAdapter";

export class PluginService extends AbstractServiceAdapter {

    private _source: any;
    private _commands: string[];

    constructor(name: string, config: ServiceConfig, source?: any) {

        super(name, config);

        /*if (source === undefined) {

            const controller = new AbortController();
            const { signal } = controller;

            this._commands = config.command.split(/\s+/g);
            const args: string[] = [...this._commands.slice(1), "--key--", this._key, "{{data}}", EncodeBase64(config)];

            this._source = source || fork(this._commands[0], args, { stdio: "pipe", signal });

        } else {

            this._source = source;

        } */

        this._source = require(config.command);

        if (this._source.construct) {

            this._source.construct(config);

        }

    }

    public write(header: Serialize, data: Serialize): void {

        // absolutely important to append a new line in case to many messages are concatenated 
        // sent before the process finally read.
        this._source.$signal(header, data);

    }

    public async $reset(data: Serialize, race?: number): Promise<Serialize> {

        const $race: $Promise<Serialize> = $UseRace(race || this._race);

        if (this._source.$reset instanceof Function) {

            this._source.$reset(data, race)
                .then($race[1])
                .catch($race[2]);

        } else {

            $race[1]({ service: this._name, reset: true });

        }

        return $race[0];

    }

    public async $signal(signal: string, data: Serialize, race: number): Promise<Serialize> {

        const $race: $Promise<Serialize> = $UseRace(race || this._race);

        if (this._source.$signal instanceof Function) {

            this._source.$signal(signal, data, race)
                .then($race[1])
                .catch($race[2]);

        } else {

            $race[1]({ signal, service: this._name });

        }
        
        return $race[0];

    }

}