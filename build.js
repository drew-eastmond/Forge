// forge/_src_/ts/build.ts
var import_esbuild = require("esbuild");

// forge/_src_/ts/core/Core.ts
function DecodeBase64(value) {
  const buff = Buffer.from(value, "base64");
  return buff.toString("ascii");
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

// forge/_src_/ts/DependencyHelper.ts
var DependencyHelper = class {
  _dependencies;
  _count = 0;
  constructor(dependencies) {
    this._dependencies = dependencies;
    for (const nodeData of this) {
      nodeData.id = String(this._count++);
    }
  }
  *[Symbol.iterator]() {
    for (const nodeData of this._dependencies) {
      yield nodeData;
      for (const childData of nodeData.children) {
        yield childData;
      }
    }
  }
  _has(file) {
    for (const nodeData of this._dependencies) {
      if (nodeData.title == file)
        return true;
      for (const childData of nodeData.children) {
        if (childData.title == file)
          return true;
      }
    }
    return false;
  }
  _indexOf(file) {
    for (let i = 0; i < this._dependencies.length; i++) {
      const nodeData = this._dependencies[i];
      if (nodeData.title == file)
        return i;
      for (const childData of nodeData.children) {
        if (childData.title == file)
          return i;
      }
    }
    return -1;
  }
  _spliceDependency(file, inputs) {
    const inputIndex = inputs.indexOf(file);
    const startIndex = Math.max(inputIndex - 1, 0);
    for (let i = startIndex; i > -1; i--) {
      const queryFile = inputs[i];
      const queryIndex = this._indexOf(queryFile);
      if (queryIndex > -1) {
        this._dependencies.splice(queryIndex + 1, 0, { id: String(this._count++), title: file, children: [] });
        return;
      }
    }
    const insertIndex = this._dependencies.length - 1;
    this._dependencies.splice(insertIndex, 0, { id: String(this._count++), title: file, children: [] });
  }
  /**
   * intersect :
   * 
   * 
   * @param { string[] } inputs - This is supplied from the esbuild/typescript during each build step
   */
  intersect(inputs) {
    let hasRemoval = true;
    whileRemoval:
      while (hasRemoval) {
        hasRemoval = false;
        for (const nodeData of this._dependencies) {
          const children = nodeData.children;
          for (let i = 0; i < children.length; i++) {
            const childData = children[i];
            const childTitle = childData.title;
            if (inputs.indexOf(childTitle) == -1) {
              children.splice(i, 1);
              hasRemoval = true;
              continue whileRemoval;
            }
          }
        }
      }
    for (const file of inputs) {
      if (this._has(file) === false)
        this._spliceDependency(file, inputs);
    }
    return this._dependencies;
  }
  remove(file) {
    for (let i = 0; i < this._dependencies.length; i++) {
      const nodeData = this._dependencies[i];
      if (nodeData.title == file) {
        this._dependencies.splice(i, 1, ...nodeData.children);
        return;
      }
      for (const childData of nodeData.children) {
        if (childData.title == file) {
          nodeData.children.splice(i, 1, ...nodeData.children);
          return;
        }
      }
    }
  }
};

// forge/_src_/ts/core/Debug.ts
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
    const __DebugFormatter = new DebugFormatter();
    console.parse = function(...rest) {
      console.log(...rest.map(function(log) {
        if (log === void 0)
          return void 0;
        if (log.constructor == String)
          return __DebugFormatter.clear().parse(log).reset().stream;
        return log;
      }));
    };
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
      fragments.push(input.substr(lastIndex));
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

// forge/_src_/ts/build.ts
var path = require("path");
var fs = require("fs");
var $fs = require("node:fs/promises");
var API_BASE = "http://localhost:1234/esbuild/typescript";
var REQUEST_TIMEOUT = 125;
var startTime = Date.now();
function SanitizeFileUrl(...rest) {
  let resolvedUrl = path.resolve(...rest);
  resolvedUrl = /\.\w+$/.test(resolvedUrl) ? resolvedUrl : resolvedUrl + ".ts";
  return resolvedUrl.replace(/[\\\/]+/g, "/");
}
async function $SaveMetaFile(entryFile, outFile, fileManifest, writeMeta) {
  if (writeMeta === true) {
    const outFilePath = path.parse(outFile);
    await $fs.writeFile(outFilePath.dir + "/" + outFilePath.name + ".meta", JSON.stringify(fileManifest));
  }
  const entryName = path.parse(entryFile).base;
  const fetchURL = `${API_BASE}/storage/save/${entryName}/metadata`;
  await fetch(fetchURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(fileManifest),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  }).then(async function(response) {
    console.log("\n!!!meta file savedddd\n", response.code);
  }).catch(function(error) {
    console.parse(`<red>${error.message}</red> from <cyan>${fetchURL}<cyan>`);
  });
}
async function $SortDependencies(code, storeKey, fileManifest) {
  return await fetch(`${API_BASE}/storage/load/${storeKey}/dependencies`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  }).then(async function(response) {
    let dependencyHelper;
    const contentType = response.headers.get("Content-Type");
    switch (contentType) {
      case "application/json":
        dependencyHelper = new DependencyHelper(await response.json());
        dependencyHelper.intersect(fileManifest);
        break;
      default:
        throw new Error(`error fetching dependencies for "${storeKey}"`);
    }
    const compiledSegments = code.split(/[ ]*\/\/\s+(.+?)\.tsx?/g);
    const header = compiledSegments[0];
    const segmentMap = /* @__PURE__ */ new Map();
    for (let i = 1; i < compiledSegments.length; i += 2) {
      for (const file of fileManifest) {
        const importName = SanitizeFileUrl(compiledSegments[i]);
        if (file.indexOf(importName) == 0) {
          segmentMap.set(file, compiledSegments[i + 1]);
          break;
        }
      }
    }
    let output = header;
    for (const nodeData of dependencyHelper) {
      const file = nodeData.title;
      output += `// (Forge) ${file}
` + segmentMap.get(file);
    }
    return output;
  }).catch(function(error) {
    return code;
  });
}
async function $build(entryFile, outFile, options) {
  const outFilePath = path.parse(outFile);
  const result = await (0, import_esbuild.build)({
    entryPoints: [entryFile],
    bundle: options.bundled,
    platform: options.platform,
    write: false,
    // dont produce a build file, but give me the build in as a result
    format: options.format,
    metafile: true,
    loader: { ".ts": "tsx", ".js": "jsx" },
    outdir: outFilePath.dir,
    treeShaking: options.treeShaking
    // plugins: [yourPlugin]
    // external: []
  });
  const fileManifest = Object.keys(result.metafile.inputs);
  let code;
  for (const out of result.outputFiles) {
    code = out.text;
    break;
  }
  await $SaveMetaFile(entryFile, outFile, fileManifest, options.metafile);
  code = await $SortDependencies(code, entryFile, fileManifest.filter(function(value) {
    return /node_modules/.test(value) === false;
  }));
  await $fs.writeFile(outFile, code);
  console.parse(`<green>Build Successful (${((Date.now() - startTime) / 1e3).toFixed(3)}s)</green>
	* ${options.bundled ? "<cyan>bundled</cyan>" : "<blue>unbundled</blue>"} : ${options.bundled}

	* <cyan>format</cyan> : ${options.format}

	* <cyan>platform</cyan> : ${options.platform}
`);
}
async function $watch() {
  const forgeClient = new ForgeClient();
}
DebugFormatter.Init({ platform: "node" });
(async function() {
  const cliArguments = new CLIArguments();
  cliArguments.add("in", {
    required: true,
    validate: (args) => {
      return Object.hasOwn(args, "in");
    },
    error: `\x1B[31;1mMissing or incorrect \x1B[36;1m--in--\x1B[0m\x1B[31;1m argument\x1B[0m`
  }).add("out", {
    required: true,
    validate: (args) => {
      return Object.hasOwn(args, "out");
    },
    error: `\x1B[31;1mMissing or incorrect \x1B[36;1m--out--\x1B[0m\x1B[31;1m argument\x1B[0m`
  }).add("format", {
    default: "cjs"
  }).add("bundled", {
    default: false
  }).add("platform", {
    default: "neutral",
    validate: (value, args) => {
      switch (args) {
        case "node":
        case "neutral":
        case "browser":
          return true;
      }
      return false;
    }
  }).add("override", {
    default: false,
    sanitize: (value, args) => {
      if (args.override)
        return true;
      if (fs.existsSync(args.out) === false)
        return `\x1B[31;1m(Aborting) To prevent accidentally overwritting compile target \x1B[36;1m--out--\x1B[0m. \x1B[31;1mPlease add \x1B[36;1m--override\x1B[0m \x1B[31;1margument\x1B[0m
`;
      return true;
    }
  }).add("write_meta", {
    default: false
  }).add("watch", {
    default: false
  }).add("plugins", {
    default: [],
    sanitize: (value, args) => {
      if (args.plugins === void 0)
        return [];
      return true;
    }
  }).add("external", {
    default: [],
    sanitize: (value, args) => {
      return String(value).split(/\s,/g);
    }
  }).compile();
  const entryFile = cliArguments.get("in");
  const outFile = cliArguments.get("out");
  const override = cliArguments.get("override");
  const format = cliArguments.get("format");
  const bundled = cliArguments.get("bundled");
  const platform = cliArguments.get("platform");
  const writeMeta = cliArguments.get("write_meta");
  const watch = cliArguments.get("watch");
  const externals = cliArguments.get("external");
  console.log("externals", externals);
  const outFilePath = path.parse(outFile);
  if (watch) {
    $watch();
    return;
  } else {
    $build(entryFile, outFile, { bundled, format, platform, metafile: writeMeta, treeShaking: true, write: true });
  }
})();
