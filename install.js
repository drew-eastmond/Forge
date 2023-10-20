// forge/_src_/ts/core/Core.ts
var __HashCount = 0;
function __CatchException(error) {
  return error;
}
function EmptyFunction() {
}
function EncodeBase64(json) {
  const jsonStringify = JSON.stringify(json);
  const buffer = Buffer.from(jsonStringify);
  const base64data = buffer.toString("base64");
  return base64data;
}
function DecodeBase64(value) {
  const buff = Buffer.from(value, "base64");
  return buff.toString("ascii");
}
function Inject(command, api) {
  for (const [key, value] of Object.entries(api)) {
    command = command.replace(new RegExp(`{${key}}`, "g"), value);
  }
}
function FlattenObject(obj, accessor) {
  accessor = accessor === void 0 ? "" : accessor;
  const results = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentAccess = accessor == "" ? key : `${accessor}.${key}`;
    if (typeof obj[key] == "object" && obj[key] !== null) {
      results.push(...FlattenObject(obj[key], currentAccess));
    } else {
      results.push({ access: currentAccess, value });
    }
  }
  return results;
}
function s4(seed) {
  return Math.floor((1 + seed) * 65536).toString(16).substring(1);
}
function QuickHash() {
  return s4(++__HashCount) + s4(Math.random()) + "-" + s4(++__HashCount) + "-" + s4(Math.random()) + "-" + s4(++__HashCount) + "-" + s4((/* @__PURE__ */ new Date()).getTime()) + s4(++__HashCount) + s4(Math.random());
}
function $UsePromise() {
  let resolveCallback;
  let rejectCallback;
  const promise = new Promise(function(resolve, reject) {
    resolveCallback = resolve;
    rejectCallback = reject;
  });
  return [promise, resolveCallback, rejectCallback];
}
function $UseRace(delay, capture) {
  let resolveCallback;
  let rejectCallback;
  let promise;
  Promise;
  if (capture) {
    promise = new Promise(function(resolve, reject) {
      resolveCallback = resolve;
      rejectCallback = reject;
      if (delay === void 0)
        return;
      setTimeout(function() {
        reject(new Error("race rejected"));
      }, delay);
    }).catch(capture);
  } else {
    promise = new Promise(function(resolve, reject) {
      resolveCallback = resolve;
      rejectCallback = reject;
      if (delay === void 0)
        return;
      setTimeout(function() {
        reject(new Error("race rejected"));
      }, delay);
    });
  }
  return [promise, resolveCallback, rejectCallback];
}

// forge/_src_/ts/core/Argument.ts
var AbstractArguments = class {
  _args = {};
  _validationMap = /* @__PURE__ */ new Map();
  _errors = [];
  constructor() {
  }
  /**
   * This function will 
   *      1. Inject a default if no value is provided
   *      2. Test if it is a required parameter, or add to internal errors 
   *      3. Sanitize the value via the `validation.validator` delegate
   * 
   * @param key {string} The key extracted from parsing
   * @param value {unknown} The value extracted from parsing
   * @param validation {ValidationEntry} Provides info for default, is required, and a validator to sanitize the 
   * @returns {unknown} If the `validation` param has a delegate then it will sanitize value.
   */
  _validate(key, value, validation) {
    if (validation.default !== void 0)
      value = value === void 0 ? validation.default : value;
    if (validation.required && value === void 0) {
      const errorMessage = validation.error || `\x1B[31; 1mRequired value for \x1B[36; 1m--${key}--\x1B[0m\x1B[31; 1m argument\x1B[0m)`;
      this._errors.push(errorMessage);
    }
    if (validation.validate) {
      const result = validation.validate(value, this._args);
      if (result === false || result === void 0) {
        const errorMessage = validation.error || `\x1B[31; 1mValidation Failed for \x1B[36; 1m--${key}--\x1B[0m\x1B[31; 1m argument\x1B[0m)`;
        this._errors.push(errorMessage);
      } else if (result instanceof Error) {
        const error = result;
        const errorMessage = error.message;
        this._errors.push(errorMessage);
      }
    }
    if (validation.sanitize) {
      const result = validation.sanitize(value, this._args);
      if (result && result instanceof Error) {
        const error = result;
        const errorMessage = error.message || `\x1B[31; 1mSanitation Failed for \x1B[36; 1m--${key}--\x1B[0m\x1B[31; 1m argument\x1B[0m)`;
        this._errors.push(errorMessage);
      }
      return result;
    }
    return value;
  }
  get(key) {
    return key === void 0 ? this._args : this._args[key];
  }
  /**
   * Assigns a validation check to specific arguments via the key provided
   * 
   * @param key 
   * @param validationEntry {ValidationEntry}
   * @returns {this} return this so you can daisy chain calls
   */
  add(key, validationEntry) {
    this._validationMap.set(key, {
      default: validationEntry.default,
      sanitize: validationEntry.sanitize,
      required: validationEntry.required || false,
      error: validationEntry.error
    });
    return this;
  }
  /**
   * Subclasses are responsible for assigning a data source (CLI, .Env, Remote/Server) into a arguments {Record<string, unknown>}
   *      1. After using `add` member to set all the validation entries. 
   *      2. `compile` will validate/sanitize each entry. If there any errors then join all errors messages into a single Error and throw it!
   */
  compile() {
    for (const [key, validation] of this._validationMap) {
      const value = this._args[key];
      this._args[key] = this._validate(key, value, validation);
    }
    if (this._errors.length) {
      console.log(this._errors);
      throw new Error(this._errors.join("\n"));
    }
  }
};
var CLIArguments = class extends AbstractArguments {
  compile() {
    const args = process.argv;
    for (let i = 2; i < args.length; i) {
      const keyQuery = args[i++];
      if (/{{(.+?)}}/.test(keyQuery)) {
        const results = /{{(.+?)}}/.exec(keyQuery);
        const base64 = args[i++];
        this._args[results[1]] = JSON.parse(DecodeBase64(base64));
      } else if (/--(.+?)--/.test(keyQuery)) {
        const results = /--(.+?)--/.exec(keyQuery);
        this._args[results[1]] = args[i++];
      } else if (/--(.+?)$/.test(keyQuery)) {
        const results = /--(.+?)$/.exec(keyQuery);
        this._args[results[1]] = true;
      } else {
        throw new Error(`(Executing) node ${args.slice(1).join(" ")}

\x1B[31;1mIncorrect formatting encountered parsing key arguments : "\x1B[34;1m${keyQuery}\x1B[31;1m"\x1B[0m
${JSON.stringify(this._args, void 0, 2)}`);
      }
    }
    super.compile();
  }
};
var EnvArguments = class extends AbstractArguments {
  get(key) {
    return key === void 0 ? { ...this._args, ...process.env } : this._args[key] || process.env[key];
  }
  /* public compile(): void {
  
          /*
          * 1. We only have to parse entries in the `this._validationMap` 
          * /
          for (const [key, validation] of this._validationMap) {
           
              const value: unknown = this.get(key);
              this._args[key] = validation.sanitize(value);
  
          }
  
      } */
  // todo change to rexexp 
  /**
   * Simple split alorithm to populate the arguemnt store
   * @param contents {string} Content pulled from a .env or similiar formatted content; or you know... DIY if your a smart ass!
   * @returns {this} Daisy chain this bad boi!
   */
  parse(contents) {
    for (const line of contents.split(/\n/)) {
      const [key, value] = line.split("=");
      this._args[key] = value;
    }
    return this;
  }
};
var CompositeArguments = class extends AbstractArguments {
  _cliArguments = new CLIArguments();
  _envArguments = new EnvArguments();
  compile() {
    this._cliArguments.compile();
    this._envArguments.compile();
    const entries = {
      ...this._envArguments.get(),
      ...this._cliArguments.get()
    };
    for (const [key, value] of Object.entries(entries)) {
      this._args[key] = value;
    }
    super.compile();
  }
  /**
   * Invokes the `EnvArgument.parse ( ... )` 
   * 
   * @param contents 
   * @returns {this}
   */
  parse(contents) {
    this._envArguments.parse(contents);
    return this;
  }
};

// forge/_src_/ts/core/Debug.ts
var DebugForeground = /* @__PURE__ */ ((DebugForeground2) => {
  DebugForeground2["Black"] = "\x1B[30m";
  DebugForeground2["Red"] = "\x1B[31m";
  DebugForeground2["Green"] = "\x1B[32m";
  DebugForeground2["Yellow"] = "\x1B[33m";
  DebugForeground2["Blue"] = "\x1B[34m";
  DebugForeground2["Magenta"] = "\x1B[35m";
  DebugForeground2["Cyan"] = "\x1B[36m";
  DebugForeground2["White"] = "\x1B[37m";
  DebugForeground2["Bright"] = "\x1B[1m";
  DebugForeground2["Dim"] = "\x1B[2m";
  DebugForeground2["Underscore"] = "\x1B[4m";
  DebugForeground2["Blink"] = "\x1B[5m";
  DebugForeground2["Reverse"] = "\x1B[7m";
  DebugForeground2["Hidden"] = "\x1B[8m";
  DebugForeground2["BrightBlack"] = "\x1B[30m;1m";
  DebugForeground2["BrightRed"] = "\x1B[31m;1m";
  DebugForeground2["BrightGreen"] = "\x1B[32m;1m";
  DebugForeground2["BrightYellow"] = "\x1B[33m;1m";
  DebugForeground2["BrightBlue"] = "\x1B[34m;1m";
  DebugForeground2["BrightMagenta"] = "\x1B[35m;1m";
  DebugForeground2["BrightCyan"] = "\x1B[36m;1m";
  DebugForeground2["BrightWhite"] = "\x1B[37m;1m";
  return DebugForeground2;
})(DebugForeground || {});
var DebugBackground = /* @__PURE__ */ ((DebugBackground2) => {
  DebugBackground2["Black"] = "\x1B[40m";
  DebugBackground2["Red"] = "\x1B[41m";
  DebugBackground2["Green"] = "\x1B[42m";
  DebugBackground2["Yellow"] = "\x1B[43m";
  DebugBackground2["Blue"] = "\x1B[44m";
  DebugBackground2["Magenta"] = "\x1B[45m";
  DebugBackground2["Cyan"] = "\x1B[46m";
  DebugBackground2["White"] = "\x1B[47m";
  DebugBackground2["Grey"] = "\x1B[40m";
  DebugBackground2["BrightBlack"] = "\x1B[40;1m";
  DebugBackground2["BrightRed"] = "\x1B[41;1m";
  DebugBackground2["BrightGreen"] = "\x1B[42;1m";
  DebugBackground2["BrightYellow"] = "\x1B[43;1m";
  DebugBackground2["BrightBlue"] = "\x1B[44;1m";
  DebugBackground2["BrightMagenta"] = "\x1B[45;1m";
  DebugBackground2["BrightCyan"] = "\x1B[46;1m";
  DebugBackground2["BrightWhite"] = "\x1B[47;1m";
  return DebugBackground2;
})(DebugBackground || {});
var ColourFormattingReset = "\x1B[0m";
var ColourFormatting = class {
  _debugFormatter;
  stack;
  _defaultColour;
  constructor(debugFormatter, defaultColour) {
    this._debugFormatter = debugFormatter;
    this._defaultColour = defaultColour || "\x1B[0m";
    this.stack = [];
  }
  size() {
    return this.stack.length;
  }
  current() {
    return this.stack[this.stack.length - 1] || this._defaultColour;
  }
  clear() {
    this.stack = [];
  }
  push(value) {
    this._debugFormatter.write(value);
    this.stack.push(value);
    return this._debugFormatter;
  }
  pop() {
    if (this.stack.length == 0) {
      this._debugFormatter.write(this._defaultColour);
    } else {
      this.stack.pop();
      const formattingColor = this.stack[this.stack.length - 1] || this._defaultColour;
      this._debugFormatter.write(formattingColor);
    }
    return this._debugFormatter;
  }
};
var DebugFormatter = class {
  static Init(options) {
    __DebugFormatter;
  }
  foreground;
  fg;
  background;
  bg;
  stream = "";
  constructor() {
    this.foreground = this.fg = new ColourFormatting(this, "\x1B[32m" /* Green */);
    this.background = this.bg = new ColourFormatting(this, "\x1B[40m" /* Grey */);
  }
  clear() {
    this.stream = "";
    this.foreground.clear();
    this.background.clear();
    return this;
  }
  write(value) {
    this.stream += value;
    return this;
  }
  reset() {
    this.stream += "\x1B[0m";
    return this;
  }
  parse(input) {
    const tagsRegExp = /(<([\w$_\.]+)\s*>)|(<\/([\w$_\.]+)\s*>)|(<([\w$_\.]+)\s*\/>)/mg;
    const fragments = [];
    let result;
    let lastIndex = 0;
    while (result = tagsRegExp.exec(input)) {
      if (lastIndex < result.index)
        fragments.push(input.substring(lastIndex, result.index));
      fragments.push(result[0]);
      lastIndex = tagsRegExp.lastIndex;
    }
    if (lastIndex < input.length)
      fragments.push(input.substring(lastIndex));
    for (const fragment of fragments) {
      switch (fragment.toLowerCase()) {
        case "<black>":
        case "<fg.black>":
          this.foreground.push("\x1B[30m" /* Black */);
          break;
        case "<red>":
        case "<fg.red>":
          this.foreground.push("\x1B[31m" /* Red */);
          break;
        case "<green>":
        case "<fg.green>":
          this.foreground.push("\x1B[32m" /* Green */);
          break;
        case "<yellow>":
        case "<fg.yellow>":
          this.foreground.push("\x1B[33m" /* Yellow */);
          break;
        case "<blue>":
        case "<fg.blue>":
          this.foreground.push("\x1B[34m" /* Blue */);
          break;
        case "<magenta>":
        case "<fg.magenta>":
          this.foreground.push("\x1B[35m" /* Magenta */);
          break;
        case "<cyan>":
        case "<fg.cyan>":
          this.foreground.push("\x1B[36m" /* Cyan */);
          break;
        case "<white>":
        case "<fg.white>":
          this.foreground.push("\x1B[37m" /* White */);
          break;
        case "<bg.black>":
          this.background.push("\x1B[40m" /* Black */);
          break;
        case "<bg.red>":
          this.background.push("\x1B[41m" /* Red */);
          break;
        case "<bg.green>":
          this.background.push("\x1B[42m" /* Green */);
          break;
        case "<bg.yellow>":
          this.background.push("\x1B[43m" /* Yellow */);
          break;
        case "<bg.blue>":
          this.background.push("\x1B[44m" /* Blue */);
          break;
        case "<bg.magenta>":
          this.background.push("\x1B[45m" /* Magenta */);
          break;
        case "<bg.cyan>":
          this.background.push("\x1B[46m" /* Cyan */);
          break;
        case "<bg.white>":
          this.background.push("\x1B[47m" /* White */);
          break;
        case "<reset>":
        case "<reset />":
          this.stream += "\x1B[37m";
          break;
        default:
          if (/(<\/(fg\.)?([\w$_]+)\s*>)/.test(fragment)) {
            this.foreground.pop();
          } else if (/(<\/bg\.([\w$_]+)\s*>)/.test(fragment)) {
            this.background.pop();
          } else {
            this.stream += fragment;
          }
      }
    }
    return this;
  }
};
var __DebugFormatter = new DebugFormatter();
console.parse = function(...rest) {
  console.log(...rest.map(function(log) {
    if (log === void 0)
      return void 0;
    if (log.constructor == String)
      return __DebugFormatter.clear().parse(log).reset().stream;
    return log;
  }));
};

// forge/_src_/ts/install.ts
var $fs = require("node:fs/promises");
var { spawn, fork, exec, execSync } = require("child_process");
var path = require("path");
DebugFormatter.Init({ platform: "node" });
var forgeTpl = {
  forge: {
    port: 1234,
    www: false,
    watch: []
  },
  variables: {},
  services: {
    spawn: {},
    fork: {},
    exec: {},
    plugin: {}
  },
  tasks: []
};
async function $installedPackages() {
  return new Promise(function(resolve, reject) {
    const stdio = execSync("pnpm list").toString();
    const lines = stdio.split(/\n/g);
    const dependencies = {};
    for (const line of lines) {
      let matched = false;
      const tokens = line.split(/\s+/g);
      for (const token of tokens) {
        if (/\d+\.\d+\.\d+/.test(token))
          matched = true;
      }
      if (matched)
        dependencies[tokens[0]] = tokens[tokens.length - 1];
    }
    resolve(dependencies);
  });
}
async function $LoadPackageFile(file) {
  const installedPackages = await $installedPackages();
  const packageData = JSON.parse(await $fs.readFile(file, "utf-8"));
  const alreadyInstalledPackages = [];
  if ("dependencies" in packageData) {
    const entries = Object.entries(packageData["dependencies"]);
    for (const [packageName, version] of entries) {
      if (packageName in installedPackages) {
        alreadyInstalledPackages.push(packageName);
      } else {
        InstallPackage(packageName, version);
      }
    }
  }
  if ("devDependencies" in packageData) {
    const entries = Object.entries(packageData["devDependencies"]);
    for (const [packageName, version] of entries) {
      if (packageName in installedPackages) {
        alreadyInstalledPackages.push(packageName);
      } else {
        InstallPackage(packageName, version);
      }
    }
  }
  console.parse(`already installed: <yellow>${alreadyInstalledPackages.join(", ")}`);
}
function InstallPackage(command, version) {
  execSync(`pnpm install ${command}`, { stdio: "inherit" });
}
function gitClone(url) {
  execSync(`git clone ${url} --branch ${branch} --single-branch`, (error, stdout, stderr) => {
    if (error) {
    } else {
    }
  });
}
if (require.main === module) {
  (async function() {
    const cliArguments = new CLIArguments();
    cliArguments.add("PORT", {
      // required: true,
      default: 1234,
      sanitize: function(value, args) {
        return parseInt(value);
      }
    }).add("INIT", {
      default: false,
      validate: function(value, args) {
        return $fs.existsSync(value);
      }
    }).add("I", {
      default: false,
      validate: function(value, args) {
        return $fs.existsSync(value);
      }
    }).compile();
    const currentPath = path.parse(__filename);
    console.log(currentPath);
    const INIT = cliArguments.get("INIT") || cliArguments.get("I");
    await $LoadPackageFile(path.resolve(currentPath.dir, "package.json")).catch((error) => {
      console.log(error, "read file failed");
    });
    if (INIT) {
      await $fs.readFile("./.forge", "utf-8").then((fileData) => {
        console.parse("<red>'.forge'</forge> already installed");
      }).catch(async (error) => {
        console.log(error);
        $fs.writeFile("./.forge", JSON.stringify(forgeTpl));
      });
    }
  })();
}
