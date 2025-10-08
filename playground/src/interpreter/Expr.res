// module Param = {
//   type t = {var: Var.t, cls: Classifier.t, typ: Typ.t}
// }

module MetaData = {
  module Position = {
    type t = {row: int, col: int}

    let toString = (pos: t): string => {
      `(${pos.row->Int.toString},${pos.col->Int.toString})`
    }
  }

  type t = {start: Position.t, end: Position.t}
}

module Param = {
  type t = {var: Var.t, typ: option<Typ.t>}
}

@genType
type rec t = {metaData: MetaData.t, raw: raw_t}
and raw_t =
  // // basic syntax
  | Var(Var.t)
  | Func({params: list<Param.t>, returnType: option<Typ.t>, body: t})
  | App({func: t, arg: t})
  | Let({param: Param.t, expr: t, body: t})
  | LetRec({ param: Param.t, expr: t, body: t})
  // // primitive operations
  | IntLit(int)
  | BoolLit(bool)
  | BinOp({op: Operator.BinOp.t, left: t, right: t})
  | ShortCircuitOp({op: Operator.ShortCircuitOp.t, left: t, right: t})
  | UniOp({op: Operator.UniOp.t, expr: t})
  | If({cond: t, thenBranch: t, elseBranch: t})
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
  | ShortCircuitOp({op, left, right}) =>
    RawExpr.ShortCircuitOp({op, left: stripTypeInfo(left), right: stripTypeInfo(right)})
  | UniOp({op, expr}) => RawExpr.UniOp({op, expr: stripTypeInfo(expr)})
  | If({cond, thenBranch, elseBranch}) =>
    RawExpr.If({
      cond: stripTypeInfo(cond),
      thenBranch: stripTypeInfo(thenBranch),
      elseBranch: stripTypeInfo(elseBranch),
    })
  | Var(v) => RawExpr.Var(v)
  | Let({param, expr, body}) =>
    RawExpr.Let({
      param: param.var,
      expr: stripTypeInfo(expr),
      body: stripTypeInfo(body),
    })
  | LetRec({param, expr, body}) =>
    RawExpr.LetRec({
      param: param.var,
      expr: stripTypeInfo(expr),
      body: stripTypeInfo(body),
    })
  | Func({params, body, returnType: _}) =>
    RawExpr.Func({
      params: params->Belt.List.map(p => p.var),
      body: stripTypeInfo(body),
    })
  | App({func, arg}) =>
    RawExpr.App({
      func: stripTypeInfo(func),
      arg: stripTypeInfo(arg),
    })
  }
}
