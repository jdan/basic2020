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

let transformEqualOperator = (node) =>
  node && node.type === "BinaryExpression" && node.operator === "="
    ? {
        ...node,
        operator: "===",
      }
    : node;

let transformNotEqualOperator = (node) =>
  node && node.type === "BinaryExpression" && node.operator === "!="
    ? {
        ...node,
        operator: "!==",
      }
    : node;

let transforms = [
  transformIfs,
  transformEqualOperator,
  transformNotEqualOperator,
];

let applyTransforms = (item) => transforms.reduce((acc, f) => f(acc), item);

module.exports = function transform(ast) {
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
