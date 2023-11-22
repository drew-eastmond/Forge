# Forge
---

## Getting Started ( Blazingly Fast via NPX )

You probably don't have much time to think! The sales team is down your ass to build something later today. 

I Got You Buddy!!!

```
npx onyx-ignition-forge --init --flatten --packager-- pnpm --typescript
```

This will install a unzipped clone forge ( from `master` ) that is pre-configured with:
* Node packages via `pnpm` ( there are also options `npm`, `pnpm`, `yarn`)
* Typescript Bundler that you can invoke via triggers ( like **File Watching** ).
* Finally Please update `.forge` file with entry and compile targets. Here's an example to configure file watching for `ts`, `js`, `jsx`, `tsx` and compile `src/ts/main.tsx` into `/www/js/compiled.js`
```json
[
    {
        "service": "typescript_bundler",
        "triggers": [
            { "watch": [ "\\.[tj]s(x?)$" ] }
        ]
    },
    {
        "in": "{src.root}/ts/main.tsx",
        "out": "{build.root}/www/js/onyx.js",
        "bundled": true,
        "platform": "browser",
        "format": "cjs"
    }
]
```


| Package | Params | Status |
| ------ | ------ | ------ | 
| Typescript | --typescript | Pending... |
| TailwindCSS | --tailwindcss | Pending... |
| SASS | --sass | Pending... |
| WASM | --wasm | Pending... |

* TailwindCSS compiler. *Be mindful of your project structure, as tailwind will install from the* **Current working Directory**

```
npx onyx-ignition-forge -i --npm|-- <package_1> <package_2> <...package_n>
```

## Getting Started Manually
This is the way our ancestors did it. THey didnt have all that fancy smacy technologies. They used vacuum tubes, light bulbs, and hole punched paper. 'Cause they nasty like that and they love it ;)

Start with cloning the main repo then added extenstions as needed. I'll look into more robust installers giving their are other priorities.. For now it recommended to preinstall `Node`, `Python`, and `Enscripten` 

1. Clone the git repo.
```
git clone https://github.com/drew-eastmond/Forge.git
```

2. Execute the `Forge/install.js` script. if --init parameter will add an empty `.forge` configuration file. `Forge` currently supports the following packages and more will be added. `--typescript`,  `--tailwindcss`, `--sass`,  `--twig`,  `--enscripten`

```
node ./Forge/install.js --init <package_1> <package_2> <...package_n>
```

3. Modify the `.forge` configuration file. Add `ForgeServices`, `ForgeTasks`, and `ForgeActions`. Check the wiki on how to modify the configuration files.
4. Run the `node ./Forge/run.js` or build your  

---

## What is Forge? 

`Forge` is an incremental build system for creating your own custom pipelines. On top of wrapping CLI processes it is written in Node to streamline developing projects that require multiple laungauges and with it mulitple frameworks. Forge provides interoperability by capturing interprocess communications and processing those messages into `signals` to be used by `Forge` dispatch to `ForgeActions` that implement those `signals`. 

`Forge` also adds extra functionality like: 

| Feature | Description |
| ------ | ------ |
| *File Watching* | Launch `ForgeActions` based on Regular Expressions |
| *File Server* | Serves from a local development enviroment | 
| *Routing and Remote Invocation* | Invoke any functionality exposed by a `ForgeService` using routing. Extend the `ForgeClient` and implement your own delegates. |
| *Dashboards and UI Panels* | Leverages the routing system to expose `ForgeService's` to render forms and HTML. Provide your developers with status updates or edit parameters via an UI. |
| *Persistent storage* | Import, export, or share development sessions amoung mulitple developers | 

`Forge` was architecteched to utilize a simplified paradigm so developers can adopt it quickly, and provide a pleasant developer experience. It should be noted `Forge` does not replace tools like Webpack, Esbuild, TailwindCSS, SASS, Vite, Create-React-App, etc, but instead `Forge` wraps them using process adapters. 

`Forge` is not just limited to local development pipelines but can creatively integrate remote processes and sequence advanced dependencies. Create remote collaborations or bootstrap your own CI/CD pipelines from custom scripts.

Currently `Forge` is built in Node but there are provisions to mirror the library to run exclusively in `Python`.

Right now l am focused on making HTML5 game development more streamlined. So Forge current will have a focus on Typescript/Javascript, WASM, CSS, HTML. Most importantly Forge is not limted to Node, but has provisions for python, C++, RUST, and manipulating image and sound assets. Remember Forge was built around polyglot development, so long as those tools can be launched via the CLI using exec, spawn, fork, or workers.

`Forge` is composed of the following modules:

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

## Examples

by setting up a .forge config file. Forge will parse this file, inject variables and reparse the file. {static_variable} will be replaced with vaiables in the variable. {{dynamic_varaible}} will be resolved each signal. These can be nested and accessed via dot notations.


[Forge Wiki: .forge Example](https://github.com/drew-eastmond/Forge/wiki/%22.forge%22-configuration-file)


If your want to customize `Forge` you can write your own script and compile them. Forge can easily build and run typescript files. THe sourve files are included so you can bootstrap your own custom build pipelines.

[Forge Wiki: Customized run.js Example](https://github.com/drew-eastmond/Forge/wiki/Customized-%22run.js%22-script)
