import { Forge } from "./_src_/ts/forge/Forge";
import { ForgeAction } from "./_src_/ts/forge/action/ForgeAction";
import { ForgeTask } from "./_src_/ts/forge/ForgeTask";
import { ForgeServer } from "./_src_/ts/forge/server/ForgeServer";
import { IServiceAdapter } from "./_src_/ts/forge/service/AbstractServiceAdapter";

const forge: Forge = new Forge();


const typescriptService: IServiceAdapter = forge.fork("Typescript Service", {
	race: 2000,
	debounce: 250,
	reboot: true,

	command: "node ./build.js --watch"
});
const sassService: IServiceAdapter = forge.spawn("Hello client (Python)", {
	race: 2000,
	debounce: 250,

	command: "python ./hello.py"
});
const tailwindService: IServiceAdapter = forge.exec("TailwindCSS service", {
	race: 2000,
	debounce: 250,
	// _reboot: false // (optional) can't reboot a `ExecService` 

	command: "npx tailwindcss -i {{in}} -o {{out}}", // {{injectable}} are resolved during dispatch
});
const wasmService: IServiceAdapter = forge.exec("WASM Compile", {
	race: 2500,

	command: "node ./forge/build.js --in-- {{in}} --out-- {{out}} --platform-- {{platform} --format-- {{format}} --bundled" // completely hard-coded
});

/*
* ! Note: the services provided by `Forge` are somewhat useless until implemented by an IAction
*/

// handle each set of `ForgeActions` in closures to make more readable.
{
	// notice we can keep an reference to the original service or get the reference directly from `forge.services`
	const currentService: IServiceAdapter = forge.services.get("Typescript Service") || typescriptService;
	const forgeTask: ForgeTask = new ForgeTask(forge, {
		name: "typescript compiler"
	})
		// this will dispatch if the service sends a "start" signal. Should only be dispatched once.
		.add(new ForgeAction(currentService, {
			name: "typescript start",
			race: 3000, // {optional} override
			async: true,
			triggers: [
				{ signal: ["start"] }
			]
		},
		{
			some: "random parameters",
			to: "pass onto the service",
			example: "data"
		}))
		// dispatched from `Forge` during "OS file events"
		.add(new ForgeAction(currentService, {
			name: "typescript watch", 
			
			async: true,
			triggers: [
				{ watch: [/\.[tj]s(x?)$/i] } // captures literals such as ".js", ".ts", ".jsx", ".tsx"
			]
		},
		{
			in: "main.tsx",
			out: "{build.www}/js/compiled.js",
			platform: "browser",
			format: "cjs",
			meta: false, // {optional}
			tree_shaking: true, // {optional}
			externals: [] // {optional}

		}))
		.add(new ForgeAction(currentService, {
			name: "typescript uglify",
			triggers: [
				{
					circuit: "and",
					operand: [{
						task: undefined, // when task is `undefined` then rthe value is retrieved from `this.task.name`
						action: "typescript watch"
					}]
				}] // waits for other the action: `iActions`, task:  ]
		},
		{

		}))
		// routed from `Forge` "webhook" task. .. future implementation
		.add(new ForgeAction(currentService, {
			name: "webhook example"
		},
		{
			not: "yet implmented"
		}));

	forge
		.add(forgeTask);

}

// handle each Tailwind example
{
	// notice we can keep an reference to the original service or get the reference directly from `forge.services`
	const currentService: IServiceAdapter = forge.services.get("TailwindCSS service") || tailwindService;
	const forgeTask: ForgeTask = new ForgeTask(forge, {
		name: "sass preprocessor"
	})
		.add(new ForgeAction(currentService, {
			name: "tailwind compile",
			async: true,
			race: 5000,
			triggers: []
		},
		{
			in: "./src/css/style.css",
			out: "./build/www/css/output.css"
		}));

	forge
		.add(forgeTask);

}


/*
*
* Watch all "OS file event" from "root" folder
*
*/
const forgeServer: ForgeServer = await forge.$serve(1234, "./build/www/");


/*
*
*
*
*/
forge.watch(["./"], { ignore: [], debounce: 350, throttle: 5 });

/*
*
* load and continue from last session
*
*/
// forge.$load("./backup.session");