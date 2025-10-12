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

let rec freeClassifiers = (typ: t): list<Classifier.t> => {
  switch typ {
  | Int => list{}
  | Bool => list{}
  | Func(paramType, returnType) =>
    freeClassifiers(paramType)->Belt.List.concat(freeClassifiers(returnType))
  | Code({cls, typ}) => freeClassifiers(typ)->Belt.List.add(cls)
  | ClsAbs({cls, base, body}) => freeClassifiers(body)->Belt.List.keep(c => c != cls && c != base)
  }
}
