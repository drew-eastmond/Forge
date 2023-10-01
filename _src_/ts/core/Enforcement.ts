import { ArgumentError, RunTimeError } from "../core/error/Error";

type EnforceableValue = unknown | Promise<unknown>;
type EnforceableInquiry = Promise<unknown> | (($value: EnforceableValue) => Promise<unknown>);

export function $Enforce<T = unknown[]>($values: EnforceableValue[], $inquiries: EnforceableInquiry): Promise<T>;
export function $Enforce<T = unknown[]>($values: EnforceableValue[], $inquiries: EnforceableInquiry[]): Promise<T>;
export function $Enforce<T = unknown[]>(overloadA: EnforceableValue[] | Iterable<[EnforceableValue, EnforceableInquiry]>, overloadB?: EnforceableInquiry | EnforceableInquiry[]): Promise<T> {

	let $values: EnforceableValue[];
	let $inquiries: EnforceableInquiry[];

	if (Symbol.iterator in overloadA && overloadB === undefined) {

		$values = [];
		$inquiries = [];

		for (const [$value, $inquiry] of overloadA as Iterable<[EnforceableValue, EnforceableInquiry]>) {

			$values.push($value);
			$inquiries.push($inquiry);

		}

	} else if (overloadA && (overloadB instanceof Promise || overloadB instanceof Function)) {

		$values = overloadA as EnforceableValue[];
		$inquiries = [];

		for (let i: number = 0; i < $values.length; i++) {

			$inquiries.push(overloadB as EnforceableInquiry);

		}

	} else if (overloadA instanceof Array && overloadB instanceof Array && overloadA.length == overloadB.length) {

		$values = overloadA as EnforceableValue[];
		$inquiries = overloadB as EnforceableInquiry[];

	} else {

		throw new ArgumentError(`Parameters are incorrenct for $Enforce(${overloadA}, ${overloadB}));`);

	}

	return new Promise<T>(async function (resolve, reject) {

		const $enforcement: Enforcement = new Enforcement($values, $inquiries);

		await $enforcement.$enforce();

		$enforcement.$finalize(resolve, reject);

	});

};

export function Enforce(values, inquiries) {

}

function __$FinalizeEveryRejection(value: unknown, index: number, array: unknown[]): boolean {

	console.warn("checking", value);

	return (value === undefined);

}

class Enforcement {

	public $values: EnforceableValue[];
	public $inquiries: EnforceableInquiry[];
	public resolves: unknown[];
	public rejections: unknown[];
	public all: unknown[];


	constructor($values: EnforceableValue[], $inquiries: EnforceableInquiry[]) {

		this.$values = $values;
		this.$inquiries = $inquiries;

		this.resolves = [];
		this.rejections = [];
		this.all = [];

	}

	private _thenAllSettle = function (results) {

		console.log(results);

		for (const result of results) {

			this.all.push(result);

			if (result.status == "fulfilled") {

				this.resolves.push(result.value);
				this.rejections.push(undefined);

			} else {

				this.resolves.push(undefined);
				this.rejections.push(result.reason);

			}

		}

	}.bind(this);

	public async $enforce() {

		const $promises = [];

		for (let i: number = 0; i < this.$values.length; i++) {

			const $value: EnforceableValue = this.$values[i];
			const $inquiry: EnforceableInquiry = this.$inquiries[i];

			let $result;
			if ($inquiry instanceof Function) {

				$result = $inquiry($value);
				$result = ($result instanceof Promise) ? $result : Promise.resolve($result);

			} else if ($inquiry instanceof Promise) {

				$result = Promise.race([$value, $inquiry]);



			} else {

				throw new RunTimeError(`Enforcement.$enforce() has been passed an invalid inquiry : ${$inquiry}`);

			}

			$promises.push($result);

		}

		console.error("all settled", $promises);
		return Promise.allSettled($promises)
			.then(this._thenAllSettle);

	}

	public $render($result): void {

		$result
			.then(function (value) {

				// console.log ( "%cENFORCEMENT RESOLVE", 'background: #bada55; color: #000055', value );

			})
			.catch(function (value) {

				console.error("%cENFORCEMENT REJECT", 'background: #bada55; color: #000055', value);

			});

	}

	public $finalize(resolve: Function, reject: Function): void {

		console.log("finalize", this.rejections, this.resolves, this.all);

		if (this.rejections.every(__$FinalizeEveryRejection)) {

			console.log("RESOLVING");

			resolve(this.resolves);

		} else {

			console.log("REJECTING");

			reject(this.rejections);

		}

	}

}