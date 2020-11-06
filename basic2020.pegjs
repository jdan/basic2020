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
  / FunctionDeclaration
  / VariableDeclaration
  / ReturnStatement
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
  / "if"i _ test:Expression _ consequent:BlockStatement _ "end"i // can we combine these?
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

FunctionDeclaration
  = "function"i _ id:Identifier _ "(" _ param:Identifier _ ")" _ body:BlockStatement _ "end"i _
  {
    return {
      type: "FunctionDeclaration",
      id,
      params: [ param ],
      body,
    }
  }

VariableDeclaration = id:Identifier _ "<-" _ init:Expression _
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

ReturnStatement = "return"i _ argument:Expression
  {
    return {
      type: "ReturnStatement",
      argument,
    }
  }

Expression = FunctionExpression / FunctionCall / BinaryExpression / Value

Value
  = Number
  / String
  / Boolean
  / Identifier
  / '(' _ expr:Expression _ ')' { return expr }

// hmmmmmm putting `_` at the end of this breaks everything
FunctionCall = callee:Value _ "(" _ argument:Expression _ ")"
  {
    return {
      type: "CallExpression",
      callee,
      arguments: [argument],
    }
  }

FunctionExpression
  = "function"i _ id:Identifier? _ "(" _ param:Identifier _ ")" _ body:BlockStatement _ "end"i _
    {
      return {
        type: "FunctionExpression",
        id,
        params: [param],
        body,
      }
    }

BinaryExpression = head:Value rest:(_ Operator _ Value)+
  {
    // Left-recursion: I assume we'll need this for lists of
    // statements and arguments
    return rest.reduce(
      (left, item) => {
        let operator = item[1];
        let right = item[3];

        return {
          type: "BinaryExpression",
          left,
          operator,
          right,
        };
      },
      head
    );
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
Operator = "+" / "-" / "*" / '/' / "!=" / "=" / "<=" / ">=" / "<" / ">"
Identifier = name:([A-Za-z][A-Za-z0-9\$_]*)
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
