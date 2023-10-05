export class Tree<T = unknown> {

	private _instanceSet: Set<T> = new Set();

	private _parentMap: Map<T, T> = new Map();
	private _childMap: Map<T, Set<T>> = new Map();

	public *[Symbol.iterator](): Iterator<T> {

		for (const instance of this._instanceSet) {

			yield instance;

		}

	} 

	public traverse(instance: T, traversal?: Set<T>): Set<T> {

		traversal = traversal || new Set();

		traversal.add(instance);

		const children: Set<T> = this._childMap.get(instance);
		for (const child of children) {

			if (traversal.has(child) === false) {

				this.traverse(child, traversal);

			}

		}

		return traversal;

	}

	public add(instance: T): this {

		this._instanceSet.add(instance);

		return this;

	}

	public remove(instance: T): this {

		this._instanceSet.delete(instance);
		this._childMap.delete(instance);
		this._parentMap.delete(instance);

		return this;

	}

	public parent(instance: T): T {

		return this._parentMap.get(instance);

	}

	public children(instance: T): Set<T> {

		return this._childMap.get(instance);

	}

	public siblings(instance: T): Set<T> {

		const parent: T = this._parentMap.get(instance);

		const siblings: Set<T> = new Set(this._childMap.get(parent));
		siblings.delete(instance);

		return siblings;

	}

	public compile(): void {

		for (const entry of this._childMap) {

			const set: Set<T> = entry[1];
			set.clear();

		}

		for (const instance of this._instanceSet) {

			const parent: T = this._parentMap.get(instance);

			const children: Set<T> = this._childMap.get(parent);
			children.add(instance);

		}

	}

	public ancestry(instance: T) : T[] {

		const ancestry: T[] = [];

		let parent: T = instance;
		while (parent !== this as unknown as T && parent !== undefined) {

			ancestry.unshift(parent);
			parent = this._parentMap.get(parent);
			
		}

		return ancestry;

	}

	public depth(): number {

		let maxDepth: number = 0;
		for (const instance of this._instanceSet) {

			let depth: number = 1;
			let parent: T = this._parentMap.get(instance);
			while (parent !== this as unknown as T) {

				parent = this._parentMap.get(parent);
				depth++;

			}

			maxDepth = Math.max(depth, maxDepth);

		}

		return maxDepth;
	}

	public has(instance: T): boolean {

		return this._instanceSet.has(instance);

	}

	public clear(): T[] {

		const instances: T[] = Array.from(this._instanceSet);

		this._instanceSet.clear();
		this._childMap.clear();
		this._parentMap.clear();

		return instances;

	}

}