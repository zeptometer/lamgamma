@genType
type rec t =
  // basic syntax
  | Var(Var.t)
  | Func({params: list<Var.t>, body: t})
  | App({func: t, arg: t})
  | Let({param: Var.t, expr: t, body: t})
  | LetRec({param: Var.t, expr: t, body: t})
  // // primitive operations
  | IntLit(int)
  | BoolLit(bool)
  | BinOp({op: Operator.BinOp.t, left: t, right: t})
  | ShortCircuitOp({op: Operator.ShortCircuitOp.t, left: t, right: t})
  | UniOp({op: Operator.UniOp.t, expr: t})
  | If({cond: t, thenBranch: t, elseBranch: t})
  // staging constructs
  | Quote({expr: t})
  | Splice({shift: int, expr: t})
// | LetCs({ var: Var.t, expr: t, body: t})
// | LetRecCs({ var: Var.t, expr: t, body: t})
// | Serialize(t)

let rec toString = (expr: t): string => {
  switch expr {
  | Var(v) => Var.toString(v)
  | Func({params, body}) =>
    let paramsStr = {
      switch params->Belt.List.map(Var.toString) {
      | list{} => ""
      | list{head, ...tail} => tail->Belt.List.reduce(head, (acc, x) => acc ++ ", " ++ x)
      }
    }
    let bodyStr = toString(body)
    `(${paramsStr}) => { ${bodyStr} }`
  | App({func, arg}) => `( ${toString(func)} ${toString(arg)} )`
  | Let({param, expr, body}) =>
    `(let ${Var.toString(param)} = ${toString(expr)} in ${toString(body)})`
  | LetRec({param, expr, body}) =>
    `(let rec ${Var.toString(param)} = ${toString(expr)} in ${toString(body)})`
  | IntLit(i) => i->Int.toString
  | BoolLit(b) =>
    if b {
      "true"
    } else {
      "false"
    }
  | BinOp({op, left, right}) =>
    `(${toString(left)} ${Operator.BinOp.toString(op)} ${toString(right)})`
  | ShortCircuitOp({op, left, right}) =>
    `(${toString(left)} ${Operator.ShortCircuitOp.toString(op)} ${toString(right)})`
  | UniOp({op, expr}) => `(${Operator.UniOp.toString(op)} ${toString(expr)})`
  | If({cond, thenBranch, elseBranch}) =>
    `(if ${toString(cond)} then ${toString(thenBranch)} else ${toString(elseBranch)})`
  | Quote({expr}) => `\`{ ${toString(expr)} }`
  | Splice({shift, expr}) => `~${shift->Int.toString}{ ${toString(expr)} }`
  }
}
