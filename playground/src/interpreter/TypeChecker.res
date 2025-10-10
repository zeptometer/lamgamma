module TypeError = {
  type t =
    | TypeMismatch({metaData: Expr.MetaData.t, expected: Typ.t, actual: Typ.t})
    | ClassifierMismatch({metaData: Expr.MetaData.t, current: Classifier.t, spliced: Classifier.t})
    | ClassifierEscape({metaData: Expr.MetaData.t})
    | UndefinedVariable({metaData: Expr.MetaData.t, var: Var.t})
    | UndefinedClassifier({metaData: Expr.MetaData.t, cls: Classifier.t})
    | MalformedSplice({metaData: Expr.MetaData.t, shift: int})
    | InsufficientTypeAnnotation({metaData: Expr.MetaData.t})
    | UnsupportedFormat({metaData: Expr.MetaData.t, message: string})
}

exception MalformedGlobalEnv

let ok = (x: 'a) => Belt.Result.Ok(x)
let fail = (x: TypeError.t) => Belt.Result.Error(x)

module LocalEnv = {
  type t = Belt.Map.t<Var.t, Typ.t, Var.Cmp.identity>

  let make = (): t => Belt.Map.make(~id=module(Var.Cmp))
}

module ClassifierMap = {
  type entry = {
    // The local environment that corresponds to the given classifier
    lenv: LocalEnv.t,
    // A list of classifiers that is below the given classifier (including itself)
    subcls: list<Classifier.t>,
  }
  type t = Belt.Map.t<Classifier.t, entry, Classifier.Cmp.identity>

  @genType
  let make = (): t =>
    Belt.Map.make(~id=module(Classifier.Cmp))->Belt.Map.set(
      Classifier.Initial,
      {lenv: LocalEnv.make(), subcls: list{Classifier.Initial}},
    )
}

module GlobalEnv = {
  type t = {stack: list<Classifier.t>, clsmap: ClassifierMap.t}

  @genType
  let make = (): t => {stack: list{Classifier.Initial}, clsmap: ClassifierMap.make()}

  let currentLocalEnv = (env: t): LocalEnv.t => {
    let {stack, clsmap} = env
    let current = stack->Belt.List.headExn

    let {lenv} = clsmap->Belt.Map.getExn(current)
    lenv
  }

  /**
   return None when cls is not defined in env
   */
  let pushStage = (env: t, cls: Classifier.t): option<t> => {
    let {stack, clsmap} = env
    clsmap
    ->Belt.Map.get(cls)
    ->Belt.Option.map(_ => {stack: list{cls, ...stack}, clsmap})
  }

  let popStage = (env: t, shift: int): option<t> => {
    let {stack, clsmap} = env
    switch stack->Belt.List.drop(shift) {
    | None
    | Some(list{}) =>
      None
    | Some(stack1) => Some({stack: stack1, clsmap})
    }
  }

  let currentSubCls = (env: t): list<Classifier.t> => {
    let current = env.stack->Belt.List.headExn
    let {subcls} = env.clsmap->Belt.Map.getExn(current)
    subcls
  }

  let extend = (env: t, param: Var.t, typ: Typ.t, cls: Classifier.t): t => {
    switch env.stack {
    | list{current, ...rest} => {
        let {lenv, subcls} = env.clsmap->Belt.Map.getExn(current)
        let lenv1 = lenv->Belt.Map.set(param, typ)
        let subcls1 = list{cls, ...subcls}
        let stack1 = list{cls, ...rest}
        let clsmap1 = env.clsmap->Belt.Map.set(cls, {lenv: lenv1, subcls: subcls1})
        {stack: stack1, clsmap: clsmap1}
      }
    | list{} => raise(MalformedGlobalEnv)
    }
  }
}

let doesEscapeScope = (param: Expr.Param.t, exprType: Typ.t): bool => {
  let occuringCls = exprType->Typ.freeClassifiers

  occuringCls->Belt.List.has(param.cls, (a, b) => a == b)
}

let extractFuncType = (
  params: list<Expr.Param.t>,
  returnType: Typ.t,
  metaData: Expr.MetaData.t,
): result<Typ.t, TypeError.t> => {
  let rec aux = (params: list<Expr.Param.t>, returnType: Typ.t, metaData: Expr.MetaData.t): result<
    Typ.t,
    TypeError.t,
  > => {
    switch params {
    | list{} => ok(returnType)
    | list{head, ...tail} =>
      switch head.typ {
      | Some(t) =>
        if doesEscapeScope(head, returnType) {
          fail(ClassifierEscape({metaData: metaData}))
        } else {
          aux(tail, Typ.Func(t, returnType), metaData)
        }
      | None => fail(InsufficientTypeAnnotation({metaData: metaData}))
      }
    }
  }
  aux(Belt.List.reverse(params), returnType, metaData)
}

@genType
let rec typeCheck = (expr: Expr.t, env: GlobalEnv.t): result<Typ.t, TypeError.t> => {
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
    let lenv = env->GlobalEnv.currentLocalEnv
    switch Belt.Map.get(lenv, v) {
    | Some(typ) => ok(typ)
    | None => fail(UndefinedVariable({metaData: expr.metaData, var: v}))
    }

  | Let({param, expr, body}) =>
    typeCheck(expr, env)
    ->Result.flatMap(exprType => {
      switch param.typ {
      | Some(t) =>
        if t != exprType {
          fail(TypeMismatch({metaData: expr.metaData, expected: t, actual: exprType}))
        } else {
          ok(exprType)
        }
      | None => ok(exprType)
      }
    })
    ->Result.flatMap(exprType => {
      let env1 = env->GlobalEnv.extend(param.var, exprType, param.cls)
      typeCheck(body, env1)
    })
    ->Result.flatMap(bodyType => {
      if doesEscapeScope(param, bodyType) {
        fail(ClassifierEscape({metaData: body.metaData}))
      } else {
        ok(bodyType)
      }
    })

  | LetRec({param, expr, body}) =>
    switch expr.raw {
    | Func({params: args, returnType: returnTypeO, body: _}) =>
      let funcTypeR = switch returnTypeO {
      | Some(r) => extractFuncType(args, r, expr.metaData)
      | None => fail(InsufficientTypeAnnotation({metaData: expr.metaData}))
      }

      param.typ
      ->Belt.Option.map(ok)
      ->Belt.Option.getWithDefault(funcTypeR)
      ->Belt.Result.flatMap(funcType => {
        if doesEscapeScope(param, funcType) {
          fail(ClassifierEscape({metaData: expr.metaData}))
        } else {
          ok(funcType)
        }
      })
      ->Belt.Result.flatMap(funcType => {
        let env1 = env->GlobalEnv.extend(param.var, funcType, param.cls)

        typeCheck(expr, env1)
        ->Belt.Result.flatMap(exprType => {
          if exprType != funcType {
            fail(TypeMismatch({metaData: expr.metaData, expected: funcType, actual: exprType}))
          } else {
            typeCheck(body, env1)
          }
        })
        ->Belt.Result.flatMap(typ => {
          if doesEscapeScope(param, typ) {
            fail(ClassifierEscape({metaData: body.metaData}))
          } else {
            ok(typ)
          }
        })
      })

    | _ =>
      fail(
        UnsupportedFormat({
          metaData: expr.metaData,
          message: "Let rec can only be used with function values",
        }),
      )
    }

  | Func({params, returnType, body}) =>
    let rec extendEnv = (params: list<Param.t>, env: GlobalEnv.t): result<
      GlobalEnv.t,
      TypeError.t,
    > =>
      switch params {
      | list{} => ok(env)
      | list{param, ...rest} =>
        switch param.typ {
        | Some(typ) => ok(typ)
        | None => fail(InsufficientTypeAnnotation({metaData: expr.metaData}))
        }->Result.flatMap(paramType => {
          let env1 = env->GlobalEnv.extend(param.var, paramType, param.cls)

          extendEnv(rest, env1)
        })
      }

    extendEnv(params, env)->Result.flatMap(env1 => {
      typeCheck(body, env1)->Result.flatMap(bodyType => {
        switch returnType {
        | Some(typ) =>
          if typ != bodyType {
            fail(TypeMismatch({metaData: body.metaData, expected: typ, actual: bodyType}))
          } else {
            ok()
          }
        | None => ok()
        }->Belt.Result.flatMap(_ => extractFuncType(params, bodyType, expr.metaData))
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
  | Quote({cls, expr: quoted}) =>
    switch cls {
    | Some(cls) =>
      switch env->GlobalEnv.pushStage(cls) {
      | Some(env1) => ok(env1)
      | None => fail(UndefinedClassifier({metaData: expr.metaData, cls}))
      }
      ->Belt.Result.flatMap(env1 => {
        typeCheck(quoted, env1)
      })
      ->Belt.Result.map(typ => {
        Typ.Code({cls, typ})
      })

    | None => fail(InsufficientTypeAnnotation({metaData: expr.metaData}))
    }

  | Splice({shift, expr: spliced}) =>
    switch env->GlobalEnv.popStage(shift) {
    | None => fail(MalformedSplice({metaData: expr.metaData, shift}))
    | Some(env1) =>
      typeCheck(spliced, env1)->Result.flatMap(typSpliced => {
        switch typSpliced {
        | Code({cls, typ: typExpr}) =>
          let isClsConsistent =
            env
            ->GlobalEnv.currentSubCls
            ->Belt.List.has(cls, (x, y) => {x == y})

          if isClsConsistent {
            ok(typExpr)
          } else {
            let current = env.stack->Belt.List.headExn
            fail(ClassifierMismatch({metaData: expr.metaData, current, spliced: cls}))
          }
        | _ =>
          fail(
            TypeMismatch({
              metaData: expr.metaData,
              expected: Typ.Code({cls: Classifier.Initial, typ: Typ.Int}),
              actual: typSpliced,
            }),
          )
        }
      })
    }
  }
}
