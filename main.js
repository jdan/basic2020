let fs = require("fs");
let pegjs = require("pegjs");

let parser = pegjs.generate(fs.readFileSync("./basic2020.pegjs", "utf-8"));

console.log(
  JSON.stringify(
    parser.parse(`
    (x + x)(x)
  `),
    null,
    2
  )
);
