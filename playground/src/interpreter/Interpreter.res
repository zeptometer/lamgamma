module Env = {
  type t<'a> = Belt.Map.t<Var.t, 'a, Var.Cmp.identity>

  @genType
  let make = (): t<'a> => Belt.Map.make(~id=module(Var.Cmp))
}

module Val = {
  @genType
  type rec t =
    | IntVal(int)
    | BoolVal(bool)
    | Closure(Env.t<t>, list<Var.t>, RawExpr.t)

  @genType
  let toString = (v: t): string =>
    switch v {
    | IntVal(i) => Int.toString(i)
    | BoolVal(b) =>
      if b {
        "true"
      } else {
        "false"
      }
    | Closure(_, _, _) => "#<closure>"
    }
}

type evalError =
  | TypeMismatch
  | ZeroDivision
  | UndefinedVariable

exception MalformedValue({msg: string})

let ok = (x: Val.t) => Belt.Result.Ok(x)
let fail = (x: evalError) => Belt.Result.Error(x)

@genType
let rec evaluate = (e: RawExpr.t, env: Env.t<Val.t>): result<Val.t, evalError> => {
  open Val
  open RawExpr

  switch e {
  | IntLit(i) => ok(IntVal(i))
  | BoolLit(b) => ok(BoolVal(b))
  | BinOp({op, left, right}) =>
    evaluate(left, env)->Result.flatMap(leftVal =>
      evaluate(right, env)->Result.flatMap(rightVal =>
        switch op {
        // Arithmetic
        | Operator.BinOp.Add =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(IntVal(l + r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Sub =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(IntVal(l - r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Mul =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(IntVal(l * r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Div =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => fail(ZeroDivision)
          | (IntVal(l), IntVal(r)) => ok(IntVal(l / r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Mod =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => fail(ZeroDivision)
          | (IntVal(l), IntVal(r)) => ok(IntVal(Int.mod(l, r)))
          | _ => fail(TypeMismatch)
          }
        // Comparison
        | Operator.BinOp.Eq =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l == r))
          | (BoolVal(l), BoolVal(r)) => ok(BoolVal(l == r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Ne =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l != r))
          | (BoolVal(l), BoolVal(r)) => ok(BoolVal(l != r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Lt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l < r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Le =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l <= r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Gt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l > r))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Ge =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok(BoolVal(l >= r))
          | _ => fail(TypeMismatch)
          }
        }
      )
    )
  | ShortCircuitOp({op, left, right}) =>
    evaluate(left, env)->Result.flatMap(leftVal =>
      switch (op, leftVal) {
      | (Operator.ShortCircuitOp.And, BoolVal(false)) => ok(BoolVal(false)) // short-circuit
      | (Operator.ShortCircuitOp.Or, BoolVal(true)) => ok(BoolVal(true)) // short-circuit
      | (Operator.ShortCircuitOp.And, BoolVal(true))
      | (Operator.ShortCircuitOp.Or, BoolVal(false)) =>
        evaluate(right, env)->Result.flatMap(rightVal =>
          switch rightVal {
          | BoolVal(b) => ok(BoolVal(b))
          | _ => fail(TypeMismatch)
          }
        )
      | _ => fail(TypeMismatch)
      }
    )
  | UniOp({op, expr}) =>
    evaluate(expr, env)->Result.flatMap(exprVal =>
      switch (op, exprVal) {
      | (Operator.UniOp.Not, BoolVal(b)) => ok(BoolVal(!b))
      | _ => fail(TypeMismatch)
      }
    )
  | If({cond, thenBranch, elseBranch}) =>
    evaluate(cond, env)->Result.flatMap(condVal =>
      switch condVal {
      | BoolVal(true) => evaluate(thenBranch, env)
      | BoolVal(false) => evaluate(elseBranch, env)
      | _ => fail(TypeMismatch)
      }
    )

  | Var(v) =>
    Belt.Map.get(env, v)
    ->Option.map(ok)
    ->Option.getOr(fail(UndefinedVariable))

  | Let({param, expr, body}) =>
    evaluate(expr, env)->Result.flatMap(exprVal => {
      let newEnv = Belt.Map.set(env, param, exprVal)
      evaluate(body, newEnv)
    })

  | Func({params, body}) => ok(Closure(env, params, body))

  | App({func, arg}) =>
    evaluate(func, env)->Result.flatMap(funcVal =>
      evaluate(arg, env)->Result.flatMap(argVal =>
        switch funcVal {
        | Closure(closureEnv, list{param}, body) =>
          let newEnv = Belt.Map.set(closureEnv, param, argVal)
          evaluate(body, newEnv)
        | Closure(closureEnv, list{param, ...rest}, body) =>
          let newEnv = Belt.Map.set(closureEnv, param, argVal)
          ok(Closure(newEnv, rest, body))
        | Closure(_, _, _) =>
          raise(MalformedValue({msg: "Closure with empty params should be impossible"}))
        | _ => fail(TypeMismatch)
        }
      )
    )
  }
}
