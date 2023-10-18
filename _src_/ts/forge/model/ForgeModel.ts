import { Tree } from "../../core/collection/Tree";
import { Attributes } from "../../core/Core";
import { ForgeServer } from "../server/ForgeServer";

type ForgeStoreAttributes = Attributes & { name: string };
export interface IForgeModel {

    next(forgeStore: ForgeStore): number;

    connect(forgeServer: ForgeServer): this;

    // create
    $create(buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;
    $fork(forgeStore: ForgeStore, buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;

    // update
    $update(forgeStore: ForgeStore, buffer: Buffer): Promise<void>;

    // delete
    $delete(forgeStore: ForgeStore): Promise<void>;

    // read
    $query(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean): Promise<ForgeStore[]>
    $traverse(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, parent: ForgeStore): Promise<ForgeStore[]>;

    $load(...rest: unknown[]): Promise<this>;
    $save(...rest: unknown[]): Promise<this>;

    $flush(): Promise<unknown>;

}


export class ForgeStore {

    private _iForgeModel: IForgeModel;

    private _id: number;

    private _buffer: Buffer;
    private _attributes: Attributes;


    constructor(buffer: Buffer, attributes: Attributes) {

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

        this._iForgeModel.$update(this, this._buffer)

    }

    public attributes(): Attributes {

        return this._attributes;

    }

    public model(iForgeModel: IForgeModel): this {

        this._iForgeModel = iForgeModel;
        this._id = this._iForgeModel.next(this);
        return this;

    } 

    public async $fork(buffer: Buffer, attributes: Attributes): Promise<ForgeStore> {

        return this._iForgeModel.$fork(this, buffer, attributes);

    }

    public async $push(buffer: Buffer): Promise<void> {

    } 

    public async $pull(...queries: IQuery[]): Promise<void> {

        this._iForgeModel.$pull();


    }

    public async $query(): IQuery {





    }


}

export class ForgeModel implements IForgeModel {

    private _count: number = 0;

    protected readonly _root: ForgeStore = new ForgeStore(new Buffer(), { root: true });
    protected readonly _idMap: Map<number, ForgeStore> = new Map();
    protected readonly _tree: Tree<ForgeStore> = new Tree ();

    protected readonly _queryManager: QueryManager<ForgeStore> = new QueryManager();
    
    constructor() {

        this._tree.add(this._root);

    }

    $traverse(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, forgeStore: ForgeStore): Promise<ForgeStore[]> {
        throw new Error("Method not implemented.");
    }

    public *[Symbol.iterator] (): IterableIterator<ForgeStore> {

        for (const entry of this._tree) {

            yield entry;

        }

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

    public async $fork(parentStore: ForgeStore, buffer: Buffer, attributes: Attributes): Promise<ForgeStore> {

        const childStore: ForgeStore = new ForgeStore(buffer, attributes);

        this._tree.add(childStore, parentStore);

        return childStore;

    }

    // update
    public async $update(forgeStore: ForgeStore): Promise<void> {

    }

    // delete
    public async $delete(forgeStore: ForgeStore): Promise<void> {

        this._tree.remove(forgeStore);

    }

    /* public async $traverse($delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, ...rest: unknown[]): Promise<ForgeStore[]> {

        const results: ForgeStore[] = [];
        for (const forgeStore of this._tree) {

            if (await $delegate(forgeStore, ...rest) === true) results.push(forgeStore);

        }

        return results;

    } */

    public connect(ForgeServer: ForgeServer): this {
        
        return this;
        
    }

    public $flush(): Promise<void> {

        return;
        
    }

    public query(parent: ForgeStore): ForgeStore[] {



        return;

    }

    public async $load(): Promise<this> {

        return this;

    }

    public async $save(): Promise<this> {

        return this;

    }

}

        // read
/* $query(delegate: (forgeStore: ForgeStore, ...rest: unknown[]) => boolean, ...rest: unknown[]): Promise<ForgeStore[]> {

    const results: ForgeStore[] = [];
    for (const forgeStore of this._tree) {

        if (delegate(forgeStore, ...rest)) results.push(forgeStore);

    }

} */