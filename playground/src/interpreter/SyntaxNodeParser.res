type loc = {row: int, column: int}

type rec syntaxNode = {
  text: Nullable.t<string>,
  isError: bool,
  hasError: bool,
  isMissing: bool,
  isNamed: bool,
  children: array<syntaxNode>,
  namedChildCount: int,
  @as("type") type_: string,
  namedChild: int => Nullable.t<syntaxNode>,
  startPosition: loc,
  endPosition: loc,
  grammarType: string,
  childForFieldName: string => Nullable.t<syntaxNode>,
  childrenForFieldName: string => array<syntaxNode>,
}

module ParseError = {
  type t =
    | SyntaxError({start: loc, end: loc})
    | MissingNodeError({start: loc, end: loc, missing: string})
}

let rec findParseError = (node: syntaxNode): option<ParseError.t> => {
  if node.isError {
    Some(SyntaxError({start: node.startPosition, end: node.endPosition}))
  } else if node.isMissing {
    Some(
      MissingNodeError({
        start: node.startPosition,
        end: node.endPosition,
        missing: node.grammarType,
      }),
    )
  } else {
    node.children->Array.reduce(None, (acc: option<ParseError.t>, child: syntaxNode) =>
      switch acc {
      | Some(e) => Some(e)
      | None => findParseError(child)
      }
    )
  }
}

exception MalformedNode({msg: string})
exception NotImplemented

let getNamedChildForFieldName = (node: syntaxNode, fieldName: string): option<syntaxNode> => {
  let xs = node.childrenForFieldName(fieldName)->Array.filter(child => child.isNamed)

  if Array.length(xs) == 0 {
    None
  } else if Array.length(xs) > 1 {
    raise(MalformedNode({msg: `More than one named child with field name ${fieldName}`}))
  } else {
    Some(Array.getUnsafe(xs, 0))
  }
}

let getNamedChildForFieldNameUnsafe = (node: syntaxNode, fieldName: string): syntaxNode => {
  switch getNamedChildForFieldName(node, fieldName) {
  | Some(n) => n
  | None => raise(MalformedNode({msg: `No named child with field name ${fieldName}`}))
  }
}

let ok = (x: 'a) => Belt.Result.Ok(x)
let fail = (x: ParseError.t) => Belt.Result.Error(x)

let extractMetadata = (node: syntaxNode): Expr.MetaData.t => {
  {
    Expr.MetaData.start: {
      Expr.MetaData.Position.col: node.startPosition.column,
      row: node.startPosition.row,
    },
    end: {
      Expr.MetaData.Position.col: node.endPosition.column,
      row: node.endPosition.row,
    },
  }
}

@genType
let rec parseTypeNode = (node: syntaxNode): result<Typ.t, ParseError.t> => {
  switch node.type_ {
  | "int_type" => ok(Typ.Int)
  | "bool_type" => ok(Typ.Bool)
  | "func_type" =>
    let paramType =
      node
      ->getNamedChildForFieldNameUnsafe("param")
      ->parseTypeNode

    let returnType =
      node
      ->getNamedChildForFieldNameUnsafe("return")
      ->parseTypeNode

    paramType->Result.flatMap(p => returnType->Result.map(r => Typ.Func(p, r)))

  | _ => raise(MalformedNode({msg: `Unknown node type for type node: ${node.type_}`}))
  }
}

let parseVar = (node: syntaxNode): Var.t => {
  if node.type_ != "identifier" {
    raise(MalformedNode({msg: `Expected identifier node, got ${node.type_}`}))
  }
  let varname = node.text->Nullable.toOption->Option.getExn(~message="Identifier node has no text")
  Var.Raw({name: varname})
}

let parseClassifier = (node: syntaxNode): Classifier.t => {
  if node.type_ != "identifier" {
    raise(MalformedNode({msg: `Expected identifier node, got ${node.type_}`}))
  }
  let varname = node.text->Nullable.toOption->Option.getExn(~message="Identifier node has no text")
  Classifier.Named(varname)
}

let parseParamNode = (node: syntaxNode): result<Expr.Param.t, ParseError.t> => {
  if node.type_ != "param" {
    raise(MalformedNode({msg: `Expected param node, got ${node.type_}`}))
  }

  let var =
    node
    ->getNamedChildForFieldNameUnsafe("var")
    ->parseVar

  let typ = switch node->getNamedChildForFieldName("type") {
  | Some(n) => n->parseTypeNode->Result.map(t => Some(t))
  | None => ok(None)
  }

  let cls = switch node->getNamedChildForFieldName("classifier") {
  | Some(n) => n->parseClassifier
  | None => Classifier.Source.fresh()
  }

  typ->Result.map(t => {
    {Expr.Param.var, typ: t, cls}
  })
}

let parseParamsNode = (node: syntaxNode): result<list<Expr.Param.t>, ParseError.t> => {
  if node.type_ != "params" {
    raise(MalformedNode({msg: `Expected params node, got ${node.type_}`}))
  }

  let rec aux = (idx: int, acc: list<Expr.Param.t>): result<list<Expr.Param.t>, ParseError.t> => {
    if idx >= node.namedChildCount {
      ok(Belt.List.reverse(acc))
    } else {
      node.namedChild(idx)
      ->Nullable.toOption
      ->Option.getExn(~message="namedChild does not exist")
      ->parseParamNode
      ->Result.flatMap(param => aux(idx + 1, Belt.List.add(acc, param)))
    }
  }

  aux(0, list{})
}

@genType
let rec parseExprNode = (node: syntaxNode): result<Expr.t, ParseError.t> => {
  switch node.type_ {
  | "number" =>
    let intval =
      node.text
      ->Nullable.toOption
      ->Option.getExn(~message="Number node has no text")
      ->Int.fromString
      ->Option.getExn(~message="Failed to parse int from string")

    ok({
      Expr.metaData: extractMetadata(node),
      raw: Expr.IntLit(intval),
    })

  | "boolean" =>
    let boolval = switch node.text->Nullable.toOption {
    | Some("true") => true
    | Some("false") => false
    | _ =>
      raise(
        MalformedNode({msg: `Boolean node has invalid text: ${node.text->Nullable.getOr("null")}`}),
      )
    }

    ok({
      Expr.metaData: extractMetadata(node),
      raw: Expr.BoolLit(boolval),
    })

  | "add"
  | "sub"
  | "mult"
  | "div"
  | "mod"
  | "eq"
  | "ne"
  | "lt"
  | "le"
  | "gt"
  | "ge" =>
    let binOpMapping = {
      open Operator.BinOp
      Dict.fromArray([
        ("add", Add),
        ("sub", Sub),
        ("mult", Mul),
        ("div", Div),
        ("mod", Mod),
        ("eq", Eq),
        ("ne", Ne),
        ("lt", Lt),
        ("le", Le),
        ("gt", Gt),
        ("ge", Ge),
      ])
    }

    let left =
      node
      ->getNamedChildForFieldNameUnsafe("left")
      ->parseExprNode

    let right =
      node
      ->getNamedChildForFieldNameUnsafe("right")
      ->parseExprNode

    let op =
      binOpMapping
      ->Dict.get(node.type_)
      ->Option.getExn(~message="Operator not found in mapping")

    left->Result.flatMap(l =>
      right->Result.map(r => {
        {
          Expr.metaData: extractMetadata(node),
          raw: Expr.BinOp({op, left: l, right: r}),
        }
      })
    )

  | "and"
  | "or" =>
    let shortCircuitOpMapping = {
      open Operator.ShortCircuitOp
      Dict.fromArray([("and", And), ("or", Or)])
    }

    let left =
      node
      ->getNamedChildForFieldNameUnsafe("left")
      ->parseExprNode

    let right =
      node
      ->getNamedChildForFieldNameUnsafe("right")
      ->parseExprNode

    let op =
      shortCircuitOpMapping
      ->Dict.get(node.type_)
      ->Option.getExn(~message="Operator not found in mapping")

    left->Result.flatMap(l =>
      right->Result.map(r => {
        {
          Expr.metaData: extractMetadata(node),
          raw: Expr.ShortCircuitOp({op, left: l, right: r}),
        }
      })
    )

  | "not" =>
    if node.namedChildCount != 1 {
      raise(MalformedNode({msg: "not node must have exactly one named child"}))
    } else {
      let expr =
        node.namedChild(0)
        ->Nullable.toOption
        ->Option.getExn(~message="namedChild(0) does not exist")
        ->parseExprNode

      expr->Result.map(e => {
        {
          Expr.metaData: extractMetadata(node),
          raw: Expr.UniOp({op: Operator.UniOp.Not, expr: e}),
        }
      })
    }

  | "ctrl_if" =>
    let cond =
      node
      ->getNamedChildForFieldNameUnsafe("cond")
      ->parseExprNode

    let thenBranch =
      node
      ->getNamedChildForFieldNameUnsafe("then")
      ->parseExprNode

    let elseBranch =
      node
      ->getNamedChildForFieldNameUnsafe("else")
      ->parseExprNode

    cond->Result.flatMap(c =>
      thenBranch->Result.flatMap(t =>
        elseBranch->Result.map(
          e => {
            {
              Expr.metaData: extractMetadata(node),
              raw: Expr.If({cond: c, thenBranch: t, elseBranch: e}),
            }
          },
        )
      )
    )

  | "identifier" =>
    ok({
      Expr.metaData: extractMetadata(node),
      raw: Expr.Var(parseVar(node)),
    })

  | "let" =>
    let param =
      node
      ->getNamedChildForFieldNameUnsafe("param")
      ->parseParamNode

    let valueExpr =
      node
      ->getNamedChildForFieldNameUnsafe("value")
      ->parseExprNode

    let bodyExpr =
      node
      ->getNamedChildForFieldNameUnsafe("body")
      ->parseExprNode

    param->Result.flatMap(p =>
      valueExpr->Result.flatMap(v =>
        bodyExpr->Result.map(
          b => {
            {
              Expr.metaData: extractMetadata(node),
              raw: Expr.Let({
                param: p,
                expr: v,
                body: b,
              }),
            }
          },
        )
      )
    )

  | "letrec" =>
    let param =
      node
      ->getNamedChildForFieldNameUnsafe("param")
      ->parseParamNode

    let valueExpr =
      node
      ->getNamedChildForFieldNameUnsafe("value")
      ->parseExprNode

    let bodyExpr =
      node
      ->getNamedChildForFieldNameUnsafe("body")
      ->parseExprNode

    param->Result.flatMap(p =>
      valueExpr->Result.flatMap(v =>
        bodyExpr->Result.map(
          b => {
            {
              Expr.metaData: extractMetadata(node),
              raw: Expr.LetRec({
                param: p,
                expr: v,
                body: b,
              }),
            }
          },
        )
      )
    )

  | "lambda" =>
    let params =
      node
      ->getNamedChildForFieldNameUnsafe("params")
      ->parseParamsNode

    let returnType = switch node->getNamedChildForFieldName("return_type") {
    | Some(n) => n->parseTypeNode->Result.map(t => Some(t))
    | None => ok(None)
    }

    let body =
      node
      ->getNamedChildForFieldNameUnsafe("body")
      ->parseExprNode

    params->Result.flatMap(p => {
      returnType->Result.flatMap(r => {
        body->Result.map(
          b => {
            Expr.metaData: extractMetadata(node),
            raw: Expr.Func({
              params: p,
              returnType: r,
              body: b,
            }),
          },
        )
      })
    })

  | "application" =>
    let func =
      node
      ->getNamedChildForFieldNameUnsafe("func")
      ->parseExprNode

    let arg =
      node
      ->getNamedChildForFieldNameUnsafe("arg")
      ->parseExprNode

    func->Result.flatMap(f => {
      arg->Result.map(a => {
        {
          Expr.metaData: extractMetadata(node),
          raw: Expr.App({func: f, arg: a}),
        }
      })
    })

  | "quote" =>
    let cls =
      node
      ->getNamedChildForFieldName("classifier")
      ->Belt.Option.map(parseClassifier)
      ->Belt.Option.getWithDefault(Classifier.Source.fresh())

    let expr =
      node
      ->getNamedChildForFieldNameUnsafe("expr")
      ->parseExprNode

    expr->Result.map(e => {
      {
        Expr.metaData: extractMetadata(node),
        raw: Expr.Quote({cls, expr: e}),
      }
    })

  | "splice" =>
    let defaultShift = 1
    let shift =
      node
      ->getNamedChildForFieldName("shift")
      ->Belt.Option.map(n => {
        Nullable.getUnsafe(n.text)
        ->Int.fromString
        ->Option.getExn(~message="Failed to parse int from string")
      })
      ->Belt.Option.getWithDefault(defaultShift)

    let expr =
      node
      ->getNamedChildForFieldNameUnsafe("expr")
      ->parseExprNode

    expr->Result.map(e => {
      {
        Expr.metaData: extractMetadata(node),
        raw: Expr.Splice({shift, expr: e}),
      }
    })

  | _ => raise(NotImplemented)
  }
}

@genType
let parseSourceFileNode = (node: syntaxNode): result<Expr.t, ParseError.t> => {
  let errorOpt = findParseError(node)

  if errorOpt != None {
    fail(Option.getExn(errorOpt))
  } else if node.namedChildCount != 1 {
    raise(MalformedNode({msg: "source_file must have exactly one named child"}))
  } else if node.type_ != "source_file" {
    raise(MalformedNode({msg: `Expected source_file node, got ${node.type_}`}))
  } else {
    node.namedChild(0)
    ->Nullable.toOption
    ->Option.getExn(~message="namedChild(0) does not exist")
    ->parseExprNode
  }
}
