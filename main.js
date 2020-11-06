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

let transformIfs = (node) =>
  node &&
  node.type === "CallExpression" &&
  node.callee.type === "Identifier" &&
  /^print$/i.test(node.callee.name)
    ? {
        ...node,
        callee: {
          type: "MemberExpression",
          object: {
            type: "Identifier",
            name: "console",
          },
          property: {
            type: "Identifier",
            name: "log",
          },
        },
      }
    : node;

let transforms = [transformIfs];
let applyTransforms = (item) => transforms.reduce((acc, f) => f(acc), item);

let transform = (ast) => {
  ast = applyTransforms(ast);

  if (!ast) {
    return ast;
  } else if (ast.type) {
    for (let field in ast) {
      ast[field] = transform(ast[field]);
    }
    return ast;
  } else if (Array.isArray(ast)) {
    return ast.map((item) =>
      transform(transforms.reduce((acc, f) => f(acc), item))
    );
  } else {
    return transforms.reduce((acc, f) => f(acc), ast);
  }
};

// console.log(JSON.stringify(parser.parse(program), null, 2));
console.log(escodegen.generate(transform(parser.parse(program))));
