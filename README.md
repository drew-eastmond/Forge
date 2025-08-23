# Forge ( BETA )

## Getting Started ( Blazingly Fast via NPX )

Need help building typescript projects, automating task like compiling SASS files, integrating react or angular into builds  , batch processing images, or intergrating AI agents into your local CI/CD. Forge even has a built in file watcher.

I Got You Buddy!!!

### Base usage via NPX 
```
npx https://github.com/drew-eastmond/Forge --inline-- ./run.ts --port-- 1234 --www--- ./www --watch-- ./src
```
Opens a file watcher at `./src`. Target files can be bundled to `--www--`, and served immediately to http port http://localhost:1234 serving files from `./www`. Next you can use the integrated esbuilder or your parameterized CLI commands to launch workflows based on file filters and "signals". For example here is a simple inline script to build .ts, .tsx, .js, .jsx file to `./www/js/`

If you rather build your own workflow here is a typescript equivalent of the previous command.

```js
// watch all file changes at "./src"
forge.$watch("./src", { ignore: [], debounce: 500 });

// create a local server ( express ) at http:/localhost:1234/. Add an route that map requests to "./www"
const forgeServer: ForgeServer = await forge.$serve(1234); 
forgeServer.routes
    .add(new FileDirectoryRoute({ root: "./www/", indexes: ["index.html"], resolve: { status: 200, end: true } }));

// create a task with a single action to build .ts, .tsx, .js, .jsx to "./www/js/"
const socket: IForgeSocket = forge.exec(
    `https://github.com/drew-eastmond/Forge --build-- .{{ entry: "./src", target: "./www/src/", format: "cjs", platform: "node" }}`, 
    {  race: { ".+": 5000 } }
);
forge.add(new ForgeTask(forge, { task: "basic builder" })
				.add(new SocketAction(socket, { name: "bundle action", enabled: true }, { data: "some helpful data" })
					.add(new SignalTrigger(["start", "watch"]))));
		
// launch a start signal with the data provided, and start an initial build to update the current project.
await socket.$start({ data: "hi. I'm goign to be the first signal for you to process." });
```
 


scripts pass to 
### How to Use

Forge is built to be generic development enviroment for HTML5 applications and games. By itself, this CLI command will open a file watcher at `--watch--` directory. 
 
 

### Base usage via NPM 


Params

| Basic Paramters | Types | Description |
| :---         |     :---:      | :---         |
| `--worker--` or `--inline--`   | [file]     | Worker script file to load or Script to execute inline. Support both .js and .ts    |
| `--port--`     | [number]       | HTTP port to reserve on localhost  |
| `--www--`     | [directory]       | Instantiate a http server at the directory provided using port    |
| `--watch--`     | [directory]       | Instantiate a watcher at directory provided     |
| `--env--`     | [file]       | Use .env file to load equivalent CLI command    |
| `--build--`, `--b--`     | [{ entry, target, format, platform, external? }]       | Builds  .ts \|.js\|.tsx\|.jsx using internal bundler    |
| `--transform--`    | [{ entry, target, format, platform, external? }]       | Transform single file from  .ts, .tsx, or .jsx to .js    |

| --start   | [flag] | Triggers a "start" signal for actions to react to. |


## Overview

I a nutshell Forge is a library of components built in node to streamline development of web applications and games. Although it was built in node it is currently being expanded to handle other applications. Im currently expanding portability into other languages via WASM using the current iteration as a template. 

and  was created as a task runner with enchanced functionality. To streamline development and automate task via the CLI or client scripts. Currently 

Over time Forge was expanded to to instead create local build enviroments

Forge is currently comprised of 6 distinct components with more on the way. 

<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-dark.svg">
 <source media="(prefers-color-scheme: light)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-light.svg">
 <img alt="YOUR-ALT-TEXT" src="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview.svg">
</picture>

### Bundlers
The `Forge` engine is currently built on top node. Considerations are being made to port to WASM for maximum portability. In the meantime Forge has options to transform or bundle files on the fly and in some cases. It can more then enough to build projects that ultilize javascript. 

### Tasks and Actions
A `ForgeTask` is comprised of a cascade of `ForgeAction` instances. `Forge` will schedule actions based on triggers where if can sequence dependencies based resolutions or rejections. `ForgeAction` wraps around CLI commands or internal scripts, as to provide execution tracking, and communication via sockets.

### Sockets & Clients
`ForgeSocket` and it's variants are communication wrappers for processes. They help serialize and deserialize data between main thread and any sub-process. If those sub-processes contain a `ForgeClient` stub. It will automatically connect and provided routing. This opens of setting up models, bi-communication signals, and tunneling HTTP routes from the parent. All packages are derived from `ForgeClient` as it's core. Although you can replicate packages with an extensive collection of routes; there mill most definitely be a series of conflicts.

### Models and Stores
Models acts as a lightweight database comprised of a collection of `ForgeStore` that operate like buckets. `ForgeModel` has advance functionality like a sync engine, query interface, permissions, locks, etc... Ideally these are instantiated as isolated or intergrated to expose access to other processes. `ForegStore` was meant to operate as a component state that is passed to `ForgeActions` during execution. 

### Server and router
A built in HTTP server and router. As default the `ForgeServer` will act as a basic HTTP server. To customize functionality, specific routes can be reserve. Route are dispatch on a ""first come, first serve"" basis, so be careful of conflicts. There are a variety of route options to authorize requests, dispatch the correct functionality, and serve responses. Each route typically uses: 
`$authorize(request: ForgeRequest, response: ForgeResponse)` to query execution, and then dispatches `$resolve(request: ForgeRequest, response: ForgeResponse)`, `$reject(request: ForgeRequest, response: ForgeResponse)`

### Signals and Triggers
Signals are application wide events that are broadcasted to all Actions via sockets or the `ForgeRouter`. You can dispatch your own signals but the most popular application signals are 
- `watch` and `reset` is the most popular application signals which is dispatched by the file watcher. 
- `start` to launch any actions that rely on application starting up.
- `resolve` and `reject` are triggers that are executed once after each `ForgeAction`. You can tie follow up actions live copying or clean up on failures.