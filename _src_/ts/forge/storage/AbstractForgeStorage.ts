import { $Promise, Serialize } from "../../core/Core";

interface IForgeStorage {

    

}

export class ForgeStorage implements IForgeStorage {

    private _in: Serialize[];
    private _out: Serialize[];

    private _$ready: $Promise<this>;

    constructor() {

    }

    public async *[Symbol.asyncIterator](): AsyncGenerator<Serialize, any, unknown> {

        this._$ready[0];

        for (const serialize of this._in) {

            yield serialize;

        }

    } 

    public async $write(serialize: Serialize): Promise<void> {



    }

    public async $read(): Promise<Serialize> {

        return {};

    }

    public async $flush(): Promise<this> {

        return this;

    }

}