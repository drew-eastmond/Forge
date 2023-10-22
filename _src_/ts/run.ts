const fs = require("fs");
const $fs = require("node:fs/promises");

import { CompositeArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { Forge } from "./forge/Forge";
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
			.add("PORT", {
				default: 1234,
				sanitize: function (value: unknown, args: Record<string, unknown>): unknown {
					
					return parseInt(value as string);
					
				}
			})
			.add("WWW_ROOT", {
				default: false,
				validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

					return (fs.existsSync(value));

				}
			})
			.add("WATCH", {
				default: [],
				validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

					console.log("validate-------------")

					return (fs.existsSync(value));

				},
				sanitize: function (value: unknown, args: Record<string, unknown>): unknown {


					console.log("sanitize------------")
					return (value as string).split(",");

				}
			})
			.add("start", {
				default: {}
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
		let PORT: number = compositeArguments.get("PORT") as number;
		let WWW_ROOT: string = compositeArguments.get("WWW_ROOT") as string;
		let WATCH: string[] = compositeArguments.get("WATCH") as string[];
		let START: Record<string, unknown> = compositeArguments.get("start") as Record<string, unknown>;

		console.log("WATCH", WATCH);

		/*
		* 3. intiatiate a `Forge` instance
		*/
		const forge: Forge = new Forge();

		await $fs.readFile(".forge", "utf-8")
			.then(function (fileData: string) {

				const config: Record<string, any> = JSON.parse(fileData);
				console.log(config);

				// override 
				const port: number = config?.forge?.port;
				if (isNaN(port)) PORT = port; 


				const wwwRoot: string = config?.forge?.www;
				if (wwwRoot && $fs.existsSync(wwwRoot)) WWW_ROOT = wwwRoot; 

				const watch: string[] = config?.forge?.watch;
				if (watch && watch.constructor === Array) WATCH.concat(watch);

				console.log(PORT, WWW_ROOT, WATCH);

				forge.parse(fileData);

			})
			.catch(function (error: unknown) {

				console.parse(`<red>${error.message}`);

			});

		if (WWW_ROOT) {

			const forgeServer: ForgeServer = await forge.$serve(PORT, WWW_ROOT);

		}

		if (WATCH) {

			forge.watch(WATCH, { ignore: [], debounce: 500 });

		}

		// you can pass 
		await forge.$signal("start", START);

	}());

	

} else {

	console.log("required as a module");

}