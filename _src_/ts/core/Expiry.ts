import { $Promise, $UsePromise, IntervalClear, TimeoutClear } from "./Core";

const __CallbackMap: Map<number, Set<IntervalCallback>> = new Map<number, Set<IntervalCallback>>();
const __IntervalMap: Map<number, IntervalClear> = new Map<number, IntervalClear>();

class IntervalCallback {

    public delay: number;

    public callback: Function;
    constructor(callback: Function, delay: number) {

        this.callback = callback;
        this.delay = delay;

    }

}

function __AddInterval(intervalCallback: IntervalCallback): void {

    const delay: number = intervalCallback.delay;

    if (__CallbackMap.has(delay) === false) {

        __CallbackMap.set(delay, new Set<IntervalCallback>());
        __IntervalMap.set(delay, setInterval(function () {

            const intervalCallbackSet: Set<IntervalCallback> = __CallbackMap.get(delay);
            for (const intervalCallback of intervalCallbackSet) {

                intervalCallback.callback();

            }

        }, delay));
        

    }

    __CallbackMap.get(delay).add(intervalCallback);

}

function __RemoveInterval(intervalCallback: IntervalCallback): void {

    const delay: number = intervalCallback.delay;
    // const interval: IntervalClear = __IntervalMap.get(delay);

    const intervalCallbackSet: Set<IntervalCallback> = __CallbackMap.get(delay)
    intervalCallbackSet.delete(intervalCallback);

    if (intervalCallbackSet.size == 0 ) {

        const intervalClear: IntervalClear = __IntervalMap.get(delay);
        clearInterval(intervalClear);

        __CallbackMap.delete(delay)
        __IntervalMap.delete(delay);

    }

}

export class ExpiryTime {
    public time: number;
}

export class Expiry {

    public static DefaultInterval: number = 25;

    public _time: number;

    private _$complete: $Promise<this>;
    private _timeout: TimeoutClear;

    private readonly _intervalCallbackSet: Set<IntervalCallback> = new Set<IntervalCallback>();

    constructor(expiry?: ExpiryTime | number | Date) {

        if (expiry === undefined) expiry = Date.now();

        switch (expiry.constructor) {

            case Date:
                this._time = (expiry as Date).getTime();
                break;

            case Object:
                this._time = (expiry as ExpiryTime).time;
                break;

            case Number:
                this._time = Date.now() + (expiry as number);
                break;

        }

        this._$complete = $UsePromise();

        this._intervalCallbackSet.clear();

    }

        // IPoolable traits

    public unwrap(): number {

        return this._time;

    }

    public time(timestamp: ExpiryTime): this {

        this._time = timestamp.time;

        return this;

    }

    public delay(delay: number): this {

        this._time = Date.now() + delay;

        return this;

    }

    public date(date: Date): this {

        this._time = date.getTime();

        return this;

    }

    public use$(): Promise<this>;
    public use$(intervalCallback?: IntervalCallback): Promise<this>;
    public use$(intervalCallback?: IntervalCallback): Promise<this> {

        // make sure to only call once
        if (this._timeout === undefined) {

            const _this: this = this;

            const waitDelay: number = Math.max(0, this._time - Date.now());
            this._timeout = setTimeout(function () {

                _this._$complete[1](_this);
                _this.clear();

            }, waitDelay);

        }

        if (intervalCallback === undefined) return this._$complete[0];

        this._intervalCallbackSet.add(intervalCallback);
        __AddInterval(intervalCallback);

        return this._$complete[0];

    }

    public clear(): void {

        clearTimeout(this._timeout);
        this._timeout = undefined;

        this._$complete[2](new Error("Cleared"));
        this._$complete = undefined;

        for (const intervalCallback of this._intervalCallbackSet) {

            __RemoveInterval(intervalCallback);

        }

        this._intervalCallbackSet.clear();

    }

}