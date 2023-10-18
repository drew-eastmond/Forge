import { Tree } from "../../core/collection/Tree";
import { Attributes } from "../../core/Core";
import { ForgeStore } from "./ForgeModel";

const $fs = require("$fs");
export interface IForgeStorageStream {



}

export class FileStorageStream {

    private _$buffer: Promise<Buffer>;

    constructor(file: string, options : { format: string }) {

        this._$buffer = $fs.readFile(file);

    }

    public async $resolve(tree: Tree): Promise<Iterable<ForgeStore>> {

        const buffer: Buffer = await this._$buffer;

        // right now i only supprt json data
        const json: {
            stores: Record<string, { buffer: Buffer, attributes: Attributes }>,
            topology: Record<string, string>
        } = JSON.parse(String(buffer));

        // loop though each key and reserve a ForgeStore instance. The topology can be resolve on a second run
        const forgeStores: Map<string, ForgeStore> = new Map();
        for (const [key, { buffer, attributes }] of Object.entries(json.stores)) {

            forgeStores.set(key, new ForgeStore(buffer, attributes))

        }

        // 

        return 
        
    }

    public async $write(buffer: Buffer): Promise<void> {



    }

}