@genType
type rec t =
    | Int
    | Bool
    // | CodeType(Classifier.t, t)
    // | FuncType(list<Classifier.Decl.t>, list<t>, t)

let toString = (typ: t): string => {
  switch typ {
  | Int => "Int"
  | Bool => "Bool"
  }
}