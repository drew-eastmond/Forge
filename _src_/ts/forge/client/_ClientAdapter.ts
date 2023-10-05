import { Serialize } from "../../core/Core";
import { AbstractServiceAdapter, IServiceAdapter } from "../service/AbstractServiceAdapter";


class ClientAdapter extends AbstractServiceAdapter {

    constructor(config: { key: string, race: number }) {

        super(config);



    }

}

class ClientSpawnAdapter extends ClientAdapter {

    constructor(config: { key: string, race: number }) {

        super(config);



    }

    public write(header: Serialize, ...data: Serialize[]): void {


    }

}

class ClientForkAdapter extends ClientAdapter {

    constructor(config: { key: string, race: number }) {

        super(config);



    }

    public write(header: Serialize, ...data: Serialize[]): void {


    }

}

class ClientWorkerAdapter extends ClientAdapter {

    constructor(config: { key: string, race: number }) {

        super(config);



    }

    public write(header: Serialize, ...data: Serialize[]): void {


    }

}