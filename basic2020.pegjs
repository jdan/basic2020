start = Program

Program = _ statements:Statement* _
  {
    return {
      type: "Program",
      body: statements,
    }
  }

Statement
  = expression:Expression
    {
      return {
        type: "ExpressionStatement",
        expression,
      }
    }

Expression =
  Assignment / FunctionCall / BinaryExpression / Value

Assignment = left:(Binding) _ "<-" _ right:Expression _
  {
    return {
      type: "AssignmentExpression",
      left,
      right,
    }
  }

Value
  = Number
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
      argument,
    }
  }

Number = digits:[0-9]+
  {
    return {
      type: "Literal",
      raw: digits.join(""),
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

/**********
 Match any sequence of "whitespace" characters
**********/
_ = [ \t\n\r]*
