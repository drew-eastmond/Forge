# Forge ( documentation - work in progress 2025/08/19 )

## Getting Started ( Blazingly Fast via NPX )

Need help building typescript projects, automating task like SASS files, intergrating react or angular, processing images, or intergrating AI agents into your local CI/CD.

I Got You Buddy!!!


### Base usage via NPX to open a http port http://localhost:1234 serving files from ./www while watching ./src
```
npx https://github.com/drew-eastmond/Forge --port-- 1234 --www--- ./www --watch-- ./src
```
### Base usage via NPM 
```
npm run start -- --port-- 1234 --www--- ./www --watch ./src
```

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
A `ForgeTask` is comprised of a cascade of `ForgeAction` instances. These actions are executed based on triggers. `ForgeAction` wraps around CLI commands or internal scripts, as to provide execution tracking, and communication via sockets. `Forge` will orchastrate actions execution based on resolutions or rejections. 

### Sockets & Clients
Sockets 
These act as communication stubs for integrating your own components into the `Forge` ecosystem. `ForgeClient` offer conveince of setting up models, bi-communication signals, and tunneling HTTP routes from the parent. All packages are derived from `ForgeClient` as the core. Although you can replicate packages with an extensive collection of routes; there mill most definitely be a series of conflicts.

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