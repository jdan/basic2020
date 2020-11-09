let fs = require("fs");
let path = require("path");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let transform = require("./transform");

function getGenerated(code) {
  let parser = pegjs.generate(
    fs.readFileSync(path.join(__dirname, "basic2020.pegjs"), "utf-8")
  );
  let parsed = parser.parse(code);
  let transformed = transform(parsed);
  return escodegen.generate(transformed);
}

function run(code) {
  let generated = getGenerated(code);
  return eval(generated);
}

module.exports = run;

if (require.main === module) {
  let code = "";
  process.stdin.on("data", (line) => {
    code += line.toString();
  });
  process.stdin.on("end", () => {
    let generated = getGenerated(code);

    if (process.argv.find((i) => i === "-v")) {
      console.log("--- BEGIN GENERATED OUTPUT ---");
      console.log(generated);
      console.log("---- END GENERATED OUTPUT ----\n");
    }

    // todo: don't log, require PRINT()
    console.log(eval(generated));
  });
}
