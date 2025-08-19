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
| `--worker--`   | [file]     | Worker script file to load. Support both .js and .ts    |
| `--inline--`     | [file]       | Script to execute inline alongside the current context. Has access to base     |
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

<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://github.com/drew-eastmond/Forge/docs/forge-overview.svg">
 <source media="(prefers-color-scheme: light)" srcset="https://github.com/drew-eastmond/Forge/docs/forge-overview.svg">
 <img alt="YOUR-ALT-TEXT" src="https://github.com/drew-eastmond/Forge/docs/forge-overview.svg">
</picture>
