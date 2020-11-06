let fs = require("fs");
let pegjs = require("pegjs");
let escodegen = require("escodegen");
let transform = require("./transform");

let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));

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

let parsed = parser.parse(program);
let transformed = transform(parsed);
let generated = escodegen.generate(transformed);
console.log(generated);
eval(generated);
