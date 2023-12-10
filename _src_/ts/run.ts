const fs = require("fs");
const $fs = require("node:fs/promises");

import { CompositeArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { Forge } from "./forge/Forge";
import { ForgeIO } from "./forge/io/ForgeIO";
import { ForgeServer } from "./forge/server/ForgeServer";

/*
* 1. Handle all the poly-fills
*/
DebugFormatter.Init({ platform: "node" });

/* process.on('uncaughtException', (error, source) => {

	console.log("extra find error");

}); */

if (require.main === module) {

	(async function () {

		/*
		* 1. Parse CLI/Enviroment arguments
		*/
		const compositeArguments: CompositeArguments = new CompositeArguments();
		compositeArguments
			.add(/^port$/i, {
				default: 1234,
				sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

					switch (value.constructor) {
						case Number:
							return value;

						case String:
							return parseInt(value as string);		
					}
				}
			})
			.add(/www_root/i, {
				validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

					if (value === undefined) return true;

					return (fs.existsSync(value));

				}
			})
			.add(/watch/i, {
				default: [],
				validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

					console.log("validate-------------")

					return (fs.existsSync(value));

				},
				sanitize: function (value: unknown, args: Record<string, unknown>): unknown {

					console.log("sanitize-------------", value)

					if (value instanceof Array) return value;
					if (value.constructor === String) return (value as string).split(",");


					return value;
					
				}
			})
			.add(/start/i, {

			})

		await $fs.readFile("./.env", "utf-8")
			.then((fileData: string) => {

				compositeArguments.parse(fileData);

			})
			.catch(function (error: unknown) {



			})
			.finally(() => {

				compositeArguments.compile();

			});
			
		/*
		* 2. setup and extract the arguments
		*/
		let PORT: number = compositeArguments.get(/^port$/i) as number;
		let WWW_ROOT: string = compositeArguments.get(/^www_root$/i) as string;
		let WATCH: string[] = compositeArguments.get(/^watch$/i) as string[];
		let START: Record<string, unknown> = compositeArguments.get(/^start$/i) as Record<string, unknown> || {};


		/*
		* 3. intiatiate a `Forge` instance
		*/
		const forge: Forge = new Forge();

		await $fs.readFile(".forge", "utf-8")
			.then(async function (fileData: string) {
				
				const config: Record<string, any> = forge.parse(fileData);

				// override 
				// console.log(config?.forge?.serve?.port, PORT);
				const port: number = config?.forge?.serve?.port;
				if (isNaN(port) === false) PORT = port;


				const wwwRoot: string = config?.forge?.serve?.root;
				if (wwwRoot && await ForgeIO.File.$DirectoryExists(wwwRoot)) WWW_ROOT = wwwRoot; 

				const watch: string[] = config?.forge?.watch;
				// if (watch && watch.constructor === Array) WATCH.concat(watch);

				console.log(`PORT (${PORT}), WWW_ROOT (${WWW_ROOT}), WATCH (${WATCH})`);

			})
			.catch(function (error: unknown) {

				console.parse(`<red>${error.message}</red>`);
				process.exit(1);

			});

		if (WWW_ROOT) {

			const forgeServer: ForgeServer = await forge.$serve(PORT, WWW_ROOT);

		}

		if (WATCH || true) {

			forge.watch(["./src/**/*"], { ignore: [], debounce: 500 });

		}

		// you can pass 
		await forge.$signal("start", { start: true, ...START });

	}());

	

} else {

	console.log("required as a module");

}