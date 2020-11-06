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

true;

module.exports = run;
