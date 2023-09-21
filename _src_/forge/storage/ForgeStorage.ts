import { Attributes } from "../../core/Core";


interface IForgeStorage {

    next(iForgeStorage): number;

    // create
    $create(buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;
    $fork(forgeStorageNode: ForgeStore, buffer: Buffer, attributes: Attributes): Promise<ForgeStore>;

    // update
    $update(forgeStorageNode: ForgeStore, buffer: Buffer, attributes?: Attributes): Promise<void>;

    // delete
    $delete(forgeStorageNode: ForgeStore): Promise<void>;

    // read
    $query(delegate: (ForgeStorageNode: ForgeStore, attributes: Attributes) => boolean): Promise<ForgeStore[]>
    $traverse(delegate: (ForgeStorageNode: ForgeStore, attributes: Attributes) => boolean, forgeStorageNode: ForgeStore): Promise<ForgeStore[]>;


}


class ForgeStore {

    private _id: number;

    private _iForgeStorage: IForgeStorage;
    private _buffer: Buffer;
    private _attributes: Attributes;

    constructor(iForgeStorage: IForgeStorage, buffer: Buffer, attributes: Attributes) {

        this._id = iForgeStorage.next(this);

        this._buffer = buffer;
        this._attributes = attributes;

    }

    /*
    * Getters and Setters
    */


    public async $fork(buffer: Buffer, attributes: Attributes): Promise<ForgeStore> {

        return this._iForgeStorage.$fork(this, buffer, attributes);

    }

}

class AbstractStorage {

    constructor() {

    }

    public

}