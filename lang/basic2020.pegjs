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
  = IF SEP test:Expression SEP
      consequent:BlockStatement SEP
      alternateBlock:(ELSE SEP alternate:BlockStatement SEP)?
    ENDIF
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
  = FN SEP id:Identifier _ "(" _ param:Identifier _ ")" _ body:BlockStatement SEP ENDFN
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

ReturnStatement = RETURN SEP argument:Expression
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

FunctionCall = callee:Value _ "(" _ argument:Expression _ ")"
  {
    return {
      type: "CallExpression",
      callee,
      arguments: [argument],
    }
  }

FunctionExpression
  = FN SEP id:Identifier? _ "(" _ param:Identifier _ ")" _ body:BlockStatement SEP ENDFN
    {
      return {
        type: "FunctionExpression",
        id,
        params: [param],
        body,
      }
    }

UnaryExpression = FunctionExpression / FunctionCall / Value

// TODO: Parse > above +
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

IF = "if"i
ELSE = "else"i
ENDIF = "endif"i
FN = "fn"i
ENDFN = "endfn"i
RETURN = "return"i

ReservedWord = IF / ELSE / ENDIF / FN / ENDFN / RETURN

// Optional whitespace
_ = [ \t\n\r]*

// Mandatory whitespace
SEP = [ \t\n\r]+
