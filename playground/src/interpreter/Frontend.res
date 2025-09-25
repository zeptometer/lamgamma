type frontendError =
  | ParseError(SyntaxNodeParser.parseError)
  | EvalError(Interpreter.evalError)

@genType
let evaluate = (input: string, treeSitterParser: 'a): string => {
  let doit = (): result<string, frontendError> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` treeSitterParser.parse(input).rootNode `)

    SyntaxNodeParser.parseSyntaxNode(syntaxNode)
    ->Result.mapError(x => ParseError(x))
    ->Result.map(Expr.stripTypeInfo)
    ->Result.flatMap(expr => Interpreter.evaluate(expr)->Result.mapError(x => EvalError(x)))
    ->Result.map(Interpreter.Runtime.toString)
  }

  switch doit() {
  | Ok(value) => value
  | Error(_) => "error"
  | exception _ => "error"
  }
}
