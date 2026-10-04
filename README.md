# Forge

Check out the [Forge Wiki](https://github.com/drew-eastmond/Forge/wiki) for evolving documentation.

## Overview

`Forge` is a fully portable and highly customizable build environment. `Forge` can build full-stack applications like Single/Multi Page Applications or games, but is flexible to integrate with ( with some complexity ) building environments focused on Python, RUST, C++, or even PHP. It even works in Project IDX

Another unique feature of `Forge` is the convenience of packaging services for other team members to use. By bundling API routes, CLI commands, models, and browser front-ends. You can build "local-first" APIs to automate tasks and sequence AI into individual build steps.

Finally `Forge` includes a library of files and types definitions for each components via NPM. Documentation is pending and will be released pending final specifications.

## Getting Started

```bash
# via NPM ( see below for config.json )
npm install @onyx-ignition/Forge
npm run start [forge] [[imports]] json://./config.json
```

## NPX execution
```bash
# via NPX uding Forge's CLI notation ( varaiable wrappers can be "[key]" or "-key-" )
# imports "./config.json" then uses cli arguments to replace the port from 1234 to 1557
npx @onyx-ignition/Forge -- [forge] [[imports]] json://./config.json [[http.port]] 1337
```

### Config.json ( Example file )
A config file that instructs `Forge` to:
* Create a http server listening on port 1234 that can serve static files from `./www/` while routing missed requests to any worker instances.
* Watches the file system for file changes against an Regular Expression. Then dispatch an action based on the supplied protocol.
    * `signal://` : send a signal of to the message bus.
    * `cli://` : runs a cli commmand 
    * `http://` | `https://` : makes a HTTP request. 
* Finally, Loads a worker and add itself to the message bus via `ForgeClient` internal instance. 

```json 
{
    "forge": {
        "http": {
            "port": 1234,
            "www": "./www/"
        },
        "watch": {
            "signals": [
                {
                    "filter": ".+\/ts",
                    "action": "signal://typescript"
                },
                {
                    "filter": ".+\/css",
                    "action": "cli://python do-something.py"
                }
            ]
        },
        "workers": [
            {
                "script": "./worker.js",
                "signals": ["typescript", "css"]
            }
        ]
    }
}

```

## Example
This programatically does the same thing as the previous NPX example.
```ts
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
import { $Wait } from "./core/Core";
import { ForgeClient } from "./forge/client/ForgeClient";
import { ForgeRequest } from "./forge/server/ForgeRequest";
import { ForgeResponse } from "./forge/server/ForgeResponse";
import { ForgeRoute } from "./forge/server/route/ForgeRoute";
import { Signal, SignalConstraint } from "./forge/socket/ForgeSocket";

(async function () {

    // all signals and routes have at least on universal race timeuot 
    const constraint: SignalConstraint = { race: 1000 };

    const application = new class extends Forgelet {

        public async $route(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void> {
            
            console.green("route in worker", signal);
            response.headers.add({ success: true }, { watched: true })
        
        }

        public async $watch(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void> {
            
            const { file }: { file: string } = signal;

            console.blue(`watching "${file}" in worker`, signal);
            response.headers.add({ success: true }, { watched: true })

        }

        public async $execute(signal: Signal, request: ForgeRequest, response: ForgeResponse): Promise<void> {

            if (AttributesQuery.Or({ typescript: true })) {

                // give me a bit more time to complete
                request.session.race(2550);
                await $Wait(2500);
                console.yellow("kept busy", signal);

            } else if (AttributesQuery.Or({ css: true })) {

                // give me a bit more time to complete
                request.session.race(1550);
                await $Wait(1500);
                console.cyan("So bored", signal);

            }

            // add some 
            console.cyan("I can do lots of things in my worker", signal);
            response.headers.add({ success: true }, { execute: true });

        }


    }({ constraint });

    application.routes.add(
        new ForgeRoute()
            .add({

                async $authorize(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined> {

                    const rawURL: string | undefined = request.headers.last(/url/i); 
                    if (rawURL === undefined) return;

                    const url: URL = new URL(rawURL);
                    const path: string = url.pathname;

                    return /(^\/say\/hello\/?)$/.test(path);

                },
                async $resolve(request: ForgeRequest, response: ForgeResponse): Promise<boolean | undefined> {

                    // build a response that will be easily render by the http
                    // you would write your templating logic here.
                    response.writes.add("<html><body>What's up!</body></html>", { http: true });
                    response.headers.add({ status: 200 }, { http: true });
                    response.end();

                    // stop all further processing of routes
                    return false;

                }
            
            }));

}());   
```


## Socials

Currently these are the channels that official. More social channels will added as new opportunities progress. 

### Wiki
There's a [Forge Wiki](https://github.com/drew-eastmond/Forge/wiki) for a quick reference for getting started with examples

### Reddit
Community [Reddit board](https://www.reddit.com/r/OnyxIgnition/) for discussing features, news, and debugging.

### Discord
Direct message and group chats [Discord](https://discord.gg/eRGwtxKmM)

### Youtube
Tutorials coming soon [Youtube](https://www.youtube.com/@OnyxIgnition)

## Funding

`Forge` is one of the many projects being developed by Onxy Ignition. To keep access vs funding as democratic as possible i've opted to use innovate a new business model around the concept of **Profit Sourced**. 

**Profit Sourced** revolves around the paradigm that the release builds are always open to the general public, while source code is private  until on funding goals are reached. In the mean, time premium content is regularly is promoted to drive community funding through dedicated portals, or contracts from participating entities. 

This is a long term project that is expected to gain traction through iterative releases.

<img src="https://media3.giphy.com/media/TDQOtnWgsBx99cNoyH/200.gif" width="50">[Buy me a coffee](https://buymeacoffee.com/onyx_ignition)

<img src="https://static.vecteezy.com/system/resources/thumbnails/065/386/606/small/patreon-logo-icon-app-transparent-background-premium-social-media-design-for-digital-download-free-png.png" width="50"> [Patreon](https://www.patreon.com/cw/Onyx_Ignition)
