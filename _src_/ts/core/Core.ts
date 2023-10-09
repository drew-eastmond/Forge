export type Attributes = Record<string, unknown>;

export type IntervalClear = ReturnType<typeof setInterval>;
export type TimeoutClear = ReturnType<typeof setTimeout>;


export type Serialize = Record<string, unknown>;

let __HashCount: number = 0;

function __CatchException(error: unknown): unknown {

	return error;

}
export function EmptyFunction(): void {

}

export function EncodeBase64(json: Record<string, unknown>): string {

	const jsonStringify = JSON.stringify(json);
	const buffer = Buffer.from(jsonStringify);
	const base64data = buffer.toString("base64");

	return base64data;

}

export function DecodeBase64(value: string): any {

	const buff = Buffer.from(value, "base64");
	return buff.toString("ascii");

}

function Inject(command, api) {

	for (const [key, value] of Object.entries(api)) {

		command = command.replace(new RegExp(`{${key}}`, "g"), value);

	}

}

export function FlattenObject(obj, accessor?: string): { access: string, value: unknown }[] {

	accessor = (accessor === undefined) ? "" : accessor;

	const results: { access: string, value: unknown }[] = [];

	for (const [key, value] of Object.entries(obj)) {

		const currentAccess = (accessor == "") ? key : `${accessor}.${key}`;

		if (typeof obj[key] == "object" && obj[key] !== null) {

			results.push(...FlattenObject(obj[key], currentAccess));

		} else {

			results.push({ access: currentAccess, value: value });

		}

	}

	return results;

}


function s4(seed): string {

	return Math.floor((1 + seed) * 0x10000).toString(16).substring(1);

}

export function QuickHash(): string {

	return s4(++__HashCount) + s4(Math.random()) + '-' + s4(++__HashCount) + '-' + s4(Math.random()) + '-' + s4(++__HashCount) + '-' + s4(new Date().getTime()) + s4(++__HashCount) + s4(Math.random()); // jshint ignore:line

}

export type $Promise<Resolve = unknown, Reject = unknown> = [Promise<Resolve>, Function | ((resolve?: Resolve) => unknown), Function | ((resolve?: Reject) => unknown)];

export function $UsePromise<Resolve = unknown, Reject = unknown>(): $Promise<Resolve, Reject> {

	let resolveCallback: (resolve?: Resolve) => unknown;
	let rejectCallback: (resolve?: Reject) => unknown;

	const promise: Promise<Resolve> = new Promise<Resolve>(function (resolve, reject) {

		resolveCallback = resolve;
		rejectCallback = reject;

	})
		// .catch(__CatchException) as Promise<Resolve>;

	return [promise, resolveCallback, rejectCallback];

}

export function $UseRace<Resolve = unknown, Reject = unknown>(delay: number, capture?: (error: unknown) => unknown): $Promise<Resolve, Reject> {

	let resolveCallback: (resolve?: Resolve) => unknown;
	let rejectCallback: (resolve?: Reject) => unknown;

	let promise; Promise<Resolve>;
	if (capture) {

		promise = new Promise<Resolve>(function (resolve, reject) {

			resolveCallback = resolve;
			rejectCallback = reject;

			if (delay === undefined) return;
			setTimeout(function () {

				reject(new Error("race rejected"))

			}, delay);

		})
			.catch(capture) as Promise<Resolve>;

	} else {

		promise = new Promise<Resolve>(function (resolve, reject) {

			resolveCallback = resolve;
			rejectCallback = reject;

			if (delay === undefined) return;
			setTimeout(function () {

				reject(new Error("race rejected"))

			}, delay);

		})
		// .catch(__CatchException) as Promise<Resolve>;

	}

	

	return [promise, resolveCallback, rejectCallback];

}