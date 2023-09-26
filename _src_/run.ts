const $fs = require("node:fs/promises");

import { CompositeArguments } from "./args/Argument";
import { DebugFormatter } from "./core/Debug";
import { Forge } from "./forge/Forge";

/*
* 1. Handle all the poly-fills
*/
DebugFormatter.Init({ platform: "node"});

if (require.main === module && !module.parent) {

	(async function () {

		/*
		* 1. Parse CLI/Enviroment arguments
		*/
		const compositeArguments: CompositeArguments = new CompositeArguments();
		compositeArguments
			.add("PORT", {
				required: true,
				default: 1234,
				validator: function(value: unknown): unknown {
					
					return parseInt(value as string);
					
				}
			})
			.add("PORT", {
				required: true
			})
			.parse(await $fs.readFile("./.env", "utf-8"))
			.compile();

		/*
		* 2. setup and extract the arguments
		*/
		const PORT: number = compositeArguments.get("PORT") as number;
		const WWW_ROOT: string = compositeArguments.get("WWW_ROOT") as string;

		/*
		* 3. intiatiate a `Forge` instance
		*/
		const forge: Forge = new Forge();
		forge.$serve(PORT, WWW_ROOT);

	}());

	

} else {

	console.log("required as a module");

}