type rec t =
    | IntType
    | BoolType
    // | CodeType(Classifier.t, t)
    // | FuncType(list<Classifier.Decl.t>, list<t>, t)

let toString = (typ: t): string => {
  switch typ {
  | IntType => "Int"
  | BoolType => "Bool"
  }
}