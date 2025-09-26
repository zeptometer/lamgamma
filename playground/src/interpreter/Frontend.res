let parseError2string = (e: SyntaxNodeParser.ParseError.t): string => {
  open SyntaxNodeParser.ParseError
  switch e {
  | SyntaxError({start: {row: sr, column: sc}, end: {row: er, column: ec}}) =>
    let locstring = `(${sr->Int.toString},${sc->Int.toString})-(${er->Int.toString},${ec->Int.toString})`
    `${locstring} Syntax error`
  | MissingNodeError({start: {row: sr, column: sc}, end: {row: er, column: ec}, missing}) =>
    let locstring = `(${sr->Int.toString},${sc->Int.toString})-(${er->Int.toString},${ec->Int.toString})`
    `${locstring} Missing node: ${missing}`
  }
}

type evalError =
  | ParseError(SyntaxNodeParser.ParseError.t)
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

module TypeError = {
  type t =
    | ParseError(SyntaxNodeParser.ParseError.t)
    | TypeError(TypeChecker.TypeError.t)

  let typeError2string = (e: TypeChecker.TypeError.t): string => {
    open TypeChecker.TypeError
    switch e {
    | TypeMismatch({metaData, expected, actual}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring = `(${sr->Int.toString},${sc->Int.toString})-(${er->Int.toString},${ec->Int.toString})`

      `${locstring} Type error: expected ${Typ.toString(expected)}, but got ${Typ.toString(actual)}`
    }
  }

  let toString = (e: t): string =>
    switch e {
    | ParseError(e) => parseError2string(e)
    | TypeError(e) => typeError2string(e)
    }
}

@genType
let typeCheck = (input: string, treeSitterParser: 'a): string => {
  let doit = (): result<Typ.t, TypeError.t> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` treeSitterParser.parse(input).rootNode `)

    SyntaxNodeParser.parseSyntaxNode(syntaxNode)
    ->Result.mapError(x => TypeError.ParseError(x))
    ->Result.flatMap(expr =>
      TypeChecker.typeCheck(expr)->Result.mapError(x => TypeError.TypeError(x))
    )
  }

  switch doit() {
  | Ok(value) => value->Typ.toString
  | Error(e) => TypeError.toString(e)
  | exception _ => "error"
  }
}
