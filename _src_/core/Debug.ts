export enum DebugForeground {

	Black = "\u001b[30m",
	Red = "\u001b[31m",
	Green = "\u001b[32m",
	Yellow = "\u001b[33m",
	Blue = "\u001b[34m",
	Magenta = "\u001b[35m",
	Cyan = "\u001b[36m",
	White = "\u001b[37m",

	// special

	Bright = "\x1b[1m",
	Dim = "\x1b[2m",
	Underscore = "\x1b[4m",
	Blink = "\x1b[5m",
	Reverse = "\x1b[7m",
	Hidden = "\x1b[8m",

	// extended values

	BrightBlack = "\u001b[30m;1m",
	BrightRed = "\u001b[31m;1m",
	BrightGreen = "\u001b[32m;1m",
	BrightYellow = "\u001b[33m;1m",
	BrightBlue = "\u001b[34m;1m",
	BrightMagenta = "\u001b[35m;1m",
	BrightCyan = "\u001b[36m;1m",
	BrightWhite = "\u001b[37m;1m"

}

export enum DebugBackground {

	Black = "\u001b[40m",
	Red = "\u001b[41m",
	Green = "\u001b[42m",
	Yellow = "\u001b[43m",
	Blue = "\u001b[44m",
	Magenta = "\u001b[45m",
	Cyan = "\u001b[46m",
	White = "\u001b[47m",
	Grey = "\u001b[40m",

	// extended values

	BrightBlack = "\u001b[40;1m",
	BrightRed = "\u001b[41;1m",
	BrightGreen = "\u001b[42;1m",
	BrightYellow = "\u001b[43;1m",
	BrightBlue = "\u001b[44;1m",
	BrightMagenta = "\u001b[45;1m",
	BrightCyan = "\u001b[46;1m",
	BrightWhite = "\u001b[47;1m"

}

export const ColourFormattingReset: string = "\u001b[0m";

class ColourFormatting<T> {

	private _debugFormatter: DebugFormatter; 
	private stack: (T | "\u001b[0m")[];

	private _defaultColour: string;
	constructor(debugFormatter: DebugFormatter);
	constructor(debugFormatter: DebugFormatter, defaultColour: string);
	constructor(debugFormatter: DebugFormatter, defaultColour?: string) {

		this._debugFormatter = debugFormatter;

		this._defaultColour = defaultColour || "\u001b[0m";

		this.stack = [];

	}

	public size(): number {

		return this.stack.length;

	}

	public current(): string | T {

		return this.stack[this.stack.length - 1] || this._defaultColour;

	}

	public clear(): void {

		this.stack = [];

	}

	public push(value: T | "\u001b[0m"): DebugFormatter {

		this._debugFormatter.write(value as string);

		this.stack.push(value);

		return this._debugFormatter;

	}

	public pop(): DebugFormatter /* T | "\u001b[0m" */ {

		// if there is nothign on the stack return reset
		if (this.stack.length == 0) {

			this._debugFormatter.write(this._defaultColour); 

		} else {

			this.stack.pop();

			const formattingColor: string | T = this.stack[this.stack.length - 1] || this._defaultColour;

			this._debugFormatter.write(formattingColor as string); 

		}

		return this._debugFormatter;

	}

}

export class DebugFormatter {

	public foreground: ColourFormatting<DebugForeground>;
	public fg: ColourFormatting<DebugForeground>;

	public background: ColourFormatting<DebugBackground>;
	public bg: ColourFormatting<DebugBackground>;

	public stream: string = "";

	constructor() {

		this.foreground = this.fg = new ColourFormatting(this, DebugForeground.Green);

		this.background = this.bg = new ColourFormatting(this, DebugBackground.Grey);

	}

	public clear(): this {

		this.stream = "";
		this.foreground.clear();
		this.background.clear();

		return this;

	}

	public write(value: string): this {

		this.stream += value;

		return this;

	}

	public reset(): this {

		this.stream += "\u001b[0m";

		return this;

	}

	public parse(input: string): this {

		const tagsRegExp: RegExp = /(<([\w$_\.]+)\s*>)|(<\/([\w$_\.]+)\s*>)|(<([\w$_\.]+)\s*\/>)/mg;

		const fragments: string[] = [];

		let result;
		let lastIndex: number = 0;
		while (result = tagsRegExp.exec(input)) {

			// push the characters skipped between matches
			if (lastIndex < result.index) fragments.push(input.substring(lastIndex, result.index));

			// now push the current match and update the lastIndex
			fragments.push(result[0]);
			lastIndex = tagsRegExp.lastIndex;

		}

		// push the last characters left in the `input`
		// console.log(lastIndex, input.length);
		if (lastIndex < input.length) fragments.push(input.substr(lastIndex))

		// console.log("fragments", fragments);

		for (const fragment of fragments) {

			switch (fragment.toLowerCase()) {
				case "<black>":
				case "<fg.black>":
					this.foreground.push(DebugForeground.Black);
					break;

				case "<red>":
				case "<fg.red>":
					this.foreground.push(DebugForeground.Red);
					break;

				case "<green>":
				case "<fg.green>":
					this.foreground.push(DebugForeground.Green);
					break;

				case "<yellow>":
				case "<fg.yellow>":
					this.foreground.push(DebugForeground.Yellow);
					break;

				case "<blue>":
				case "<fg.blue>":
					this.foreground.push(DebugForeground.Blue);
					break;

				case "<magenta>":
				case "<fg.magenta>":
					this.foreground.push(DebugForeground.Magenta);
					break;

				case "<cyan>":
				case "<fg.cyan>":
					this.foreground.push(DebugForeground.Cyan);
					break;

				case "<white>":
				case "<fg.white>":
					this.foreground.push(DebugForeground.White);
					break;

				// backgrounds

				case "<bg.black>":
					this.background.push(DebugBackground.Black);
					break;

				case "<bg.red>":
					this.background.push(DebugBackground.Red);
					break;

				case "<bg.green>":
					this.background.push(DebugBackground.Green);
					break;

				case "<bg.yellow>":
					this.background.push(DebugBackground.Yellow);
					break;

				case "<bg.blue>":
					this.background.push(DebugBackground.Blue);
					break;

				case "<bg.magenta>":
					this.background.push(DebugBackground.Magenta);
					break;

				case "<bg.cyan>":
					this.background.push(DebugBackground.Cyan);
					break;

				case "<bg.white>":
					this.background.push(DebugBackground.White);
					break;

				// reset

				case "<reset>":
				case "<reset />":
					this.stream += "\u001b[37m";
					break;

				default:

					if (/(<\/(fg\.)?([\w$_]+)\s*>)/.test(fragment)) {

						this.foreground.pop();

					} else if (/(<\/bg\.([\w$_]+)\s*>)/.test(fragment)) {

						this.background.pop();
						
					} else {

						this.stream += fragment;

					}

			}

		}

		return this;
	}

}

const __DebugFormatter: DebugFormatter = new DebugFormatter();
console.parse = function (...rest: string[]) {

	console.log(...rest.map(function (log: unknown) {

		if (log === undefined) return undefined;

		if (log.constructor == String) return __DebugFormatter.clear().parse(log).reset().stream;

		return log;

	}));

}