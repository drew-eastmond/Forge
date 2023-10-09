# Forge

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