type rec t =
    | IntType
    | BoolType
    | CodeType(Classifier.t, t)
    | FuncType(list<Classifier.Decl.t>, list<t>, t)
