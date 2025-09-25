// module Param = {
//   type t = {var: Var.t, cls: Classifier.t, typ: Typ.t}
// }

type rec t =
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

let rec stripTypeInfo = (expr: t): RawExpr.t => {
  switch expr {
  | IntLit(i) => RawExpr.IntLit(i)
  | BoolLit(b) => RawExpr.BoolLit(b)
  | BinOp({op, left, right}) =>
    RawExpr.BinOp({op, left: stripTypeInfo(left), right: stripTypeInfo(right)})
  }
}
