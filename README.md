# Forge ( BETA )

## Getting Started via CLI

```
npx https://github.com/drew-eastmond/Forge --inline-- ./run.ts --port-- 1234 --www--- ./www --watch-- ./src
```

Opens a file watcher at `./src`. Target files can be bundled to `--www--`, and served immediately to http port http://localhost:1234 serving files from `./www`. Next you can use the integrated esbuild or your parameterized CLI commands to launch workflows based on file filters and "signals". For example here is a simple inline script to build .ts, .tsx, .js, .jsx file to `./www/js/`

### Getting Started with inline script.

When an inline script is provided. `Forge` will automatically import the whole Forge library. These inline scripts are extremely portable between team members. Ideally each member can code their own workflows and distribute their "specialities" among other members. Here is a typescript equivalent of the previous command but will build a typescript file using the internal bundler.

```js
// async iife to get access to top level await
(async function () {

    const forge: Forge = new Forge();

    // watch all file changes at "./src"
    const fileWatcher: ForgeFileWatcher = forge.$watch(["./src"], { ignore: [], debounce: 500 });

    // create a local server ( express ) at http:/localhost:1234/. Add an route that map requests to "./www"
    const forgeServer: ForgeServer = await forge.$serve(1234);
    forgeServer.routes
        .add(new FileDirectoryRoute({ root: "./www/", indexes: ["index.html"], resolve: { status: 200, end: true } }));

    // create a task with a single action to build .ts, .tsx, .js, .jsx to "./www/js/"
    const socket: IForgeSocket = forge.exec("typescript bunlder", {
        command: `npx https://github.com/drew-eastmond/Forge --build-- "{ ""entry"": ""./src/ts/index.ts"", ""target"": ""./www/js/tester-messier.js"", ""format"": ""cjs"", ""platform"": ""node"" }"`,
        race: { ".+": 5000 } 
    });

    forge
        .add(new ForgeTask(forge, { task: "basic builder" })
            .add(new SocketAction(socket, { name: "bundle action", enabled: true }, { data: "some helpful data" })
                .add(new SignalTrigger(["start", "watch"]))
            )
        );

    // launch a start signal with the data provided, and start an initial build to update the current project.
    await socket.$start({ data: "hi. I'm goign to be the first signal for you to process." });

}());
```


## Overview

`Forge` is a fully portable and customizable build environment. `Forge` integrates Node and the CLI to maximize portability. You can move from computer setup to setup and have the same build environment. This current iteration previously was my build environment. `Forge` can build full-stack applications like Single/Multi Page Applications or games, but is flexible to integrate with ( with some difficulty ) building environments focused on Python, RUST, C++, or even PHP. It even works in Project IDX.

Another unique feature of `Forge` is the convenience of packaging services for other team members to use. By bundling APIs and CLI commands, models, and browser interfaces you can build application-like functionality like automating tasks to integrating AI into individual build steps.

Finally `Forge` includes a library of components to streamline building web applications and games. These will be released pending efforts with documentation. These components are prototyped throughout Forge and are still pending final specifications. Take caution before using these...


Forge is currently comprised of 6 distinct components with more on the way. 

<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-dark.svg">
 <source media="(prefers-color-scheme: light)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-light.svg">
 <img alt="YOUR-ALT-TEXT" src="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview.svg">
</picture>

### Bundlers
The `Forge` engine foundation is built on top of Javascript. Javascript can be deployed as a fullstack application using `Forge` components. To simplify building Forge wraps Esbuild to streamline bootstrapping applications for front-end or using backend Node scripts. React is already integrated for front-end builds out of box. Angular and other options will be soon to come.


### Tasks and Actions
A `ForgeTask` consists of a cascade of `ForgeAction` instances. `Forge` will orchestrate actions based on triggers where it will sequence dependencies based resolutions or rejections. `ForgeAction` wraps around CLI commands and internal scripts. Action provides execution monitoring, and communication via sockets.

### Sockets & Clients
`ForgeSocket` and its variants are communication wrappers for services. If those services have `ForgeClient` integrated. It will automatically connect and provide extended functionality. This opens  real time bi-communication and automates synchronizing models, exposing an internal API via signals, and tunneling HTTP routes from the parent. Note that all packages are derived from `ForgeClient`. Alternatively you can replicate packages with an extensive collection of routes and signals; but there will most definitely be a series of conflicts.

### Models and Stores
Models acts as a lightweight database composed of `ForgeStore` instances that operate like a collection of buckets. `ForgeModel` has advanced functionality like a remote synchronization, a simple query interface, permissions, locks, and persistence. Ideally these are instantiated as isolated or integrated to expose access to other processes. `ForegStore` was meant to operate as a component state that is passed to `ForgeActions` during execution.  

### Server and router
A built in HTTP server and router. `ForgeServer` default operation is to act as a basic HTTP server. To further customize functionality, specific routes can be reserved. Routes are dispatch where each component can end or pass on execution, so be careful of conflicts. There are a variety of route options to authorize requests, dispatch the correct functionality, and finally serve responses.

### Signals and Triggers
Signals are application wide events that are broadcasted. Triggers are execution criteria that will authorize an `ForgeAction` for example `resolve` / `reject` triggers. You can dispatch your own signals but the most popular application signals are `watch` and `reset` which are dispatched by the file watcher.


### Base usage via NPM 


CLI Parameters

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