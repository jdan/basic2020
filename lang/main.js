let fs = require("fs");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let transform = require("./transform");

function run(code) {
  let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));
  let parsed = parser.parse(code);
  let transformed = transform(parsed);
  let generated = escodegen.generate(transformed);
  return eval(generated);
}

module.exports = run;

if (require.main === module) {
  let code = "";
  process.stdin.on("data", (line) => {
    code += line.toString();
  });
  process.stdin.on("end", () => {
    let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));
    let parsed = parser.parse(code);
    let transformed = transform(parsed);
    let generated = escodegen.generate(transformed);

    if (process.argv.find((i) => i === "-v")) {
      console.log("--- BEGIN GENERATED OUTPUT ---");
      console.log(generated);
      console.log("---- END GENERATED OUTPUT ----\n");
    }

    // todo: don't log, require PRINT()
    console.log(eval(generated));
  });
}
