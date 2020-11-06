start = Program

Program = _ head:Statement rest:(SEP Statement)* _
  {
    return {
      type: "Program",
      body: [
        head, ...rest.map(pair => pair[1]),
      ]
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
  = "if"i SEP test:Expression SEP consequent:BlockStatement SEP "else"i SEP alternate:BlockStatement SEP "end"i
    {
      return {
        type: "IfStatement",
        test,
        consequent,
        alternate,
      }
    }
  / "if"i SEP test:Expression SEP consequent:BlockStatement SEP "end"i // can we combine these?
    {
      return {
        type: "IfStatement",
        test,
        consequent,
        alternate: null,
      }
    }

BlockStatement = head:Statement rest:(SEP Statement)*
  {
    // console.log([
    //     head,
    //     ...rest.map(pair => pair[1])
    //   ])
    return {
      type: "BlockStatement",
      body: [
        head,
        ...rest.map(pair => pair[1])
      ],
    }
  }

FunctionDeclaration
  = "function"i _ id:Identifier _ "(" _ param:Identifier _ ")" _ body:BlockStatement _ "end"i
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

ReturnStatement = "return"i _ argument:Expression
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
  = "function"i SEP id:Identifier? _ "(" _ param:Identifier _ ")" _ body:BlockStatement _ "end"i
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
