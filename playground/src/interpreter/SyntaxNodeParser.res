type loc = {row: int, column: int}

type rec syntaxNode = {
  text: Nullable.t<string>,
  isError: bool,
  isMissing: bool,
  namedChildCount: int,
  @as("type") type_: string,
  namedChild: int => Nullable.t<syntaxNode>,
  startPosition: loc,
  endPosition: loc,
  grammarType: string,
  childForFieldName: string => Nullable.t<syntaxNode>,
}

module ParseError = {
  type t =
    | SyntaxError({start: loc, end: loc})
    | MissingNodeError({start: loc, end: loc, missing: string})
}

exception NodeCountMismatch({expected: int, actual: int, node: syntaxNode})
exception UnexpectedText({text: option<string>})
exception UnexpectedNodeType({expected: string, actual: string})
exception NotImplemented

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

let validateNode = (node: syntaxNode): result<unit, ParseError.t> => {
  if node.isError {
    fail(SyntaxError({start: node.startPosition, end: node.endPosition}))
  } else if node.isMissing {
    fail(
      MissingNodeError({
        start: node.startPosition,
        end: node.endPosition,
        missing: node.grammarType,
      }),
    )
  } else {
    ok()
  }
}

@genType
let parseTypeNode = (node: syntaxNode): result<Typ.t, ParseError.t> => {
  validateNode(node)->Result.map(_ => {
    switch node.type_ {
    | "int_type" => Typ.Int
    | "bool_type" => Typ.Bool
    | _ => raise(UnexpectedNodeType({expected: "int_type | bool_type", actual: node.type_}))
    }
  })
}

let parseIdentifierNode = (node: syntaxNode): result<Var.t, ParseError.t> => {
  validateNode(node)->Result.map(_ => {
    if node.type_ != "identifier" {
      raise(UnexpectedNodeType({expected: "identifier", actual: node.type_}))
    }
    let varname =
      node.text->Nullable.toOption->Option.getExn(~message="Identifier node has no text")
    Var.Raw({name: varname})
  })
}

let parseParamNode = (node: syntaxNode): result<Expr.Param.t, ParseError.t> => {
  validateNode(node)->Result.flatMap(_ => {
    if node.type_ != "param" {
      raise(UnexpectedNodeType({expected: "param", actual: node.type_}))
    }

    if node.namedChildCount == 1 {
      let varNode =
        node.namedChild(0)
        ->Nullable.toOption
        ->Option.getExn(~message="namedChild(0) does not exist")

      parseIdentifierNode(varNode)->Result.map(v => {
        {Expr.Param.var: v, typ: None}
      })
    } else if node.namedChildCount == 2 {
      let varNode =
        node.namedChild(0)
        ->Nullable.toOption
        ->Option.getExn(~message="namedChild(0) does not exist")
      let typeNode =
        node.namedChild(1)
        ->Nullable.toOption
        ->Option.getExn(~message="namedChild(1) does not exist")

      parseIdentifierNode(varNode)->Result.flatMap(v => {
        parseTypeNode(typeNode)->Result.map(
          typ => {
            {Expr.Param.var: v, typ: Some(typ)}
          },
        )
      })
    } else {
      raise(NodeCountMismatch({expected: 1, actual: node.namedChildCount, node}))
    }
  })
}

let parseParamsNode = (node: syntaxNode): result<list<Expr.Param.t>, ParseError.t> => {
  validateNode(node)->Result.flatMap(_ => {
    if node.type_ != "params" {
      raise(UnexpectedNodeType({expected: "params", actual: node.type_}))
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

    aux(0, Belt.List.fromArray([]))
  })
}

@genType
let rec parseExprNode = (node: syntaxNode): result<Expr.t, ParseError.t> => {
  validateNode(node)->Result.flatMap(_ => {
    switch node.type_ {
    | "source_file" =>
      if node.namedChildCount != 1 {
        raise(NodeCountMismatch({expected: 1, actual: node.namedChildCount, node}))
      } else {
        node.namedChild(0)
        ->Nullable.toOption
        ->Option.getExn(~message="namedChild(0) does not exist")
        ->parseExprNode
      }

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
      | _ => raise(UnexpectedText({text: node.text->Nullable.toOption}))
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

      if node.namedChildCount != 2 {
        raise(NodeCountMismatch({expected: 2, actual: node.namedChildCount, node}))
      } else {
        let left =
          node.namedChild(0)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(0) does not exist")
          ->parseExprNode

        let right =
          node.namedChild(1)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(1) does not exist")
          ->parseExprNode

        let op =
          binOpMapping
          ->Dict.get(node.type_)
          ->Option.getExn(~message="Operator not found in mapping")

        left->Result.flatMap(l =>
          right->Result.map(
            r => {
              {
                Expr.metaData: extractMetadata(node),
                raw: Expr.BinOp({op, left: l, right: r}),
              }
            },
          )
        )
      }

    | "and"
    | "or" =>
      let shortCircuitOpMapping = {
        open Operator.ShortCircuitOp
        Dict.fromArray([("and", And), ("or", Or)])
      }

      if node.namedChildCount != 2 {
        raise(NodeCountMismatch({expected: 2, actual: node.namedChildCount, node}))
      } else {
        let left =
          node.namedChild(0)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(0) does not exist")
          ->parseExprNode

        let right =
          node.namedChild(1)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(1) does not exist")
          ->parseExprNode

        let op =
          shortCircuitOpMapping
          ->Dict.get(node.type_)
          ->Option.getExn(~message="Operator not found in mapping")

        left->Result.flatMap(l =>
          right->Result.map(
            r => {
              {
                Expr.metaData: extractMetadata(node),
                raw: Expr.ShortCircuitOp({op, left: l, right: r}),
              }
            },
          )
        )
      }

    | "not" =>
      if node.namedChildCount != 1 {
        raise(NodeCountMismatch({expected: 1, actual: node.namedChildCount, node}))
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
      if node.namedChildCount != 3 {
        raise(NodeCountMismatch({expected: 3, actual: node.namedChildCount, node}))
      } else {
        let cond =
          node.namedChild(0)
          ->Nullable.toOption
          ->Option.getExn(~message="condition does not exist in ctrl_if node")
          ->parseExprNode

        let thenBranch =
          node.namedChild(1)
          ->Nullable.toOption
          ->Option.getExn(~message="then branch does not exist in ctrl_if node")
          ->parseExprNode

        let elseBranch =
          node.namedChild(2)
          ->Nullable.toOption
          ->Option.getExn(~message="else branch does not exist in ctrl_if node")
          ->parseExprNode

        cond->Result.flatMap(c =>
          thenBranch->Result.flatMap(
            t =>
              elseBranch->Result.map(
                e => {
                  {
                    Expr.metaData: extractMetadata(node),
                    raw: Expr.If({cond: c, thenBranch: t, elseBranch: e}),
                  }
                },
              ),
          )
        )
      }
    | "identifier" =>
      parseIdentifierNode(node)->Result.map(v => {
        {
          Expr.metaData: extractMetadata(node),
          raw: Expr.Var(v),
        }
      })

    | "let" =>
      if node.namedChildCount != 3 {
        raise(NodeCountMismatch({expected: 3, actual: node.namedChildCount, node}))
      } else {
        let param =
          node.namedChild(0)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(0) does not exist")
          ->parseParamNode

        let valueExpr =
          node.namedChild(1)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(1) does not exist")
          ->parseExprNode

        let bodyExpr =
          node.namedChild(2)
          ->Nullable.toOption
          ->Option.getExn(~message="namedChild(2) does not exist")
          ->parseExprNode

        param->Result.flatMap(p =>
          valueExpr->Result.flatMap(
            v =>
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
              ),
          )
        )
      }

    | "lambda" =>
      let params =
        node.childForFieldName("params")
        ->Nullable.toOption
        ->Option.getExn(~message="params field does not exist")
        ->parseParamsNode

      let returnType = switch node.childForFieldName("return_type")->Nullable.toOption {
      | Some(n) =>
        Console.log(n)
        n->parseTypeNode->Result.map(t => Some(t))
      | None => ok(None)
      }

      let body =
        node.childForFieldName("body")
        ->Nullable.toOption
        ->Option.getExn(~message="body field does not exist")
        ->parseExprNode

      params->Result.flatMap(p => {
        returnType->Result.flatMap(
          r => {
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
          },
        )
      })

    | "application" =>
      let func =
        node.childForFieldName("func")
        ->Nullable.getExn
        ->parseExprNode

      let arg =
        node.childForFieldName("arg")
        ->Nullable.getExn
        ->parseExprNode

      func->Result.flatMap(f => {
        arg->Result.map(
          a => {
            {
              Expr.metaData: extractMetadata(node),
              raw: Expr.App({func: f, arg: a}),
            }
          },
        )
      })

    | _ => raise(NotImplemented)
    }
  })
}
