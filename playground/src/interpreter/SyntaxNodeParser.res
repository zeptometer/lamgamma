type loc = {row: int, column: int}

type rec syntaxNode = {
  text: option<string>,
  isError: bool,
  isMissing: bool,
  namedChildCount: int,
  @as("type") type_: string,
  namedChild: int => option<syntaxNode>,
  startPosition: loc,
  endPosition: loc,
}

type parseError =
  | SyntaxError({start: loc, end: loc})
  | MissingNodeError(syntaxNode)

exception NodeCountMismatch({expected: int, actual: int, node: syntaxNode})
exception UnexpectedText({text: option<string>})
exception NotImplemented

let ok = (x: Expr.t) => Belt.Result.Ok(x)
let fail = (x: parseError) => Belt.Result.Error(x)

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
let rec parseSyntaxNode = (node: syntaxNode): result<Expr.t, parseError> => {
  if node.isError {
    fail(SyntaxError({start: node.startPosition, end: node.endPosition}))
  } else if node.isMissing {
    fail(MissingNodeError(node))
  } else {
    switch node.type_ {
    | "source_file" =>
      if node.namedChildCount != 1 {
        raise(NodeCountMismatch({expected: 1, actual: node.namedChildCount, node}))
      } else {
        node.namedChild(0)
        ->Option.getExn(~message="namedChild(0) does not exist")
        ->parseSyntaxNode
      }

    | "number" =>
      let intval =
        node.text
        ->Option.getExn(~message="Number node has no text")
        ->Int.fromString
        ->Option.getExn(~message="Failed to parse int from string")

      ok({
        Expr.metaData: extractMetadata(node),
        raw: Expr.IntLit(intval),
      })

    | "boolean" =>
      let boolval = switch node.text {
      | Some("true") => true
      | Some("false") => false
      | _ => raise(UnexpectedText({text: node.text}))
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
          ->Option.getExn(~message="namedChild(0) does not exist")
          ->parseSyntaxNode

        let right =
          node.namedChild(1)
          ->Option.getExn(~message="namedChild(1) does not exist")
          ->parseSyntaxNode

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
      }
    | _ => raise(NotImplemented)
    }
  }
}
