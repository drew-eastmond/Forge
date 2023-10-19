// forge/_src_/ts/install.ts
var $fs = require("node:fs/promises");
var { spawn, fork, exec, execSync } = require("child_process");
var path = require("path");
async function $LoadPackageFile(file) {
  const packageData = JSON.parse(await $fs.readFile(file, "utf-8"));
  console.log(packageData);
  if ("dependencies" in packageData) {
    const entries = Object.entries(packageData["dependencies"]);
    for (const [package2, version] of entries) {
      InstallPackage(package2, version);
    }
  }
  if ("devDependencies" in packageData) {
    const entries = Object.entries(packageData["devDependencies"]);
    for (const [package2, version] of entries) {
      InstallPackage(package2, version);
    }
  }
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
    const currentPath = path.parse(__filename);
    await $LoadPackageFile(path.resolve(currentPath.dir, "package.json")).catch((error) => {
      console.log(error, "read file failed");
    });
    await $fs.readFile("./.forge").then((fileData) => {
      console.parse("<green>forge already installed");
    }).catch(() => {
      $fs.writeFile("./.forge", "testing");
    });
  })();
}
