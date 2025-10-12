@genType
type rec t =
  | Int
  | Bool
  // | CodeType(Classifier.t, t)
  | Func(t, t)
  | Code({cls: Classifier.t, typ: t})
  | ClsAbs({cls: Classifier.t, base: Classifier.t, body: t})

let rec toString = (typ: t): string => {
  switch typ {
  | Int => "Int"
  | Bool => "Bool"
  | Func(paramType, returnType) => "(" ++ toString(paramType) ++ "->" ++ toString(returnType) ++ ")"
  | Code({cls, typ}) => `<${typ->toString}@${cls->Classifier.toString}>`
  | ClsAbs({cls, base, body}) =>
    `[${cls->Classifier.toString}:>${base->Classifier.toString}](${body->toString})`
  }
}

let rec freeClassifiers = (typ: t): Belt.Set.t<Classifier.t, Classifier.Cmp.identity> => {
  switch typ {
  | Int => Belt.Set.make(~id=module(Classifier.Cmp))
  | Bool => Belt.Set.make(~id=module(Classifier.Cmp))
  | Func(paramType, returnType) =>
    freeClassifiers(paramType)->Belt.Set.union(freeClassifiers(returnType))
  | Code({cls, typ}) => freeClassifiers(typ)->Belt.Set.add(cls)
  | ClsAbs({cls, base, body}) =>
    freeClassifiers(body)
    ->Belt.Set.remove(cls)
    ->Belt.Set.add(base)
  }
}

let eq = (a: t, b: t): bool => {
  let rec aux = (
    a: t,
    b: t,
    ~bm1: Belt.Map.t<Classifier.t, Classifier.t, Classifier.Cmp.identity>,
    ~bm2: Belt.Map.t<Classifier.t, Classifier.t, Classifier.Cmp.identity>,
  ): bool => {
    switch (a, b) {
    | (Int, Int) => true
    | (Bool, Bool) => true
    | (Func(aParam, aReturn), Func(bParam, bReturn)) =>
      aux(aParam, bParam, ~bm1, ~bm2) && aux(aReturn, bReturn, ~bm1, ~bm2)
    | (Code({cls: aCls, typ: aTyp}), Code({cls: bCls, typ: bTyp})) =>
      let aCls1 = bm1->Belt.Map.getWithDefault(aCls, aCls)
      let bCls1 = bm2->Belt.Map.getWithDefault(bCls, bCls)

      aCls1->Classifier.eq(bCls1) && aux(aTyp, bTyp, ~bm1, ~bm2)
    | (
        ClsAbs({cls: aCls, base: aBase, body: aBody}),
        ClsAbs({cls: bCls, base: bBase, body: bBody}),
      ) =>
      {
        let aBase1 = bm1->Belt.Map.getWithDefault(aBase, aBase)
        let bBase1 = bm2->Belt.Map.getWithDefault(bBase, bBase)

        aBase1->Classifier.eq(bBase1)
      } && {
        let g = Classifier.Source.fresh()
        let bm11 = Belt.Map.set(bm1, aCls, g)
        let bm21 = Belt.Map.set(bm2, bCls, g)
        aux(aBody, bBody, ~bm1=bm11, ~bm2=bm21)
      }

    | _ => false
    }
  }

  aux(
    a,
    b,
    ~bm1=Belt.Map.make(~id=module(Classifier.Cmp)),
    ~bm2=Belt.Map.make(~id=module(Classifier.Cmp)),
  )
}
