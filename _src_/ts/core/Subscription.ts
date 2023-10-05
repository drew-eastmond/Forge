import { IPoolable, PoolManager } from "./PoolManager";
import { Expiry } from "./Expiry";

export type Notification = string | RegExp | unknown;

export interface ISubscription {

	hasSubscription(value: Notification): boolean;
	subscribe(notify: Notification, callback: Function, once?: number): void;
	unsubscribe(callback: Function): void;
	notify(notify: Notification, ...rest: unknown[]): void;
	$notify(notify: Notification, ...rest: unknown[]): Promise<void>;
	clear(): void;

	$listen(notify: unknown, callback: Function, expiry: Expiry): Promise<unknown>;
	
}

/**
 * If this class is returned from any notifcation dispatch then unsubscribe.
 * 
 * @class
 */
export const Unsubscribe: unknown = new class { };

/**
 * The Subscription class is a core class for implementing the notification pattern via `subscribe` and `notify` members.
 * This class also has other utility members like $listen for waiting for an notification, and async versions of critical members
 * 
 * @class
 */
export class Subscription implements ISubscription, IPoolable {

	private readonly _subscriberMap: Map<Function, Notification> = new Map<Function, Notification>();
	private readonly _countMap: Map<Function, number> = new Map();
	private readonly _unsubscribeSet: Set<Function> = new Set();

	/**
	 * Called by the `PoolManager.instantiate(...) to retrieve an instance
	 * 
	 * @param rest {...unknown[]} I used the ...rest parameter for inheritance
	 * @implements {IPoolable}
	 */
	public init(...rest: unknown[]): void;
	public init () : void {

		this._subscriberMap.clear();

	}

	/**
	 * Allows the intsance to be return to a pool.
	 * 
	 * @param rest {...unknown[]} I used the ...rest parameter for inheritance
	 * @implements {IPoolable}
	 */
	public reclaim(): void {

		this._subscriberMap.clear();

		PoolManager.Reclaim(this);

	}

	/**
	 * Checks the subscriber store for the 
	 * `hasSubscription` is mindful of subclasses that use `has` member
	 * 
	 * @param value {Notification} Value to cast to string and compare.
	 * @returns {boolean}
	 */
	public hasSubscription(value: Notification): boolean {

		for (const [callback, notify] of this._subscriberMap) {

			// convert to string to match values. Need to implement toString() for equality
			if (String(notify) == String(value)) {

				return true;

			}

		}

		return false;

	}

	/**
	 * 
	 * 
	 * @param notify {Notification} A key used to invoke the supplied delegate.
	 * @param delegate {Function} The delegate called
	 * @param once {boolean} Deletes the notication entry once it been dispatched
	 */
	public subscribe(notify: Notification, delegate: Function, count?: number): void {

		// make sure delegate is a function
		if (delegate === undefined) throw new Error(`Subscription.subscribe( ... ) : delegate passed is not a function ${delegate}`);

		// if count has been supplied then add an entry to the countMap. When its done unsubscribe
		if (count !== undefined) this._countMap.set(delegate, count);
		

		// alright assign what ever delegate
		this._subscriberMap.set(delegate, notify);

	}

	public unsubscribe(delegate: Function): void {

		this._subscriberMap.delete(delegate);

	}

	public notify(notify: Notification, ...rest: unknown[]): void {

		for (const [delegate, query] of this._subscriberMap) {

			// check for RegExp notifications,b cause they obviously need to be match
			if (query instanceof RegExp && notify.constructor == String) {

				if (query.test(notify as string)) {

					// if the delegate return the unique value of `Unsubscribe` or in the onceMap. Then add the dele
					const result: unknown = delegate(notify, ...rest);
					if (result === Unsubscribe) {

						this._unsubscribeSet.add(delegate);

					} else if (this._countMap.has(delegate)) {

						const count: number = this._countMap.get(delegate) - 1;
						if (count < 1) {

							this._unsubscribeSet.add(delegate);
							this._countMap.delete(delegate);

						}

					}
				}

			// do a strict match so you can use any values.
			} else if (query === notify) {

				const result: unknown = delegate(notify, ...rest);
				if (result === Unsubscribe || this._countMap.has(delegate)) this._unsubscribeSet.add(delegate);

			}

		}

		// get rid of all `delegates` that match the unsubscribe crieria, then clear the `this._unsubscribeSet`
		for (const delegate of this._unsubscribeSet) {

			this._subscriberMap.delete(delegate);

		}
		this._unsubscribeSet.clear();

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
	public $listen(notify: unknown, callback: Function, race: number): Promise<unknown>
	public $listen(notify: unknown, callback: Function, race?: number): Promise<unknown> {

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

			if (race === undefined) return;

			setTimeout(function () {

				reject(new Error(`Subscription.$listen( "${notify}", ... ) has rejected on race timeout : ${race}`));

			}, race);

		});

	}
}