import { Tree } from "../../core/collection/Tree";
import { Attributes } from "../../core/Core";

type ForgeStoreAttributes = Attributes & { name: string };
interface IForgeStorage {

    next(): number;

    // create
    $create(buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;
    $fork(forgeStore: ForgeStore, buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;

    // update
    $update(forgeStore: ForgeStore, buffer: Buffer): Promise<void>;

    // delete
    $delete(forgeStore: ForgeStore): Promise<void>;

    // read
    // $query(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean): Promise<ForgeStore[]>
    $traverse(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, forgeStore: ForgeStore): Promise<ForgeStore[]>;


}


class ForgeStore {

    private _id: number;

    private _iForgeStorage: IForgeStorage;
    private _buffer: Buffer;
    private _attributes: Attributes;



    constructor(iForgeStorage: IForgeStorage, buffer: Buffer, attributes: Attributes) {

        this._iForgeStorage = iForgeStorage;
        this._id = iForgeStorage.next();

        this._buffer = buffer;
        this._attributes = attributes;

    }

    /*
    * Getters and Setters
    */

    public $buffer(): Buffer;
    public $buffer(buffer: Buffer): Buffer;
    public $buffer(buffer?: Buffer): Buffer {

        if (buffer === undefined) return this._buffer;

        this._iForgeStorage.$update(this, this._buffer)

    }

    public attributes(): Attributes {

        return this._attributes;

    }

    public async $fork(buffer: Buffer, attributes: Attributes): Promise<ForgeStore> {

        return this._iForgeStorage.$fork(this, buffer, attributes);

    }

    public async $save(): Promise<Buffer> {

    } 

    public async $load(buffer: Buffer): Promise<void> {



    }


}

class AbstractStorage implements IForgeStorage {

    private _count: number = 0;

    protected readonly _idMap: Map<number, ForgeStore> = new Map();
    protected readonly _tree: Tree<ForgeStore> = new Tree();
    
    constructor() {

    }

    public next(): number {

        return this._count++;

    }

    public get(id: number): ForgeStore {

        return this._idMap.get(id);

    }

    /**
     * 
     * @param buffer
     * @param attributes
     */
    public async $create(buffer: Buffer, attributes: Attributes & { name : string }): Promise<ForgeStore> {

        const forgeStore: ForgeStore = new ForgeStore(buffer, attributes);

        this._tree.add(forgeStore);

        return forgeStore;

    }

    public async $fork(forgeStore: ForgeStore, buffer: Buffer, attributes: Attributes): Promise<ForgeStore> {

        const childStore: ForgeStore = new ForgeStore(this, buffer, attributes);

        this._tree.add(childStore, forgeStore);

        return childStore;

    }

    // update
    $update(forgeStore: ForgeStore): Promise<void> {

    }

    // delete
    public async $delete(forgeStore: ForgeStore): Promise<void> {

        this._tree.remove(forgeStore);

    }

    public async $traverse($delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, ...rest: unknown[]): Promise<ForgeStore[]> {

        const results: ForgeStore[] = [];
        for (const forgeStore of this._tree) {

            if (await $delegate(forgeStore, ...rest) === true) results.push(forgeStore);

        }

        return results;

    }

}

        // read
/* $query(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, ...rest: unknown[]): Promise<ForgeStore[]> {

    const results: ForgeStore[] = [];
    for (const forgeStore of this._tree) {

        if (delegate(forgeStore, ...rest)) results.push(forgeStore);

    }

} */