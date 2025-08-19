## Getting Started ( Blazingly Fast via NPX )

You probably don't have much time to think! The team is couting on you to build something later today. 

I Got You Buddy!!!


### Base usage via NPX
```
npx https://github.com/drew-eastmond/Forge 
```
### Base usage via NPM 
```
npm run start 
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
| `--transform--`    | [{ entry, target, format, platform, external? }]       | Transform single file from  .ts or .tsx, .jsx to .js    |




| Flags | Description |
| :---         | :---         |
| --start   | Triggers a "start" signal for actions to react to. |
| --inline--     | Script to execute inline alongside the current context. Has access to base     |
| --port--     | HTTP port to reserve   |
| --www--      | Instantiate a http server at the directory provided using port    |
| --watch--     | Instantiate a watcher at directory provided     |


## Overview

I a nutshell Forge was created as a task runner with enchanced functionality. To streamline development and automate task via the CLI or client scripts. Currently 

Over time Forge was expanded to to instead create local build enviroments

Forge is currently comprised of 6 distinct components with more on the way. 

### Task and Action
A `ForgeTask` is comprised of a cascade of `ForgeAction`. These actions are launched based on `Triggers`. `ForgeAction` typically wraps around CLI commands or internal scripts and provide execution tracking to coordinate. 

### Router
Registers all `ForgeClient` whilee working alongside the `Sockets` to parse and resolve what `Task` to dispatch but on trigger.

### Sockets
Allows for Forge communicate with other processes and potentially route signals bi-directionaly. These messages are then processed by the `Router` to be dispatched to the correct RPC.

### Model and Stores
Model acts as a persistent Database comprised of a Tree of `ForgeStore` that operate like buckets. `ForgeModel` has advance functionality like a sync engine, query interface to fetch a collection of `ForgeStore`, permissions, locks, and can be created as light weight objects to feed parameters `ForgeActions` during execution. Ideally these are instantiated as isolated or intergrated to expose access to other .

### Server
Acts as a HTTP router. There are a variety of route options for example you can 
provide an UI interface ( via a root directory )
expose API functionality.

### Signal and Trigger
Signals are application wide events that are broadcasted to all Actions via sockets. The most popular signal is the `watch` signal dispatched by the file watcher.


```
class AppClient extends ForgeCLient {

	constructor

}


```



<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-dark.svg">
 <source media="(prefers-color-scheme: light)" srcset="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview-light.svg">
 <img alt="YOUR-ALT-TEXT" src="https://github.com/drew-eastmond/Forge/blob/main/docs/forge-overview.svg">
</picture>
