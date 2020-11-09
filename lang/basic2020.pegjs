{
  function leftRecursive(head, rest) {
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

  function possiblyEmptyList(items) {
    if (items == null) {
      return []
    } else {
      let [head, rest] = items
      return [
        head,
        ...rest.map(item => item[3]),
      ]
    }
  }
}

start = Program

Program = _ preamble:(Preamble SEP)? body:StatementList _
  {
    return {
      type: "Program",
      preamble: preamble && preamble.slice(0, -1),
      body,
    }
  }

Preamble = head:PreambleEntry rest:(_ PreambleEntry)*
  {
    return [head, ...rest.map(([_, entry]) => entry)]
  }

PreambleEntry = field:("name"i / "author"i / "mode"i / "date"i) SEP value:[^\n]+
  {
    return [field, value.join("")]
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
  / StructDeclaration
  / StructFieldAssignment
  / VariableAssignment
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
  = FN SEP id:Identifier _ "(" _ params:IdentifierList _ ")" _ body:BlockStatement SEP ENDFN
  {
    return {
      type: "FunctionDeclaration",
      id,
      params,
      body,
    }
  }

StructDeclaration
  = STRUCT SEP id:Identifier _ "(" _ params:IdentifierList _ ")"
  {
    return {
      type: "StructDeclaration",
      id,
      params,
    }
  }

StructFieldAssignment = left:MemberExpression _ "<-" _ right:Expression
  {
    return {
      type: "AssignmentExpression",
      left,
      operator: "=",
      right,
    }
  }

MemberExpression = head:Identifier rest:(_ "." Identifier)+
  {
    // TODO: Might want to make a custom type and transform
    // it to provide good error messages
    return rest.reduce((object, item) => ({
      type: "MemberExpression",
      object,
      property: item[2],
    }), head)
  }

VariableAssignment = id:Identifier _ "<-" _ init:Expression
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

Value
  = Number
  / String
  / Boolean
  / MemberExpression
  / Identifier
  / '(' _ expr:Expression _ ')' { return expr }

FunctionCall = callee:Value _ "(" _ args:ExpressionList _ ")"
  {
    return {
      type: "CallExpression",
      callee,
      arguments: args,
    }
  }

// The order of matches here determines infix operator precedence
//    i.e. 1 + 3 > 4 + 5
//         will evaluate left as `1+3` and right as `4+5` for an
//         expression of `>`
//
// TODO: Binary operations
Expression = ComparisonExpression / BinaryExpression / UnaryExpression

FunctionExpression
  = FN SEP id:Identifier? _ "(" _ params:IdentifierList _ ")" _ body:BlockStatement SEP ENDFN
    {
      return {
        type: "FunctionExpression",
        id,
        params,
        body,
      }
    }

UnaryExpression = FunctionExpression / FunctionCall / Value

ComparisonExpression
  = head:BinaryExpression rest:(_ ComparisonOperator _ BinaryExpression)+
    { return leftRecursive(head, rest) }

BinaryExpression
  = head:UnaryExpression rest:(_ BinaryOperator _ UnaryExpression)+
    { return leftRecursive(head, rest) }
  / UnaryExpression

IdentifierList
  = identifiers:(Identifier (_ "," _ Identifier)*)?
    { return possiblyEmptyList(identifiers) }

ExpressionList
  = expressions:(Expression (_ "," _ Expression)*)?
    { return possiblyEmptyList(expressions) }

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

ComparisonOperator = "!=" / "=" / "<=" / ">=" / "<" / ">"
BinaryOperator = "+" / "-" / "*" / '/'

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
STRUCT = "struct"i

ReservedWord = IF / ELSE / ENDIF / FN / ENDFN / RETURN / STRUCT

// Optional whitespace
_ = [ \t\n\r]*

// Mandatory whitespace
SEP = [ \t\n\r]+
