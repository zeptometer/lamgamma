module Env = {
  type t<'a> = Belt.Map.t<Var.t, 'a, Var.Cmp.identity>

  @genType
  let make = (): t<'a> => Belt.Map.make(~id=module(Var.Cmp))
}

module RuntimeVal = {
  @genType
  type rec t =
    | IntVal(int)
    | BoolVal(bool)
    | Closure({
        self: option<Var.t>,
        venv: Env.t<t>,
        nenv: Env.t<Var.t>,
        params: list<Var.t>,
        body: RawExpr.t,
      })
    | Code(RawExpr.t)

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
    | Closure(_) => "#<closure>"
    | Code(expr) => `\`{ ${RawExpr.toString(expr)} }`
    }
}

module FutureVal = {
  @genType
  type rec t = RawExpr.t
}

module ValEnv = {
  @genType
  type t = Env.t<RuntimeVal.t>
}

module NameEnv = {
  @genType
  type t = Env.t<Var.t>
}

type evalError =
  | TypeMismatch
  | ZeroDivision
  | UndefinedVariable
  | UnsupportedForm
  | MalformedSplice

exception MalformedValue({msg: string})

let ok = (x: 'a) => Belt.Result.Ok(x)
let fail = (x: evalError) => Belt.Result.Error(x)

let rec colorParams = (params: list<Var.t>, nenv: NameEnv.t): (list<Var.t>, NameEnv.t) => {
  switch params {
  | list{} => (list{}, nenv)
  | list{head, ...tail} =>
    let head1 = Var.color(head)
    let nenv1 = nenv->Belt.Map.set(head, head1)
    let (params1, nenv2) = colorParams(tail, nenv1)
    (params1->Belt.List.add(head1), nenv2)
  }
}

@genType
let rec evaluateRuntime = (e: RawExpr.t, venv: ValEnv.t, nenv: NameEnv.t): result<
  RuntimeVal.t,
  evalError,
> => {
  open RuntimeVal
  open RawExpr

  switch e {
  | IntLit(i) => ok(IntVal(i))
  | BoolLit(b) => ok(BoolVal(b))
  | BinOp({op, left, right}) =>
    evaluateRuntime(left, venv, nenv)->Result.flatMap(leftVal =>
      evaluateRuntime(right, venv, nenv)->Result.flatMap(rightVal =>
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
    evaluateRuntime(left, venv, nenv)->Result.flatMap(leftVal =>
      switch (op, leftVal) {
      | (Operator.ShortCircuitOp.And, BoolVal(false)) => ok(BoolVal(false)) // short-circuit
      | (Operator.ShortCircuitOp.Or, BoolVal(true)) => ok(BoolVal(true)) // short-circuit
      | (Operator.ShortCircuitOp.And, BoolVal(true))
      | (Operator.ShortCircuitOp.Or, BoolVal(false)) =>
        evaluateRuntime(right, venv, nenv)->Result.flatMap(rightVal =>
          switch rightVal {
          | BoolVal(b) => ok(BoolVal(b))
          | _ => fail(TypeMismatch)
          }
        )
      | _ => fail(TypeMismatch)
      }
    )
  | UniOp({op, expr}) =>
    evaluateRuntime(expr, venv, nenv)->Result.flatMap(exprVal =>
      switch (op, exprVal) {
      | (Operator.UniOp.Not, BoolVal(b)) => ok(BoolVal(!b))
      | _ => fail(TypeMismatch)
      }
    )
  | If({cond, thenBranch, elseBranch}) =>
    evaluateRuntime(cond, venv, nenv)->Result.flatMap(condVal =>
      switch condVal {
      | BoolVal(true) => evaluateRuntime(thenBranch, venv, nenv)
      | BoolVal(false) => evaluateRuntime(elseBranch, venv, nenv)
      | _ => fail(TypeMismatch)
      }
    )

  | Var(v) =>
    let renamed = nenv->Belt.Map.getWithDefault(v, v)

    venv
    ->Belt.Map.get(renamed)
    ->Option.map(ok)
    ->Option.getOr(fail(UndefinedVariable))

  | Let({param, expr, body}) =>
    evaluateRuntime(expr, venv, nenv)->Result.flatMap(exprVal => {
      let param1 = Var.color(param)
      let nenv1 = nenv->Belt.Map.set(param, param1)
      let venv1 = Belt.Map.set(venv, param1, exprVal)
      evaluateRuntime(body, venv1, nenv1)
    })

  | Func({params, body}) => ok(Closure({self: None, venv, nenv, params, body}))

  | App({func, arg}) =>
    evaluateRuntime(func, venv, nenv)->Result.flatMap(funcVal =>
      evaluateRuntime(arg, venv, nenv)->Result.flatMap(argVal =>
        switch funcVal {
        | Closure({self: None, venv: closVenv, nenv: closNenv, params: list{param}, body}) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)
          evaluateRuntime(body, closVenv1, closNenv1)

        | Closure({
            self: None,
            venv: closVenv,
            nenv: closNenv,
            params: list{param, ...rest},
            body,
          }) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)
          ok(Closure({self: None, venv: closVenv1, nenv: closNenv1, params: rest, body}))

        | Closure({self: Some(self), venv: closVenv, nenv: closNenv, params: list{param}, body}) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)->Belt.Map.set(self, funcVal)
          evaluateRuntime(body, closVenv1, closNenv1)

        | Closure({
            self: Some(self),
            venv: closVenv,
            nenv: closNenv,
            params: list{param, ...rest},
            body,
          }) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)->Belt.Map.set(self, funcVal)
          ok(Closure({self: None, venv: closVenv1, nenv: closNenv1, params: rest, body}))

        | Closure(_) =>
          raise(MalformedValue({msg: "Closure with empty params should be impossible"}))

        | _ => fail(TypeMismatch)
        }
      )
    )

  | LetRec({param, expr: Func({params: fparams, body: fbody}), body}) =>
    let param1 = Var.color(param)
    let nenv1 = nenv->Belt.Map.set(param, param1)
    let recFunc = RuntimeVal.Closure({
      self: Some(param1),
      venv,
      nenv: nenv1,
      params: fparams,
      body: fbody,
    })

    let venv1 = Belt.Map.set(venv, param1, recFunc)
    evaluateRuntime(body, venv1, nenv1)

  | LetRec(_) => fail(UnsupportedForm)

  | Quote({expr}) => evaluateFuture(1, expr, venv, nenv)->Belt.Result.map(v => {Code(v)})

  | Splice({shift, expr}) =>
    if shift >= 1 {
      fail(MalformedSplice)
    } else {
      evaluateRuntime(expr, venv, nenv)->Belt.Result.flatMap(v => {
        switch v {
        | Code(expr1) => evaluateRuntime(expr1, venv, nenv)
        | _ => fail(TypeMismatch)
        }
      })
    }
  }
}
/* corresponds to eval(lv, e, venv, nenv) where lv >= 1 */
and evaluateFuture = (lv: int, e: RawExpr.t, venv: ValEnv.t, nenv: NameEnv.t): result<
  FutureVal.t,
  evalError,
> => {
  open RawExpr

  switch e {
  | IntLit(i) => ok(IntLit(i))
  | BoolLit(b) => ok(BoolLit(b))
  | BinOp({op, left, right}) =>
    evaluateFuture(lv, left, venv, nenv)->Belt.Result.flatMap(lval =>
      evaluateFuture(lv, right, venv, nenv)->Belt.Result.map(rval => RawExpr.BinOp({
        op,
        left: lval,
        right: rval,
      }))
    )
  | ShortCircuitOp({op, left, right}) =>
    evaluateFuture(lv, left, venv, nenv)->Belt.Result.flatMap(lval =>
      evaluateFuture(lv, right, venv, nenv)->Belt.Result.map(rval => RawExpr.ShortCircuitOp({
        op,
        left: lval,
        right: rval,
      }))
    )
  | UniOp({op, expr}) =>
    evaluateFuture(lv, expr, venv, nenv)->Result.map(val => RawExpr.UniOp({op, expr: val}))
  | If({cond, thenBranch, elseBranch}) =>
    evaluateFuture(lv, cond, venv, nenv)->Belt.Result.flatMap(condVal =>
      evaluateFuture(lv, thenBranch, venv, nenv)->Belt.Result.flatMap(thenVal =>
        evaluateFuture(lv, elseBranch, venv, nenv)->Belt.Result.map(
          elseVal => RawExpr.If({cond: condVal, thenBranch: thenVal, elseBranch: elseVal}),
        )
      )
    )

  | Var(v) =>
    Belt.Map.get(nenv, v)
    ->Option.map(v => ok(RawExpr.Var(v)))
    ->Option.getOr(fail(UndefinedVariable))

  | Let({param, expr, body}) =>
    evaluateFuture(lv, expr, venv, nenv)->Belt.Result.flatMap(exprVal => {
      let param1 = Var.color(param)
      let nenv1 = nenv->Belt.Map.set(param, param1)
      evaluateFuture(lv, body, venv, nenv1)->Belt.Result.map(bodyVal => {
        RawExpr.Let({param: param1, expr: exprVal, body: bodyVal})
      })
    })

  | Func({params, body}) =>
    let (params1, nenv1) = colorParams(params, nenv)
    evaluateFuture(lv, body, venv, nenv1)->Belt.Result.map(bodyVal => {
      Func({params: params1, body: bodyVal})
    })

  | App({func, arg}) =>
    evaluateFuture(lv, func, venv, nenv)->Result.flatMap(funcVal =>
      evaluateFuture(lv, arg, venv, nenv)->Result.map(argVal => RawExpr.App({
        func: funcVal,
        arg: argVal,
      }))
    )

  | LetRec({param, expr: Func({params: fparams, body: fbody}), body}) =>
    let param1 = Var.color(param)
    let nenv1 = nenv->Belt.Map.set(param, param1)
    let (fparams1, fnenv) = colorParams(fparams, nenv1)

    evaluateFuture(lv, fbody, venv, fnenv)->Belt.Result.flatMap(fbodyVal => {
      evaluateFuture(lv, body, venv, nenv1)->Belt.Result.map(bodyVal => {
        RawExpr.LetRec({
          param: param1,
          expr: RawExpr.Func({params: fparams1, body: fbodyVal}),
          body: bodyVal,
        })
      })
    })

  | LetRec(_) => fail(UnsupportedForm)

  | Quote({expr}) =>
    evaluateFuture(lv + 1, expr, venv, nenv)->Belt.Result.map(exprVal => {
      RawExpr.Quote({expr: exprVal})
    })

  | Splice({shift, expr}) =>
    if shift > lv {
      fail(MalformedSplice)
    } else if shift == lv {
      evaluateRuntime(expr, venv, nenv)->Belt.Result.flatMap(val => {
        switch val {
        | Code(expr1) => ok(expr1)
        | _ => fail(TypeMismatch)
        }
      })
    } else {
      evaluateFuture(lv, expr, venv, nenv)->Belt.Result.map(val => {
        RawExpr.Splice({shift, expr: val})
      })
    }
  }
}
