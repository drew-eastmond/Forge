# Forge

## Getting started

```
git clone https://github.com/drew-eastmond/Forge.git
```

```
node ./Forge/install.js --INIT
```

## What is Forge? 

`Forge` is a pipeline SDK library that is in development written in Node to streamline developing projects that require multiple laungauges and with it mulitple frameworks. Forge provides interoperability by capturing interprocess communications and processing those messages into `signals` to be used by `Forge` dispatch to `ForgeActions` that implement those `signals`.

`Forge` was architecteched to utilize a simplified paradigm so developers can adopt the SDK quickly, and provide a pleasant developer experience. It should be noted `Forge` does not replace tools like Webpack, Esbuild, TailwindCSS, SASS, Vite, Create-React-App, etc, but insteads wraps them using `process adapters` to bootstrap your own CI/CD pipelines. `Forge` is not just limited to local development pipelines but can creatively adopt remote integrations for remote teams.

Right now l am focused on making HTML5 game development more streamlined. So Forge current will have a focus on Typescript/Javascript, WASM, CSS, HTML. Most importantly Forge is not limted to Node, but has provisions for python, C++, RUST, and manipulating image and sound assets. Remember Forge was built around polyglot development, so long as those tools can be launched via the CLI using exec, spawn, fork, or workers.

What make `Forge` also unique:

| Components | Description | Status |
| ------ | ------ | ----- |
| Forge | A Manager class.  | Stable |
| ForgeStream | Handles a pipeline execution run, and queueing `ForgeActions` based on dependencies to other `ForgeActions` | Stable |
| ForgeTask | A collection of `ForgeActions`. | Stable |
| ForgeAction | Captures and dispatch IPC messages to a `ForgeService` service.  | Stable |
| Dashboard | Dashboard to manage all configurations for `ForgeTasks` and `ForgeActions`. Can also launch `ForgeActions` manually if implmented | Unstable |
| ForgeStorage | Provides an abstraction for persistent storage for `Services` or `ForgeActions` ( memory, files, databases ). | Unstable |
| ForgerServes | Quickly serve build files from any folder. | Stable |
| Routing | Internal routing to render custom UIs within the developer Dashbaord. Meant for knowledgeable developers to build forms that will customize configurations during dispatch. Ideally for seniors to implement for junior developers. | Prototype |
| Watch | Watch files and dispatch `ForgeActions` based on matches | Stable |

## Example

```js

import { Forge } from "./_src_/ts/forge/Forge";
import { ForgeAction, IAction } from "./_src_/ts/forge/action/ForgeAction";
import { ForgeTask } from "./_src_/ts/forge/ForgeTask";
import { ForgeServer } from "./_src_/ts/forge/server/ForgeServer";
import { IServiceAdapter } from "./_src_/ts/forge/service/AbstractServiceAdapter";
import { ResolverValues, ResolveTrigger, SignalTrigger, WatchTrigger } from "./_src_/ts/forge/action/ForgeTrigger";

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
			in: "main.tsx",
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

	});


/*
* Watch all "OS file event" from "root" folder
*/
forge.watch(["./"], { ignore: [], debounce: 350, throttle: 5 });

/*
*
* load and continue from last session
*
*/
// forge.$load("./session.json");

```


by setting up a .forge config file. Forge will parse this file, inject variables and reparse the file. {static_variable} will be replaced with vaiables in the variable. {{dynamic_varaible}} will be resolved each signal. These can be nested and accessed via dot notations.

```
{
    "forge": {
        "queue": true,
        "port": 1234,
        "debounce": 500,
        "race": 2000
    },
    "variables": {
        "www_root": "./build/www",
        "route_root": "build/_route_",
        "src_root": "./src",
        "build_root": "./build",
        "forge": "./forge"
    },

    "services": {

        "spawn": {

            "typescript_spawn": {
                "command": "node ./forge/hello.js",
                "debounce": 500,
                "race": 2000,
                "reboot": true,

                "route_root": "{route_root}/typescript/"
            },

            "spawn python": {
                "command": "python ./forge/hello.py",
                "debounce": 500,
                "race": 2000
            }
            
        },

        "fork": {

            "typescript_fork": {
                "command": "{forge}/fork-client.js",
                "debounce": 500,
                "race": 2000,
                "reboot": true,
                "route_root": "{route_root}/typescript/"
            }
            
        },
        "exec": {
            "typescript_exec": {
                "command": "{{command}}",
                "debounce": 500,
                "race": 2000,
                "route_root": "{route_root}/typescript/"
            },
            "uglify_test": {
                "command": "python ./forge/hello.py",
                "debounce": 500,
                "race": 250
            }
        },
        "plugin": {
        }
    },
    "tasks": [
        {
            "name": "SASS - node ( task )",
            "enabled": true,
            
            "actions": [
                {
                    "_name_": "tailwindCSS compile",
                    "_implement_": "watch",
                    "_exec_": "typescript_exec",
                    "_watch_": [ "src/**/*.css" ],
                    "old_watch_": [ "{src_root}/scss/.+?\\.scss$" ],

                    "command": "npx tailwindcss -i ./src/css/style.css -o ./build/www/css/output.css"
                }
            ]
        },
        {
            "name": "esbuild",
            "enabled": true,
            "actions": [

                {
                    "_name_": "typescript",
                    "_implement_": "watch",
                    "_fork_": "typescript_fork",
                    "_watch_": [ "src/**/*.ts" ],

                    "in": "{src_root}/ts/main.tsx",
                    "out": "{build_root}/www/js/compiled.js",
                    "bundled": true,
                    "platform": "browser",
                    "format": "cjs"

                },
                {
                    "_name_": "uglify teypescript",
                    "_implement_": "execute_direct_doesnt_matter_whatever",
                    "_exec_": "uglify_test",
                    "_wait_": [
                        {
                            "task": "esbuild",
                            "action": "typescript"
                        }
                    ]
                }
            ]
        }
    ]
}
```
...in progress...