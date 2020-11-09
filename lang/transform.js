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

let transformStructs = (node) =>
  node && node.type === "StructDeclaration"
    ? {
        type: "FunctionDeclaration",
        id: node.id,
        params: node.params,
        body: {
          type: "BlockStatement",
          body: [
            {
              type: "ReturnStatement",
              argument: {
                type: "ObjectExpression",
                properties: node.params.map((param) => ({
                  type: "Property",
                  key: param,
                  value: param,
                })),
              },
            },
          ],
        },
      }
    : node;

let getPreambleMap = (preamble) => {
  const DEFAULT_MODE = "cli";
  const DEFAULT_PREAMBLE = {
    mode: DEFAULT_MODE,
  };

  if (!preamble) {
    return DEFAULT_PREAMBLE;
  }

  let result = {};
  preamble.forEach(([field, value]) => {
    result[field.toLowerCase()] = value;
  });

  return {
    mode: DEFAULT_MODE,
    ...result,
  };
};

// This is likely to get stale as more fields are added to
// the preamble options
let buildPreambleComment = ({ name, author, date }) => {
  let output = `/**
 * BASIC2020 GENERATED OUTPUT
 *   EDIT AT YOUR OWN RISK
`;

  if (name || author || date) {
    output += " *\n";
  }

  if (name) {
    output += ` * name: ${name}\n`;
  }

  if (author) {
    output += ` * author: ${author}\n`;
  }

  if (date) {
    output += ` * date: ${date}\n`;
  }

  output += " **/";

  return output;
};

let buildPreambleFunctions = ({ mode }) => {
  if (mode === "cli") {
    // What about lower case print?
    return `function PRINT(...args) {
  console.log(...args)
}`;
  }

  return "";
};

const PREAMBLE_FIELD = "GENERATED_preamble";
exports.PREAMBLE_FIELD = PREAMBLE_FIELD;

let transformPreamble = (node) => {
  if (!node || node.type !== "Program") {
    return node;
  }

  let preambleMap = getPreambleMap(node.preamble);
  return {
    ...node,
    [PREAMBLE_FIELD]: `${buildPreambleComment(
      preambleMap
    )}\n\n${buildPreambleFunctions(preambleMap)}`,
  };
};

let transforms = [
  transformPreamble,
  transformStructs,
  transformEqualOperator,
  transformNotEqualOperator,
];

let applyTransforms = (item) => transforms.reduce((acc, f) => f(acc), item);

exports.transform = function transform(ast) {
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
