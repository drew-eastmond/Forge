type DebounceEntry = { parameters: unknown[], timeout: TimeoutClear | number, delegate: Function };

export class Debouncer {

    private readonly _callbackMap: Map<Function, DebounceEntry> = new Map();

    constructor() {



    }

    /* private _onBounce = function() {

        const now: number = Date.now();

        const callbacks: Function[] = []; 
        for (const [callback, debounceEntry] of this._callbackMap) {
            
            const expiry: number = debounceEntry.previous + debounceEntry.delay;
            if (expiry < now) {

                clearTimeout(debounceEntry.timeout);
                callback(...debounceEntry.parameters);
				callbacks.push(callback);

			}

        }

        for (const callback of callbacks) {

            this._callbackMap.delete(callback);

        }

    }.bind(this); */

    public debounce(delegate: Function, parameters: unknown[], delay: number): void {

		if (this._callbackMap.has(delegate) === false) {
			
            const debounceEntry: DebounceEntry = {
                parameters,
                timeout: null,
                delegate: null
            };

            debounceEntry.delegate = function () {

                delegate(...debounceEntry.parameters);

            };

            this._callbackMap.set(delegate, debounceEntry);

        }

        const debounceEntry: DebounceEntry = this._callbackMap.get(delegate);
        debounceEntry.parameters = parameters;

        clearTimeout(debounceEntry.timeout);
        debounceEntry.timeout = setTimeout(debounceEntry.delegate, delay);

	}

    public reset(): void {

        for (const [callback, debounceEntry] of this._callbackMap) {

            clearTimeout(debounceEntry.timeout);

        }

    }

    public clear(): void {

        this.reset();
        this._callbackMap.clear();

    }

}