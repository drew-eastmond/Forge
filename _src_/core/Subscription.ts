import { IPoolable, PoolManager } from "./PoolManager";
import { Expiry } from "./Expiry";

export type Notification = string | RegExp | unknown;

export interface ISubscription {

	hasSubscription(value: Notification): boolean;
	subscribe(notify: Notification, callback: Function, once?: boolean): void;
	unsubscribe(callback: Function): void;
	notify(notify: Notification, ...rest: unknown[]): void;
	$notify(notify: Notification, ...rest: unknown[]): Promise<void>;
	clear(): void;

	$listen(notify: unknown, callback: Function, expiry: Expiry): Promise<unknown>;
	
}

export class Subscription implements ISubscription, IPoolable {

	private _subscriberMap: Map<Function, Notification> = new Map<Function, Notification>();

	public init(...rest: unknown[]): void;
	public init () : void {

		this._subscriberMap.clear();

	}

	public reclaim(): void {

		this._subscriberMap.clear();

		PoolManager.Reclaim(this);

	}

	public hasSubscription(value: Notification): boolean {

		for (const [callback, notify] of this._subscriberMap) {

			if (notify == value) {

				return true;

			}

		}

		return false;

	}

	public subscribe(notify: Notification, callback: Function, once?: boolean): void {

		if (once === true) {

			const onceCallback : Function = callback;

			callback = function (...rest: unknown[]) {

				this._subscriberMap.delete(onceCallback);

				return onceCallback(...rest);

			}.bind(this);

		}

		this._subscriberMap.set(callback, notify);

	}

	public unsubscribe (callback: Function): void {

		this._subscriberMap.delete(callback);

	}

	public notify(notify: Notification, ...rest: unknown[]): void {

			// cloning the original array. Now we will guarantee to call each callback even if we reclaim mid notify
		const callbacks = Array.from(this._subscriberMap);

		for (const [callback, query] of callbacks) {

			if (query instanceof RegExp && notify.constructor == String) {

				if (query.test(notify as string)) {

					const result: unknown = callback(notify, ...rest);
					if (result === this.unsubscribe) this.unsubscribe(callback);

				}

			} else if (query === notify) {

				const result: unknown = callback(notify, ...rest);
				if (result === this.unsubscribe) this.unsubscribe(callback);

			}

		}

	}

	public async $notify(notify: Notification, ...rest: unknown[]): Promise<void> {

		for (const [callback, query] of this._subscriberMap) {

			if (query instanceof RegExp) {

				if (query.test(notify as string) && notify.constructor == String) {

					const result: unknown = await callback(notify, ...rest);
					if (result === this.unsubscribe) this.unsubscribe(callback);

				}

			} else if (query === notify) {

				const result: unknown = await callback(notify, ...rest);
				if (result === this.unsubscribe) this.unsubscribe(callback);

			}

		}

	}

	public clear(): void {

		this._subscriberMap.clear();

	}


	public $listen(notify: unknown, callback: Function): Promise<unknown>
	public $listen(notify: unknown, callback: Function, expiry: Expiry): Promise<unknown>
	public $listen(notify: unknown, callback: Function, expiry?: Expiry): Promise<unknown> {

		const _this: this = this;

		return new Promise(function (resolve: Function, reject: Function): void {

			const subscribeForCallback: Function = function (...rest: unknown[]): unknown {

				const result: boolean = callback(...rest);
				if (result === true) {

					resolve(result);
					return _this.unsubscribe; // returning `this.unsubscribe` will unsubscribe callback

				}

			};

			_this.subscribe(notify, subscribeForCallback);

			if (expiry === undefined) return;

			expiry.use$()
				.then(reject as (value: unknown) => unknown);

		});

	}
}