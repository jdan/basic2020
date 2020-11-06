let fs = require("fs");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let transform = require("./transform");

function evalBasic(code) {
  let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));
  let parsed = parser.parse(code);
  let transformed = transform(parsed);
  let generated = escodegen.generate(transformed);
  return eval(generated);
}

module.exports = evalBasic;

let program = `
  FUNCTION factorial(N)
    IF N <= 1
      RETURN 1
    ELSE
      RETURN N * factorial(N - 1)
    END
  END

  PRINT(factorial(20))
`;
// evalBasic(program);
