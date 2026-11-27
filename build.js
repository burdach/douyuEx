const fs = require("fs");
const path = require("path");
const uglifyjs = require("uglify-js");

let css = "";
let js = "";

function compareAscii(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function handleFolder(folderPath, excludingFileName) {
  // 按确定性顺序读取文件夹中的所有文件和子文件夹
  fs.readdirSync(folderPath)
    .sort(compareAscii)
    .forEach((item) => {
      const itemPath = path.join(folderPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        handleFolder(itemPath, excludingFileName);
      } else {
        if (item !== excludingFileName) {
          const fileContent = fs.readFileSync(itemPath, "utf8");
          if (item.endsWith(".css")) css += fileContent + "\r\n";
          if (item.endsWith(".js")) js += fileContent + "\r\n";
        }
      }
    });
}

function getVersion() {
  const mainContent = fs.readFileSync("./src/main.js", "utf8");
  const mainMatch = mainContent.match(/^\/\/\s*@version\s+(\S+)/m);
  if (mainMatch && mainMatch[1]) {
    return mainMatch[1].trim();
  }

  for (const fallbackPath of ["./src/common.js", "./src/packages/Update/Update.js"]) {
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf8");
      const match = content.match(/var curVersion\s*=\s*"(.*?)"/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  throw new Error("Unable to determine version from src/main.js, src/common.js, or Update.js");
}

function generateVersion() {
  const version = getVersion();
  fs.mkdirSync("./dist", { recursive: true });
  fs.writeFileSync("./dist/douyuex_version.txt", version);
  return version;
}

function treeShakeOnce(code) {
  return uglifyjs.minify(code, {
    toplevel: true,
    compress: {
      toplevel: true,
      unused: true,
      dead_code: true,
      side_effects: false,
      passes: 1,
      collapse_vars: false,
      reduce_vars: false,
      conditionals: false,
      comparisons: false,
      evaluate: false,
      booleans: false,
      typeofs: false,
      loops: false,
      if_return: false,
      inline: false,
      join_vars: false,
      sequences: false,
      properties: false,
      switches: false,
      hoist_props: false,
    },
    mangle: false,
    output: {
      beautify: true,
      comments: false,
    },
  });
}

function treeShake(code) {
  const originalSize = Buffer.byteLength(code);
  console.log(`[Tree Shake] 原始大小: ${originalSize} 字节`);

  let current = code;
  let round = 0;
  while (true) {
    round++;
    const result = treeShakeOnce(current);
    if (result.error) {
      console.error(`[Tree Shake] 第 ${round} 轮错误:`, result.error);
      return current;
    }
    const prevSize = Buffer.byteLength(current);
    const newSize = Buffer.byteLength(result.code);
    const diff = prevSize - newSize;
    console.log(`[Tree Shake] 第 ${round} 轮: ${prevSize} -> ${newSize} 字节, 减少 ${diff} 字节`);
    if (diff <= 0) break;
    current = result.code;
  }

  const finalSize = Buffer.byteLength(current);
  const totalSaved = originalSize - finalSize;
  const savedPercent = ((totalSaved / originalSize) * 100).toFixed(1);
  console.log(`[Tree Shake] 完成! 共 ${round} 轮, 减少 ${totalSaved} 字节 (${savedPercent}%)`);
  return current;
}

function extractHeader(code) {
  const endTag = "// ==/UserScript==";
  const idx = code.indexOf(endTag);
  if (idx === -1) return { header: "", body: code };
  const splitPos = idx + endTag.length;
  return {
    header: code.substring(0, splitPos) + "\r\n",
    body: code.substring(splitPos),
  };
}

function build() {
  fs.mkdirSync("./dist", { recursive: true });
  const version = generateVersion();
  handleFolder("./src", "main.js");
  css = css.replace(/\r?\n/g, "");
  let template = fs.readFileSync("./src/main.js", "utf8");
  template = template
    .replace("/*编译器标记 勿删*/", () => css)
    .replace("// 编译器标记 勿删", () => js)
    .replace(/var curVersion\s*=\s*".*?";/, () => `var curVersion = "${version}";`);

  const { header, body } = extractHeader(template);
  const shakenBody = treeShake(body);

  fs.writeFileSync("./dist/douyuex.js", header + shakenBody);

  const result = uglifyjs.minify(shakenBody, { toplevel: true });
  if (result.error) {
    throw result.error;
  }
  fs.writeFileSync("./dist/douyuex.user.js", header + result.code);
}

build();
