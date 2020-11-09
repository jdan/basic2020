let fs = require("fs");
let path = require("path");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let { transform, PREAMBLE_FIELD } = require("./transform");

function getGenerated(code) {
  let parser = pegjs.generate(
    fs.readFileSync(path.join(__dirname, "basic2020.pegjs"), "utf-8")
  );
  let parsed = parser.parse(code);
  let transformed = transform(parsed);
  let generated = escodegen.generate(transformed);
  return `${transformed[PREAMBLE_FIELD]}\n\n${generated}`;
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

    eval(generated);
  });
}
