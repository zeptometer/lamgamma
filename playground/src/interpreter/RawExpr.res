@genType
type rec t =
    // basic syntax
    // | Var(Var.t)
    // | Func({ params: list<Var.t>, body: t })
    // | App({ func: t, args: list<t> })
    // | Let({ var: Var.t, expr: t, body: t})
    // | LetRec({ var: Var.t, expr: t, body: t})
    // // primitive operations
    | IntLit(int)
    | BoolLit(bool)
    | BinOp({ op: Operator.BinOp.t, left: t, right: t })
    | If({ cond: t, thenBranch: t, elseBranch: t })
    // staging constructs
    // | Quote(t)
    // | Unquote({ shift: int, expr: t })
    // | LetCs({ var: Var.t, expr: t, body: t})
    // | LetRecCs({ var: Var.t, expr: t, body: t})
    // | Serialize(t)