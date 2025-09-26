type evalError =
  | ParseError(SyntaxNodeParser.parseError)
  | EvalError(Interpreter.evalError)

@genType
let evaluate = (input: string, treeSitterParser: 'a): string => {
  let doit = (): result<Interpreter.Runtime.val, evalError> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` treeSitterParser.parse(input).rootNode `)

    SyntaxNodeParser.parseSyntaxNode(syntaxNode)
    ->Result.mapError(x => ParseError(x))
    ->Result.map(Expr.stripTypeInfo)
    ->Result.flatMap(expr => Interpreter.evaluate(expr)->Result.mapError(x => EvalError(x)))
  }

  switch doit() {
  | Ok(value) => value->Interpreter.Runtime.toString
  | Error(_) => "error"
  | exception _ => "error"
  }
}

type typeCheckError =
  | ParseError(SyntaxNodeParser.parseError)
  | TypeError(TypeChecker.typeError)

@genType
let typeCheck = (input: string, treeSitterParser: 'a): string => {
  let doit = (): result<Typ.t, typeCheckError> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` treeSitterParser.parse(input).rootNode `)

    SyntaxNodeParser.parseSyntaxNode(syntaxNode)
    ->Result.mapError(x => ParseError(x))
    ->Result.flatMap(expr => TypeChecker.typeCheck(expr)->Result.mapError(x => TypeError(x)))
  }

  switch doit() {
  | Ok(value) => value->Typ.toString
  | Error(_) => "error"
  | exception _ => "error"
  }
}
