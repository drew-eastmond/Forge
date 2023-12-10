import { Serialize } from "../../core/Core";
import { ForgeStream } from "../ForgeStream";
import { IAction } from "./ForgeAction";

export enum ResolverValues {
    Any = "any",
    All = "all"
}

type ActionSearch = { task?: string | undefined, action: string };

export type TriggerData = (
    { signal: string[] } |
    { watch: (RegExp | string)[] } |
    { "resolves:any": ActionSearch[] } |
    { "resolves:all": ActionSearch[] }
);
export interface IForgeTrigger {

    $trigger(forgeStream: ForgeStream): Promise<boolean>;

}

export function ParseTrigger(triggerData: TriggerData): IForgeTrigger {

    if ("signal" in triggerData) {

        return new SignalTrigger(triggerData.signal as string[]);

    } else if ("watch" in triggerData) {

        const watches: RegExp[] = triggerData.watch.map(WatchTrigger.ParseWatch);
        return new WatchTrigger(watches);

    } else if ("resolves:any" in triggerData) {

        const resolves: ActionSearch[] = triggerData["resolves:any"];
        return new ResolveTrigger(ResolverValues.Any, resolves as ActionSearch[]);

    } else if ("resolves:all" in triggerData) {

        const resolves: ActionSearch[] = triggerData["resolves:all"];
        return new ResolveTrigger(ResolverValues.All, resolves as ActionSearch[]);

    } else {

        throw new Error("Trigger Data in incorrect");

    }

    /* (
        { signal: string[] } |
        { watch: RegExp[] } |
        {
            circuit: "and" | "or",
            resolves: { task?: string | undefined, action: string }[]
        }
    )[], */

}

export class SignalTrigger implements IForgeTrigger {

    private _signals: Set<string>;
    constructor(signal: string[]) {

        this._signals = new Set(signal);

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        return this._signals.has(forgeStream.signal);

    }

}

export class WatchTrigger implements IForgeTrigger {

    public static ParseWatch(watch: string | RegExp): RegExp {

        if (watch.constructor == String) {

            // capture `**/*` or `**\*` glob wildcard for file watching
            if (/\*\*[\/\\]\*\.\*/.test(watch)) {

                watch = watch.replace(/[\/\\]\*\*[\/\\]\*$/, "((.+?)[\\\/\\\\].+?)");

            // capture `/*` or `\*` glob wildcard for file watching
            } else if (/[\/\\]\*/.test(watch)) {

                watch = watch.replace(/[\/\\]\*\*[\/\\]\*/g, "[\\\/\\\\](.+?)");

            } 

            return new RegExp(watch);

        }

        return watch as RegExp;

    }

    private _regExps: RegExp[];

    constructor(regExps: RegExp[]) {

        this._regExps = regExps;

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        const file: string = forgeStream.data.file as string;

        for (const regExp of this._regExps) {

            if (regExp.test(file)) return true;

        }

        return false;

    }

}

export class ResolveTrigger implements IForgeTrigger {

    private _resolver: ResolverValues;
    private _resolves: { task?: string | undefined, action: string }[];

    constructor(resolver: ResolverValues, resolves: { task?: string | undefined, action: string }[]) {

        this._resolver = resolver;
        this._resolves = resolves;

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        const file: string = forgeStream.data.file as string;

        if (this._resolver == ResolverValues.Any) {

            for (let { task, action } of this._resolves) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.settled.has(iAction)) return true;

            }

        } else if (this._resolver == ResolverValues.All) {

            let allSettled: boolean = true;
            for (let { task, action } of this._resolves) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.settled.has(iAction) === false) allSettled = false;

            }


        }

        return false;

    }
    
}

export class RejectTrigger implements IForgeTrigger {

    private _resolver: ResolverValues;
    private _resolves: { task?: string | undefined, action: string }[];

    constructor(resolver: ResolverValues, resolves: { task?: string | undefined, action: string }[]) {

        this._resolver = resolver;
        this._resolves = resolves;

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        const file: string = forgeStream.data.file as string;

        if (this._resolver == ResolverValues.Any) {

            for (let { task, action } of this._resolves) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.rejections.has(iAction)) return true;

            }

        } else if (this._resolver == ResolverValues.All) {

            let allSettled: boolean = true;
            for (let { task, action } of this._resolves) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.rejections.has(iAction) === false) allSettled = false;

            }


        }

        return false;

    }
    
}

export class SettledTrigger implements IForgeTrigger {

    private _resolver: ResolverValues;
    private _allSettled: { task?: string | undefined, action: string }[];

    constructor(resolver: ResolverValues, resolves: { task?: string | undefined, action: string }[]) {

        this._resolver = resolver;
        this._allSettled = resolves;

    }

    public async $trigger(forgeStream: ForgeStream): Promise<boolean> {

        const file: string = forgeStream.data.file as string;

        if (this._resolver == ResolverValues.Any) {

            for (let { task, action } of this._allSettled) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.settled.has(iAction)) return true;

            }

        } else if (this._resolver == ResolverValues.All) {

            let allSettled: boolean = true;
            for (let { task, action } of this._allSettled) {

                const iAction: IAction = forgeStream.find(task, action);

                if (forgeStream.settled.has(iAction) === false) allSettled = false;

            }


        }

        return false;

    }


}