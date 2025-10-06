module TypeError = {
  type t =
    | TypeMismatch({metaData: Expr.MetaData.t, expected: Typ.t, actual: Typ.t})
    | UndefinedVariable({metaData: Expr.MetaData.t, var: Var.t})
    | InsufficientTypeAnnotation({metaData: Expr.MetaData.t})
}

let ok = (x: 'a) => Belt.Result.Ok(x)
let fail = (x: TypeError.t) => Belt.Result.Error(x)

module TypeEnv = {
  type t = Belt.Map.t<Var.t, Typ.t, Var.Cmp.identity>

  @genType
  let make = (): t => Belt.Map.make(~id=module(Var.Cmp))
}

@genType
let rec typeCheck = (expr: Expr.t, env: Belt.Map.t<Var.t, Typ.t, Var.Cmp.identity>): result<
  Typ.t,
  TypeError.t,
> => {
  open Expr

  switch expr.raw {
  | IntLit(_) => ok(Typ.Int)
  | BoolLit(_) => ok(Typ.Bool)
  | BinOp({op, left, right}) =>
    typeCheck(left, env)->Result.flatMap(leftType => {
      typeCheck(right, env)->Result.flatMap(rightType => {
        open Operator.BinOp
        switch op {
        // Arithmetic operations require both operands to be integers and return an integer.
        | Add | Sub | Mul | Div | Mod =>
          if leftType != Typ.Int {
            fail(TypeMismatch({metaData: left.metaData, expected: Typ.Int, actual: leftType}))
          } else if rightType != Typ.Int {
            fail(TypeMismatch({metaData: right.metaData, expected: Typ.Int, actual: rightType}))
          } else {
            ok(Typ.Int)
          }

        // Comparison operations return a boolean. For equality and inequality, both operands must be of the same type.
        | Eq | Ne =>
          if leftType == rightType {
            ok(Typ.Bool)
          } else {
            fail(TypeMismatch({metaData: right.metaData, expected: leftType, actual: rightType}))
          }

        // Relational comparisons require both operands to be integers and return a boolean.
        | Lt | Le | Gt | Ge =>
          if leftType != Int {
            fail(TypeMismatch({metaData: left.metaData, expected: Int, actual: leftType}))
          } else if rightType != Int {
            fail(TypeMismatch({metaData: right.metaData, expected: Int, actual: rightType}))
          } else {
            ok(Typ.Bool)
          }
        }
      })
    })
  | ShortCircuitOp({op, left, right}) =>
    typeCheck(left, env)->Result.flatMap(leftType => {
      typeCheck(right, env)->Result.flatMap(rightType => {
        open Operator.ShortCircuitOp
        switch op {
        | And | Or =>
          if leftType != Bool {
            fail(TypeMismatch({metaData: left.metaData, expected: Bool, actual: leftType}))
          } else if rightType != Bool {
            fail(TypeMismatch({metaData: right.metaData, expected: Bool, actual: rightType}))
          } else {
            ok(Typ.Bool)
          }
        }
      })
    })
  | UniOp({op, expr}) =>
    typeCheck(expr, env)->Result.flatMap(exprType => {
      open Operator.UniOp
      switch op {
      | Not =>
        if exprType != Bool {
          fail(TypeMismatch({metaData: expr.metaData, expected: Bool, actual: exprType}))
        } else {
          ok(Typ.Bool)
        }
      }
    })
  | If({cond, thenBranch, elseBranch}) =>
    typeCheck(cond, env)->Result.flatMap(condType => {
      if condType != Bool {
        fail(TypeMismatch({metaData: cond.metaData, expected: Bool, actual: condType}))
      } else {
        typeCheck(thenBranch, env)->Result.flatMap(thenType => {
          typeCheck(elseBranch, env)->Result.flatMap(
            elseType => {
              if thenType != elseType {
                fail(
                  TypeMismatch({
                    metaData: elseBranch.metaData,
                    expected: thenType,
                    actual: elseType,
                  }),
                )
              } else {
                ok(thenType)
              }
            },
          )
        })
      }
    })
  | Var(v) =>
    switch Belt.Map.get(env, v) {
    | Some(typ) => ok(typ)
    | None => fail(UndefinedVariable({metaData: expr.metaData, var: v}))
    }

  | Let({param, expr, body}) =>
    typeCheck(expr, env)->Result.flatMap(exprType => {
      switch param.typ {
      | Some(t) =>
        if t != exprType {
          fail(TypeMismatch({metaData: expr.metaData, expected: t, actual: exprType}))
        } else {
          ok()
        }
      | None => ok()
      }->Result.flatMap(_ => {
        let newEnv = Belt.Map.set(env, param.var, exprType)
        typeCheck(body, newEnv)
      })
    })

  | Func({params, returnType, body}) =>
    let rec extendEnv = (params: list<Param.t>, env: TypeEnv.t): result<TypeEnv.t, TypeError.t> =>
      switch params {
      | list{} => ok(env)
      | list{param, ...rest} =>
        switch param.typ {
        | Some(typ) => ok(typ)
        | None => fail(InsufficientTypeAnnotation({metaData: expr.metaData}))
        }->Result.flatMap(paramType => {
          extendEnv(rest, Belt.Map.set(env, param.var, paramType))
        })
      }

    let rec expandFuncType = (params: list<Param.t>, returnType: Typ.t): result<
      Typ.t,
      TypeError.t,
    > =>
      switch params {
      | list{} => ok(returnType)
      | list{head, ...tail} =>
        switch head.typ {
        | Some(t) => expandFuncType(tail, Typ.Func(t, returnType))
        | None => fail(InsufficientTypeAnnotation({metaData: expr.metaData}))
        }
      }

    extendEnv(params, env)->Result.flatMap(newEnv => {
      typeCheck(body, newEnv)->Result.flatMap(bodyType => {
        switch returnType {
        | Some(typ) =>
          if typ != bodyType {
            fail(TypeMismatch({metaData: body.metaData, expected: typ, actual: bodyType}))
          } else {
            ok()
          }
        | None => ok()
        }->Result.flatMap(_ => expandFuncType(Belt.List.reverse(params), bodyType))
      })
    })

  | App({func, arg}) =>
    typeCheck(func, env)->Belt.Result.flatMap(funcType => {
      typeCheck(arg, env)->Belt.Result.flatMap(argType => {
        switch funcType {
        | Func(paramType, returnType) =>
          if paramType != argType {
            fail(TypeMismatch({metaData: arg.metaData, expected: paramType, actual: argType}))
          } else {
            ok(returnType)
          }
        | _ =>
          fail(
            TypeMismatch({metaData: func.metaData, expected: Func(argType, Int), actual: funcType}),
          )
        }
      })
    })
  }
}
