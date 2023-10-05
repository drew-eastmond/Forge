import { Serialize } from "../../core/Core";
import { AbstractServiceAdapter, IServiceAdapter } from "../service/AbstractServiceAdapter";
import { GenericAction } from "./GenericAction";

export class ForkAction extends GenericAction {

    private _child;
    constructor(iService: IServiceAdapter, implement: string, data: any) {

        super(iService, implement, data);

    }

    protected _subscribeMessage(message: unknown): void {

        console.log("message pareent", message);

        this.notify("message", message);

    }

    protected _subscribeBroadcast(notify: string, header: any, data: Serialize): void {

        console.log("broadcast captured - ", notify);
        console.log(header);
        console.log(data);
        console.log("--------\n");

    }

}