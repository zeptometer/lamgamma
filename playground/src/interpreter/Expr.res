// module Param = {
//   type t = {var: Var.t, cls: Classifier.t, typ: Typ.t}
// }

module MetaData = {
  module Position = {
    type t = { row: int, col: int }

    let toString = (pos: t): string => {
      `(${pos.row->Int.toString},${pos.col->Int.toString})`
    }
  }

  type t = { start: Position.t, end: Position.t }
}

@genType
type rec t = { metaData: MetaData.t, raw: raw_t }
and raw_t =
  // // basic syntax
  // | Var(Var.t)
  // | Func({ clss: list<Typ.clsdecl>, params: list<Var.t>, body: t })
  // | App({ func: t, args: list<t> })
  // | Let({ param: Param.t, expr: t, body: t})
  // | LetRec({ param: Param.t, expr: t, body: t})
  // // primitive operations
  | IntLit(int)
  | BoolLit(bool)
  | BinOp({op: Operator.BinOp.t, left: t, right: t})
// | If({ cond: t, then_branch: t, else_branch: t })
// // staging constructs
// | Quote(t)
// | Unquote({ shift: int, expr: t })
// | LetCs({ param: Param.t, expr: t, body: t })
// | LetRecCs({ param: Param.t, expr: t, body: t })
// | Serialize(t)

@genType
let rec stripTypeInfo = (expr: t): RawExpr.t => {
  switch expr.raw {
  | IntLit(i) => RawExpr.IntLit(i)
  | BoolLit(b) => RawExpr.BoolLit(b)
  | BinOp({op, left, right}) =>
    RawExpr.BinOp({op, left: stripTypeInfo(left), right: stripTypeInfo(right)})
  }
}
