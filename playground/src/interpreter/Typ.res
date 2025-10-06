@genType
type rec t =
    | Int
    | Bool
    // | CodeType(Classifier.t, t)
    | Func(t, t)

let rec toString = (typ: t): string => {
  switch typ {
  | Int => "Int"
  | Bool => "Bool"
  | Func(paramType, returnType) =>
    "(" ++ toString(paramType) ++ "->" ++ toString(returnType) ++ ")"
  }
}