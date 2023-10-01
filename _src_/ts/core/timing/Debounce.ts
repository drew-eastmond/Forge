type DebounceEntry = { previous: number, parameters: unknown[], timeout: TimeoutClear | number, delay: number };

export class Debouncer {

    private _callbackMap: Map<Function, DebounceEntry> = new Map();

    constructor() {

    }

    private _onTimeout = function() {

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

    }.bind(this);

	public debounce(callback: Function, parameters: unknown[], delay: number): void {

		if (this._callbackMap.has(callback)) {

			const now: number = Date.now();
			const debounceEntry: DebounceEntry = this._callbackMap.get(callback);

			if (now < debounceEntry.previous + debounceEntry.delay) {

				clearTimeout(debounceEntry.timeout);

			}

            debounceEntry.timeout = setTimeout();

		} else {

			const timeout: TimeoutClear = setTimeout(this._onTimeout);
			this._callbackMap.set(callback, { previous: Date.now(), parameters, delay, timeout });

		}

	}

    public reset(): void {

        for (const [callback, debounceEntry] of this._callbackMap) {

            clearTimeout(debounceEntry.timeout);

        }
        this._callbackMap.clear();

    }

}