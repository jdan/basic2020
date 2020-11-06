start = Program

Program = _ body:StatementList _
  {
    return {
      type: "Program",
      body,
    }
  }

StatementList = head:Statement rest:(SEP Statement)*
  {
    return [
      head,
      ...rest.map(([space, statement]) => statement),
    ]
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
  = "if"i SEP test:Expression SEP
      consequent:BlockStatement SEP
      alternateBlock:("else"i SEP alternate:BlockStatement SEP)?
      "end"i
    {
      let alternate = alternateBlock ? alternateBlock[2] : null
      return {
        type: "IfStatement",
        test,
        consequent,
        alternate,
      }
    }

BlockStatement = body:StatementList
  {
    return {
      type: "BlockStatement",
      body,
    }
  }

FunctionDeclaration
  = "function"i SEP id:Identifier _ "(" _ param:Identifier _ ")" _ body:BlockStatement SEP "end"i
  {
    return {
      type: "FunctionDeclaration",
      id,
      params: [ param ],
      body,
    }
  }

VariableDeclaration = id:Identifier _ "<-" _ init:Expression
  {
    return {
      type: "VariableDeclaration",
      kind: "var",
      declarations: [
        {
          type: "VariableDeclarator",
          id,
          init,
        }
      ]
    }
  }

ReturnStatement = "return"i SEP argument:Expression
  {
    return {
      type: "ReturnStatement",
      argument,
    }
  }

Expression = BinaryExpression / UnaryExpression

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
  = "function"i SEP id:Identifier? _ "(" _ param:Identifier _ ")" _ body:BlockStatement SEP "end"i
    {
      return {
        type: "FunctionExpression",
        id,
        params: [param],
        body,
      }
    }

UnaryExpression = FunctionExpression / FunctionCall / Value

BinaryExpression = head:UnaryExpression rest:(_ Operator _ UnaryExpression)+
  {
    // Binary expressions are left-recursive
    // i.e. 3-1-2 == (3-1)-2
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
Identifier = !ReservedWord name:([A-Za-z][A-Za-z0-9\$_]*)
  {
    return {
      type: "Identifier",
      name: name.flat().join(""),
    }
  }
Boolean
  = "true"i { return { type: "Literal", raw: "true", value: true } }
  / "false"i { return { type: "Literal", raw: "false", value: false } }

// TODO: Make tokens of these to use everywhere
ReservedWord = "if"i / "else"i / "end"i / "function"i

// Optional whitespace
_ = [ \t\n\r]*

// Mandatory whitespace
SEP = [ \t\n\r]+
