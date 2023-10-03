import { CLIArguments } from "../../core/Argument";
import { Serialize } from "../../core/Core";
import { ISubscription } from "../../core/Subscription";
import { AbstractServiceAdapter, IServiceAdapter } from "../service/AbstractServiceAdapter";


class ClientAdapter extends AbstractServiceAdapter {

    constructor(config: { race: number }) {

        super(config);



    }

}

class ClientSpawnAdapter extends CLIArguments { 



}

class ClientForkAdapter extends CLIArguments {



}

class ClientWorkerAdapter extends CLIArguments {



}