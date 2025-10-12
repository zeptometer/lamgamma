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
  let doit = (): result<Interpreter.RuntimeVal.t, evalError> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` _treeSitterParser.parse(_input).rootNode `)
    let venv = Interpreter.Env.make()
    let nenv = Interpreter.Env.make()

    SyntaxNodeParser.parseSourceFileNode(syntaxNode)
    ->Result.mapError(x => ParseError(x))
    ->Result.map(Expr.stripTypeInfo)
    ->Result.flatMap(expr =>
      Interpreter.evaluateRuntime(expr, venv, nenv)->Result.mapError(x => EvalError(x))
    )
  }

  switch doit() {
  | Ok(value) => value->Interpreter.RuntimeVal.toString
  | Error(_) => "error"
  | exception _ => "error"
  }
}

module TypeError = {
  type t =
    | ParseError(SyntaxNodeParser.ParseError.t)
    | TypeError(TypeChecker.TypeError.t)

  let typeError2string = (e: TypeChecker.TypeError.t): string => {
    let locString = (metaData: Expr.MetaData.t): string => {
      let {start: {row: sr, col: sc}, end: {row: er, col: ec}} = metaData
      `(${(sr + 1)->Int.toString},${sc->Int.toString})-` ++
      `(${(er + 1)->Int.toString},${ec->Int.toString})`
    }

    open TypeChecker.TypeError
    switch e {
    | TypeMismatch({metaData, expected, actual}) =>
      `${locString(metaData)} Type error: expected ${Typ.toString(
          expected,
        )}, but got ${Typ.toString(actual)}`

    | ClassifierMismatch({metaData, current, spliced}) =>
      `${locString(
          metaData,
        )} Type error: spliced classifier ${spliced->Classifier.toString} is inconsistent classifier with ${current->Classifier.toString}`

    | ClassifierEscape({metaData}) =>
      `${locString(metaData)} Type error: classifier escape detected`

    | UndefinedVariable({metaData, var}) =>
      `${locString(metaData)} Undefined variable: ${var->Var.toString}`

    | InsufficientTypeAnnotation({metaData}) =>
      `${locString(metaData)} Insufficient type annotation`

    | UnsupportedFormat({metaData, message}) =>
      `${locString(metaData)} Unsupported format: ${message}`
    | UndefinedClassifier({metaData, cls}) =>
      `${locString(metaData)} Undefined classifier: ${cls->Classifier.toString}`
    | MalformedSplice({metaData, shift}) =>
      `${locString(metaData)} Shift in splice is too large: ${shift->Int.toString}`
    }
  }

  let toString = (e: t): string =>
    switch e {
    | ParseError(e) => parseError2string(e)
    | TypeError(e) => typeError2string(e)
    }
}

let parse = (_input: string, _treeSitterParser: 'a): result<
  Expr.t,
  SyntaxNodeParser.ParseError.t,
> => {
  let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` _treeSitterParser.parse(_input).rootNode `)

  SyntaxNodeParser.parseSourceFileNode(syntaxNode)
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

@genType
let stripTypeInfo = (_input: string, _treeSitterParser: 'a): string => {
  let doit = (): result<string, TypeError.t> => {
    let syntaxNode: SyntaxNodeParser.syntaxNode = %raw(` _treeSitterParser.parse(_input).rootNode `)

    SyntaxNodeParser.parseSourceFileNode(syntaxNode)
    ->Result.mapError(x => TypeError.ParseError(x))
    ->Result.map(Expr.stripTypeInfo)
    ->Result.map(RawExpr.toString)
  }

  switch doit() {
  | Ok(s) => s
  | Error(e) => TypeError.toString(e)
  | exception e =>
    Console.log(e)
    "error"
  }
}
