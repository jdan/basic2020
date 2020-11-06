start = Program

Program = _ body:Statement* _
  {
    return {
      type: "Program",
      body,
    }
  }

Statement
  = IfStatement
  / VariableDeclaration
  / expression:Expression
    {
      return {
        type: "ExpressionStatement",
        expression,
      }
    }

IfStatement
  = "if"i _ test:Expression _ consequent:BlockStatement _ "else"i _ alternate:BlockStatement _ "end"i
    {
      return {
        type: "IfStatement",
        test,
        consequent,
        alternate,
      }
    }
  / "if"i _ test:Expression _ consequent:BlockStatement _ "end"i  // can we combine these?
    {
      return {
        type: "IfStatement",
        test,
        consequent,
        alternate: null,
      }
    }

BlockStatement = _ body:Statement* _
  {
    return {
      type: "BlockStatement",
      body,
    }
  }

VariableDeclaration = id:(Binding) _ "<-" _ init:Expression _
  {
    return {
      type: "VariableDeclaration",
      kind: "let",
      declarations: [
        {
          type: "VariableDeclarator",
          id,
          init,
        }
      ]
    }
  }

Expression = FunctionCall / BinaryExpression / Value

Value
  = Number
  / String
  / Boolean
  / Binding
  / '(' _ expr:Expression _ ')' { return expr }

BinaryExpression = left:Value _ operator:Operator _ right:Expression
  {
    return {
      type: "BinaryExpression",
      left,
      operator,
      right,
    }
  }

FunctionCall = callee:Value _ "(" _ argument:Expression _ ")"
  {
    return {
      type: "CallExpression",
      callee,
      arguments: [argument],
    }
  }

Number = digits:[0-9]+
  {
    let inp = digits.join("");

    return {
      type: "Literal",
      raw: inp,
      value: parseInt(inp),
    }
  }
String
  = '"' value:[^"]* '"'
    {
      return {
        type: "Literal",
        value: value.join(""),
        raw: `"${value.join("")}"`,
      }
    }
  / "'" value:[^']* "'"
    {
      return {
        type: "Literal",
        value: value.join(""),
        raw: `'${value.join("")}'`,
      }
    }
Operator = operator:[\*\+]
Binding = name:([A-Za-z][A-Za-z0-9\$_]*)
  {
    return {
      type: "Identifier",
      name: name.flat().join(""),
    }
  }
Boolean
  = "true"i { return { type: "Literal", raw: "true", value: true } }
  / "false"i { return { type: "Literal", raw: "false", value: false } }

/**********
 Match any sequence of "whitespace" characters
**********/
_ = [ \t\n\r]*
