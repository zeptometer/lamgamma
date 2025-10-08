@genType
type rec t =
  // basic syntax
  | Var(Var.t)
  | Func({ params: list<Var.t>, body: t })
  | App({ func: t, arg: t })
  | Let({ param: Var.t, expr: t, body: t})
  | LetRec({ param: Var.t, expr: t, body: t})
  // // primitive operations
  | IntLit(int)
  | BoolLit(bool)
  | BinOp({op: Operator.BinOp.t, left: t, right: t})
  | ShortCircuitOp({op: Operator.ShortCircuitOp.t, left: t, right: t})
  | UniOp({op: Operator.UniOp.t, expr: t})
  | If({cond: t, thenBranch: t, elseBranch: t})
// staging constructs
// | Quote(t)
// | Unquote({ shift: int, expr: t })
// | LetCs({ var: Var.t, expr: t, body: t})
// | LetRecCs({ var: Var.t, expr: t, body: t})
// | Serialize(t)
