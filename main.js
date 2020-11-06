let fs = require("fs");
let pegjs = require("pegjs");
let escodegen = require("escodegen");

let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));

let program = `
  k <- TRUE
  IF k
    IF FALSE PRINT(3) END
  ELSE
    PRINT(2)
  END
`;

// console.log(JSON.stringify(parser.parse(program), null, 2));
console.log(escodegen.generate(parser.parse(program)));
