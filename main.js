let fs = require("fs");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let transform = require("./transform");

let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));

let program = `
  k <- TRUE
  IF k
    IF FALSE PRINT(3) END
  ELSE
    PRINT(2)
  END
`;

let parsed = parser.parse(program);
let transformed = transform(parsed);
let generated = escodegen.generate(transformed);
console.log(generated);
