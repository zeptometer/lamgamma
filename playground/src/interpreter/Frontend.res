let parseError2string = (e: SyntaxNodeParser.ParseError.t): string => {
  open SyntaxNodeParser.ParseError
  switch e {
  | SyntaxError({start: {row: sr, column: sc}, end: {row: er, column: ec}}) =>
    let locstring =
      `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
      `(${(er + 1)->Int.toString},${ec->Int.toString})`
    `${locstring} Syntax error`
  | MissingNodeError({start: {row: sr, column: sc}, end: {row: er, column: ec}, missing}) =>
    let locstring =
      `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
      `(${(er + 1)->Int.toString},${ec->Int.toString})`
    `${locstring} Missing node: ${missing}`
  }
}

type evalError =
  | ParseError(SyntaxNodeParser.ParseError.t)
  | EvalError(Interpreter.evalError)

@genType
let evaluate = (_input: string, _treeSitterParser: 'a): string => {
  let doit = (): result<Interpreter.Val.t, evalError> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` _treeSitterParser.parse(_input).rootNode `)
    let env = Interpreter.Env.make()

    SyntaxNodeParser.parseSourceFileNode(syntaxNode)
    ->Result.mapError(x => ParseError(x))
    ->Result.map(Expr.stripTypeInfo)
    ->Result.flatMap(expr => Interpreter.evaluate(expr, env)->Result.mapError(x => EvalError(x)))
  }

  switch doit() {
  | Ok(value) => value->Interpreter.Val.toString
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
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Type error: expected ${Typ.toString(expected)}, but got ${Typ.toString(actual)}`

    | ClassifierMismatch({metaData, current, spliced}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Type error: spliced classifier ${spliced->Classifier.toString} is inconsistent classifier with ${current->Classifier.toString}`

    | ClassifierEscape({metaData}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Type error: classifier escape detected`

    | UndefinedVariable({metaData, var: Var.Raw({name})}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Undefined variable: ${name}`
    | InsufficientTypeAnnotation({metaData}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Insufficient type annotation`

    | UnsupportedFormat({metaData, message}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Unsupported format: ${message}`
    | UndefinedClassifier({metaData, cls}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Undefined classifier: ${cls->Classifier.toString}`
    | MalformedSplice({metaData, shift}) =>
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      let locstring =
        `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
        `(${(er + 1)->Int.toString},${ec->Int.toString})`

      `${locstring} Shift in splice is too large: ${shift->Int.toString}`
    }
  }

  let toString = (e: t): string =>
    switch e {
    | ParseError(e) => parseError2string(e)
    | TypeError(e) => typeError2string(e)
    }
}

@genType
let typeCheck = (_input: string, _treeSitterParser: 'a): string => {
  let doit = (): result<Typ.t, TypeError.t> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` _treeSitterParser.parse(_input).rootNode `)

    SyntaxNodeParser.parseSourceFileNode(syntaxNode)
    ->Result.mapError(x => TypeError.ParseError(x))
    ->Result.flatMap(expr => {
      let env = TypeChecker.GlobalEnv.make()
      TypeChecker.typeCheck(expr, env)->Result.mapError(x => TypeError.TypeError(x))
    })
  }

  switch doit() {
  | Ok(value) => value->Typ.toString
  | Error(e) => TypeError.toString(e)
  | exception e =>
    Console.log(e)
    "error"
  }
}
