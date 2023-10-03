const fs = require("fs");
const $fs = require("node:fs/promises");

import { CompositeArguments } from "./core/Argument";
import { DebugFormatter } from "./core/Debug";
import { Forge } from "./forge/Forge";
import { ForgeServer } from "./forge/server/ForgeServer";

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
				sanitize: function (value: unknown, args: Record<string, unknown>): unknown {
					
					return parseInt(value as string);
					
				}
			})
			.add("WWW_ROOT", {
				required: true,
				validate: function (value: unknown, args: Record<string, unknown>): boolean | Error {

					return (fs.existsSync(value));

				}
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
		forge
			.parse(await $fs.readFile(".forge", "utf-8"));

		const forgeServer: ForgeServer = await forge.$serve(PORT, WWW_ROOT);

		forge.$signal("construct", { "so l can get my": "satifacation" });

		forge.watch("./src/", {});

	}());

	

} else {

	console.log("required as a module");

}