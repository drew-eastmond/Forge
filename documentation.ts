import { Forge, ForgeAction, IAction, ForgeTask, ForgeServer, IServiceAdapter, ResolverValues, ResolveTrigger, SignalTrigger, WatchTrigger } from "@onyx-ignition/forge-core";

/*
* The star of the show. THE FORGE INSTANCE
*/
const forge: Forge = new Forge();


/*
* Services wrap CLI process and make interfacing with them much more modular
* ! Note: The services provided by `Forge` are somewhat useless until implemented by an `IAction`
* ! Note: Requires a client script to parse and dispatch messages. So far `typescript` is implmentation
*/

// `fork` typically provides the best fast messaging for "persistent". 
const typescriptService: IServiceAdapter = forge.fork("Typescript Service", {
	race: 2000,
	debounce: 250,
	reboot: true,

	command: "./Forge/fork-client.js --watch"
});

// `spawn` for any "persistent" processes ( use any for executable ).
const pythonService: IServiceAdapter = forge.spawn("Python print()", {
	race: 2000,
	debounce: 250,
	reboot: false,

	command: "python ./Forge/hello.py"
});

// `exec` is simple commandline execution "persistent" and "non-persistent". Can communicate via stdin but it is not fully implemented 
const tailwindService: IServiceAdapter = forge.exec("TailwindCSS Service", {
	race: 2000,
	debounce: 250,
	// reboot: false // (optional) can't reboot a `ExecService` 

	command: "npx tailwindcss -i {{in}} -o {{out}}", // {{injectable}} are resolved during dispatch
});

// build wasm modules via exec. Not used in this program but shown as another example.
const wasmService: IServiceAdapter = forge.exec("WASM Compile", {
	race: 2500,
	debounce: 250,
	// reboot: true, // (optional) can't reboot a `ExecService` 

	command: "emcc -std=c++11 ./src/cpp/hello.cpp -o ./build/www/wasm/hello.wasm" // completely hard-coded
});

// Handle each set of `ForgeActions` in closures to make more readable.
// Here an example to bootstrap a typescript builder
{

	// ForgeTask is a collection of `IActions`
	const forgeTask: ForgeTask = new ForgeTask(forge, {
		name: "typescript compiler",
		enabled: true // {optional}
	});

	// This action will build javascript
	const typescriptBuildAction: IAction = new ForgeAction(forge.services.get("Typescript Service") || typescriptService,
		{
			name: "build main.tsx", // optional for as a reference for other
			race: 3000, // will override service race value
			enabled: true, // wull ignore all dispatches
			route: true //
		},
		{
			in: "./src/ts/main.tsx",
			out: "./build/www/js/compiled.js",
			platform: "browser",
			format: "cjs",
			meta: false, // {optional}
			tree_shaking: true, // {optional}
			externals: [] // {optional}
		})
		.add(new SignalTrigger(["start"])) // this will dispatch if the service sends a "start" signal after initializing
		.add(new WatchTrigger([/\.[tj]s(x?)$/i])); // captures extensions such as ".js", ".ts", ".jsx", ".tsx"


	// This action show how to build dependencies that wait for others to resolve before executing.
	const dependencyAction: IAction = new ForgeAction(forge.services.get("Python print()") || pythonService,
		{
			name: "notify build complete", // optional for as a reference for other
			race: 3000, // {optional} will override service race value
			enabled: true, // {optional} wull ignore all dispatches,
			route: false
		},
		{
			"print": "hello"
		})
		.add(new ResolveTrigger(ResolverValues.Any, [{ task: "typescript compiler", action: "build main.tsx" }]));

	


	/*
	* Add all the tasks we built
	*/
	forgeTask
		.add(typescriptBuildAction)
		.add(dependencyAction);

	/*
	* Add the task to forge. It now active for 
	*/
	forge
		.add(forgeTask);
	
}

// An seperate task handle TailwindCSS
{
	// ForgeTask is a collection of `IActions`
	const forgeTask: ForgeTask = new ForgeTask(forge, {
		name: "TailwindCSS compiler",
		enabled: true // {optional}
	});

	// this will rebuild the css using `TailwindCSS` when a `.css` or when the "build main.tsx" resolves
	const tailwindCSSAction: IAction = new ForgeAction(forge.services.get("TailwindCSS Service") || tailwindService,
		{
			name: "tailwind compile",
			race: 5000,
			enabled: true,
			route: false
		},
		{
			in: "./src/css/style.css",
			out: "./build/www/css/output.css"
		})
		.add(new SignalTrigger(["start"]))
		.add(new WatchTrigger([/\.css$/i])) // captures ".css" extensions
		.add(new ResolveTrigger(ResolverValues.Any, [{ task: "typescript compiler", action: "build main.tsx" }]));

	/*
	* Add all the tasks we built
	*/
	forgeTask
		.add(tailwindCSSAction);

	/*
	* Add the task to forge. It now active for 
	*/
	forge
		.add(forgeTask);

}


/*
* Will serve files from "./build/www/"
*/
forge.$serve(1234, "./build/www/")
	.then(function (forgeServer: ForgeServer) {

		// customize forgeServer

	})
	.catch(function (error: unknown) {

		// console.log(error);

	});


/*
* Watch all "OS file event" from "root" folder
*/
console.log("watch started");
forge.watch(["**/*"], { ignore: [], debounce: 350, throttle: 5 });
console.log("watch started");
/*
*
* load and continue from last session
*
*/
forge.$load("./session.json");