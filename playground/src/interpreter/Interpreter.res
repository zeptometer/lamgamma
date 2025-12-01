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
    | Location(Location.t)

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
    | Location(loc) => Location.toString(loc)
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

module Store = {
  type t = Belt.Map.t<Location.t, RuntimeVal.t, Location.Cmp.identity>

  @genType
  let make = (): t => Belt.Map.make(~id=module(Location.Cmp))
}

type evalError =
  | TypeMismatch
  | ZeroDivision
  | UndefinedVariable
  | UnsupportedForm
  | MalformedSplice
  | UndefinedLocation

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
let rec evaluateRuntime = (e: RawExpr.t, venv: ValEnv.t, nenv: NameEnv.t, store: Store.t): result<
  (RuntimeVal.t, Store.t),
  evalError,
> => {
  open RuntimeVal
  open RawExpr

  switch e {
  | IntLit(i) => ok((IntVal(i), store))
  | BoolLit(b) => ok((BoolVal(b), store))
  | BinOp({op, left, right}) =>
    evaluateRuntime(left, venv, nenv, store)->Result.flatMap(((leftVal, store1)) =>
      evaluateRuntime(right, venv, nenv, store1)->Result.flatMap(((rightVal, store2)) =>
        switch op {
        // Arithmetic
        | Operator.BinOp.Add =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((IntVal(l + r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Sub =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((IntVal(l - r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Mul =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((IntVal(l * r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Div =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => fail(ZeroDivision)
          | (IntVal(l), IntVal(r)) => ok((IntVal(l / r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Mod =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => fail(ZeroDivision)
          | (IntVal(l), IntVal(r)) => ok((IntVal(Int.mod(l, r)), store2))
          | _ => fail(TypeMismatch)
          }
        // Comparison
        | Operator.BinOp.Eq =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l == r), store2))
          | (BoolVal(l), BoolVal(r)) => ok((BoolVal(l == r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Ne =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l != r), store2))
          | (BoolVal(l), BoolVal(r)) => ok((BoolVal(l != r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Lt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l < r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Le =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l <= r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Gt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l > r), store2))
          | _ => fail(TypeMismatch)
          }
        | Operator.BinOp.Ge =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => ok((BoolVal(l >= r), store2))
          | _ => fail(TypeMismatch)
          }
        }
      )
    )
  | ShortCircuitOp({op, left, right}) =>
    evaluateRuntime(left, venv, nenv, store)->Result.flatMap(((leftVal, store1)) =>
      switch (op, leftVal) {
      | (Operator.ShortCircuitOp.And, BoolVal(false)) => ok((BoolVal(false), store1)) // short-circuit
      | (Operator.ShortCircuitOp.Or, BoolVal(true)) => ok((BoolVal(true), store1)) // short-circuit
      | (Operator.ShortCircuitOp.And, BoolVal(true))
      | (Operator.ShortCircuitOp.Or, BoolVal(false)) =>
        evaluateRuntime(right, venv, nenv, store1)->Result.flatMap(((rightVal, store2)) =>
          switch rightVal {
          | BoolVal(b) => ok((BoolVal(b), store2))
          | _ => fail(TypeMismatch)
          }
        )
      | _ => fail(TypeMismatch)
      }
    )
  | UniOp({op, expr}) =>
    evaluateRuntime(expr, venv, nenv, store)->Result.flatMap(((exprVal, store1)) =>
      switch (op, exprVal) {
      | (Operator.UniOp.Not, BoolVal(b)) => ok((BoolVal(!b), store1))
      | _ => fail(TypeMismatch)
      }
    )
  | If({cond, thenBranch, elseBranch}) =>
    evaluateRuntime(cond, venv, nenv, store)->Result.flatMap(((condVal, store1)) =>
      switch condVal {
      | BoolVal(true) => evaluateRuntime(thenBranch, venv, nenv, store1)
      | BoolVal(false) => evaluateRuntime(elseBranch, venv, nenv, store1)
      | _ => fail(TypeMismatch)
      }
    )

  | Var(v) =>
    let renamed = nenv->Belt.Map.getWithDefault(v, v)

    venv
    ->Belt.Map.get(renamed)
    ->Option.map(x => ok((x, store)))
    ->Option.getOr(fail(UndefinedVariable))

  | Let({param, expr, body}) =>
    evaluateRuntime(expr, venv, nenv, store)->Result.flatMap(((exprVal, store1)) => {
      let param1 = Var.color(param)
      let nenv1 = nenv->Belt.Map.set(param, param1)
      let venv1 = Belt.Map.set(venv, param1, exprVal)
      evaluateRuntime(body, venv1, nenv1, store1)
    })

  | Func({params, body}) => ok((Closure({self: None, venv, nenv, params, body}), store))

  | App({func, arg}) =>
    evaluateRuntime(func, venv, nenv, store)->Result.flatMap(((funcVal, store1)) =>
      evaluateRuntime(arg, venv, nenv, store1)->Result.flatMap(((argVal, store2)) =>
        switch funcVal {
        | Closure({self: None, venv: closVenv, nenv: closNenv, params: list{param}, body}) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)
          evaluateRuntime(body, closVenv1, closNenv1, store2)

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
          ok((Closure({self: None, venv: closVenv1, nenv: closNenv1, params: rest, body}), store2))

        | Closure({self: Some(self), venv: closVenv, nenv: closNenv, params: list{param}, body}) =>
          let param1 = Var.color(param)
          let closNenv1 = closNenv->Belt.Map.set(param, param1)
          let closVenv1 = closVenv->Belt.Map.set(param1, argVal)->Belt.Map.set(self, funcVal)
          evaluateRuntime(body, closVenv1, closNenv1, store2)

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
          let newClos = Closure({self: None, venv: closVenv1, nenv: closNenv1, params: rest, body})
          ok((newClos, store))

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
    evaluateRuntime(body, venv1, nenv1, store)

  | LetRec(_) => fail(UnsupportedForm)

  | Quote({expr}) =>
    evaluateFuture(1, expr, venv, nenv, store)->Belt.Result.flatMap(((v, store1)) =>
      ok((Code(v), store1))
    )

  | Splice({shift, expr}) =>
    if shift >= 1 {
      fail(MalformedSplice)
    } else {
      evaluateRuntime(expr, venv, nenv, store)->Belt.Result.flatMap(((v, store1)) => {
        switch v {
        | Code(expr1) => evaluateRuntime(expr1, venv, nenv, store1)
        | _ => fail(TypeMismatch)
        }
      })
    }

  | Ref({init}) =>
    evaluateRuntime(init, venv, nenv, store)->Belt.Result.flatMap(((v, store1)) => {
      let loc = Location.alloc()
      let store1 = store1->Belt.Map.set(loc, v)
      ok((Location(loc), store1))
    })

  | Assign({ref, value}) =>
    evaluateRuntime(ref, venv, nenv, store)->Belt.Result.flatMap(((refv, store1)) => {
      evaluateRuntime(value, venv, nenv, store1)->Belt.Result.flatMap(((valv, store2)) => {
        switch refv {
        | Location(loc) =>
          let store3 = store2->Belt.Map.set(loc, valv)
          ok((valv, store3))
        | _ => fail(TypeMismatch)
        }
      })
    })

  | Deref({ref}) =>
    evaluateRuntime(ref, venv, nenv, store)->Belt.Result.flatMap(((refv, store1)) => {
      switch refv {
      | Location(loc) =>
        switch store1->Belt.Map.get(loc) {
        | Some(v) => ok((v, store1))
        | None => fail(UndefinedLocation)
        }
      | _ => fail(TypeMismatch)
      }
    })
  }
}
/* corresponds to eval(lv, e, venv, nenv) where lv >= 1 */
and evaluateFuture = (
  lv: int,
  e: RawExpr.t,
  venv: ValEnv.t,
  nenv: NameEnv.t,
  store: Store.t,
): result<(FutureVal.t, Store.t), evalError> => {
  open RawExpr

  switch e {
  | IntLit(i) => ok((IntLit(i), store))
  | BoolLit(b) => ok((BoolLit(b), store))
  | BinOp({op, left, right}) =>
    evaluateFuture(lv, left, venv, nenv, store)->Belt.Result.flatMap(((lval, store1)) =>
      evaluateFuture(lv, right, venv, nenv, store1)->Belt.Result.map(((rval, store2)) => {
        let v = RawExpr.BinOp({
          op,
          left: lval,
          right: rval,
        })
        (v, store2)
      })
    )
  | ShortCircuitOp({op, left, right}) =>
    evaluateFuture(lv, left, venv, nenv, store)->Belt.Result.flatMap(((lval, store1)) =>
      evaluateFuture(lv, right, venv, nenv, store1)->Belt.Result.map(((rval, store2)) => {
        let v = RawExpr.ShortCircuitOp({
          op,
          left: lval,
          right: rval,
        })
        (v, store2)
      })
    )
  | UniOp({op, expr}) =>
    evaluateFuture(lv, expr, venv, nenv, store)->Result.map(((val, store1)) => {
      let v = RawExpr.UniOp({
        op,
        expr: val,
      })
      (v, store1)
    })

  | If({cond, thenBranch, elseBranch}) =>
    evaluateFuture(lv, cond, venv, nenv, store)->Belt.Result.flatMap(((condVal, store1)) =>
      evaluateFuture(lv, thenBranch, venv, nenv, store1)->Belt.Result.flatMap(((thenVal, store2)) =>
        evaluateFuture(lv, elseBranch, venv, nenv, store2)->Belt.Result.map(
          ((elseVal, store3)) => {
            let v = RawExpr.If({cond: condVal, thenBranch: thenVal, elseBranch: elseVal})
            (v, store3)
          },
        )
      )
    )

  | Var(v) =>
    switch Belt.Map.get(nenv, v) {
    | Some(renamed) => ok((RawExpr.Var(renamed), store))
    | None => fail(UndefinedVariable)
    }

  | Let({param, expr, body}) =>
    evaluateFuture(lv, expr, venv, nenv, store)->Belt.Result.flatMap(((exprVal, store1)) => {
      let param1 = Var.color(param)
      let nenv1 = nenv->Belt.Map.set(param, param1)
      evaluateFuture(lv, body, venv, nenv1, store1)->Belt.Result.map(((bodyVal, store2)) => {
        let v = RawExpr.Let({param: param1, expr: exprVal, body: bodyVal})
        (v, store2)
      })
    })

  | Func({params, body}) =>
    let (params1, nenv1) = colorParams(params, nenv)
    evaluateFuture(lv, body, venv, nenv1, store)->Belt.Result.map(((bodyVal, store1)) => {
      let v = RawExpr.Func({params: params1, body: bodyVal})
      (v, store1)
    })

  | App({func, arg}) =>
    evaluateFuture(lv, func, venv, nenv, store)->Result.flatMap(((funcVal, store1)) =>
      evaluateFuture(lv, arg, venv, nenv, store1)->Result.map(((argVal, store2)) => {
        let v = RawExpr.App({
          func: funcVal,
          arg: argVal,
        })
        (v, store2)
      })
    )

  | LetRec({param, expr: Func({params: fparams, body: fbody}), body}) =>
    let param1 = Var.color(param)
    let nenv1 = nenv->Belt.Map.set(param, param1)
    let (fparams1, fnenv) = colorParams(fparams, nenv1)

    evaluateFuture(lv, fbody, venv, fnenv, store)->Belt.Result.flatMap(((fbodyVal, store1)) => {
      evaluateFuture(lv, body, venv, nenv1, store1)->Belt.Result.map(((bodyVal, store2)) => {
        let v = RawExpr.LetRec({
          param: param1,
          expr: RawExpr.Func({params: fparams1, body: fbodyVal}),
          body: bodyVal,
        })
        (v, store2)
      })
    })

  | LetRec(_) => fail(UnsupportedForm)

  | Quote({expr}) =>
    evaluateFuture(lv + 1, expr, venv, nenv, store)->Belt.Result.map(((exprVal, store1)) => {
      let v = RawExpr.Quote({expr: exprVal})
      (v, store1)
    })

  | Splice({shift, expr}) =>
    if shift > lv {
      fail(MalformedSplice)
    } else if shift == lv {
      evaluateRuntime(expr, venv, nenv, store)->Belt.Result.flatMap(((val, store1)) => {
        switch val {
        | Code(expr1) => ok((expr1, store1))
        | _ => fail(TypeMismatch)
        }
      })
    } else {
      evaluateFuture(lv, expr, venv, nenv, store)->Belt.Result.map(((val, store1)) => {
        let v = RawExpr.Splice({shift, expr: val})
        (v, store1)
      })
    }

  | Ref({init}) =>
    evaluateFuture(lv, init, venv, nenv, store)->Belt.Result.map(((initVal, store1)) => {
      let v = RawExpr.Ref({init: initVal})
      (v, store1)
    })

  | Assign({ref, value}) =>
    evaluateFuture(lv, ref, venv, nenv, store)->Belt.Result.flatMap(((refVal, store1)) =>
      evaluateFuture(lv, value, venv, nenv, store1)->Belt.Result.map(((valueVal, store2)) => {
        let v = RawExpr.Assign({
          ref: refVal,
          value: valueVal,
        })
        (v, store2)
      })
    )

  | Deref({ref}) =>
    evaluateFuture(lv, ref, venv, nenv, store)->Belt.Result.map(((refVal, store1)) => {
      let v = RawExpr.Deref({ref: refVal})
      (v, store1)
    })
  }
}
