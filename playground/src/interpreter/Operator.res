@genType
module BinOp = {
  type t =
    // Arithmetic
    | Add
    | Sub
    | Mul
    | Div
    | Mod
    // Comparison
    | Eq
    | Ne
    | Lt
    | Le
    | Gt
    | Ge
}

module ShortCircuitOp = {
  type t =
    | And
    | Or
}

module UniOp = {
  type t =
    | Not  // boolean negation
}