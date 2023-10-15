const forge: Forge = new Forge();


const typescriptService: IServiceAdapter = forge.fork("Typescript Service", {
	_race_: 2000,
	_debounce_: 250,
	_reboot_: true,

	command: "node ./build.js --watch"
});
const sassService: IServiceAdapter = forge.spawn("Hello client (Python)", {
	_race_: 2000,
	_debounce_: 250,

	command: "python ./hello.py"
});
const tailwindService: IServiceAdapter = forge.exec("TailwindCSS service", {
	_race_: 2000,
	_debounce_: 250,
	// _reboot: false // (optional) can't reboot a `ExecService` 

	command: "npx tailwindcss -i {{in}} -o {{out}}", // {{injectable}} are resolved during dispatch
});
const wasmService: IServiceAdapter = forge.exec("WASM Compile", {
	_race_: 2500

	command: "node ./forge/build.js --in-- {{in}} --out-- {{out}} --platform-- {{platform} --format-- {{format}} --bundled" // completely hard-coded
});


// handle each set of ForgeActions in closures to make more readable.
// ! Note: the services provided by `Forge` are somewhat useless until implemented by an IAction
{
	// notice we can keep an reference to the original service or get the reference directly from `forge.services`
	const currentService: IServiceAdapter = forge.services.get("Typescript Service") || typescriptService;
	const forgeTask: ForgeTask = new ForgeTask(forge)
		// this will dispatch if the service sends a "start" signal. Should only be dispatched once.
		.add("typescript start", new ForgeAction(currentService, "start", {
			race: 3000, // {optional} override
			async: true,
			// watch: [],
			// resolves: [] {optional}

		},
		{

		}))
		// dispatched from `Forge` during "OS file events"
		.add("typescript watch", new ForgeAction(currentService, "watch", {

			watch: [ /\.[tj]s(x?)$/i ], // captures literals such as ".js", ".ts", ".jsx", ".tsx"
			async: true,
			// race: 2500,
			// resolves: []
		},
		{
			in: "main.tsx",
			out: "{build.www}/js/compiled.js"
			platfork: "browser",
			format: "cjs",
			meta: false, // {optional}
			tree_shaking: true, // {optional}
			externals: [] // {optional}

		})),
		.add("typescript uglify", new ForgeAction(currentService, "resolve", {
			// async: false,
			// watch: [] 
			// race: 2500
			resolves: [{
				task: undefined, // when task is `undefined` then rthe value is retrieved from `this.task.name`
				action: "typescript watch"
			} // waits for other the action: `iActions`, task:  ]
		},
		{

		}))
		// routed from `Forge` "webhook"task.
		.add(new ForgeAction(currentService, "webhook", {
			
		},
		{

		}));

	forge
		.add(forgeTask);

}

// handle each Tailwind example
{
	// notice we can keep an reference to the original service or get the reference directly from `forge.services`
	const currentService: IServiceAdapter = forge.services.get("TailwindCSS service") || tailwindService;
	const forgeTask: ForgeTask = new ForgeTask(forge)
		.add(new ForgeAction(currentService, "watch", {
			async: true,
			watch: [],
			race: 5000,
			resolves: []
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
const forgeServer: ForgeServer = forge.serve(["./"], 1234, { ignore: [] });


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
forge.load("./backup.session");