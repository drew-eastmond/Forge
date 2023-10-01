export interface IPoolable {

	init(...rest: unknown[]): void;
	reclaim (): void;

}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export class PoolManager {

	private static __ClassMap: Map<unknown, Set<unknown>> = new Map<unknown, Set<unknown>>();

	// @-ts-expect-errors
	public static Instantiate<T>(constructor: Function | (new () => T), ...rest: unknown[]): T { // T["init"] extends Function ? Parameters<T["init"]> : unknown[]

		// Parameters<(T["init"])>

		let instance: any;
		let instanceSet: Set<unknown> = PoolManager.__ClassMap.get(constructor);
		if (instanceSet === undefined) {

			instanceSet = new Set();
			PoolManager.__ClassMap.set(constructor, instanceSet);

			instance = new (constructor as any)();

		} else {

			const iterator: Iterator<any> = instanceSet[Symbol.iterator]();
			instance = iterator.next().value;

			instanceSet.delete(instance);

			instance = instance || new (constructor as any)();

		}

		if (instance.init instanceof Function) {

			instance.init.apply(instance, rest);
		}

		return instance;

	}

	/* _this.isReclaimed = function (instance) {

		let classFunc = instance.constructor;

		// attach a GUID if the class definition does not currently have one
		if (dns.isEmpty(classFunc[_accessor])) {
			return false;
		}

		if (_objectMap[classFunc[_accessor]] instanceof Array) {

			if (_objectMap[classFunc[_accessor]].indexOf(instance) > -1) {

				return true;

			}

		} else {

			return false;

		}

		return false;
	}; */

	// reclaim an object to be used later
	public static Reclaim(instance: any) {

		const constructor = instance.constructor;

		// retrieve the `instanceList` from the instance's constructor
		let instanceSet: Set<unknown> = PoolManager.__ClassMap.get(constructor);
		if (instanceSet === undefined) {

			instanceSet = new Set<unknown>();
			PoolManager.__ClassMap.set(constructor, instanceSet);

		}

		instanceSet.add(instance);

	}

}