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

  let toString = (op: t): string => {
    switch op {
    | Add => "+"
    | Sub => "-"
    | Mul => "*"
    | Div => "/"
    | Mod => "%"
    | Eq  => "=="
    | Ne  => "!="
    | Lt  => "<"
    | Le  => "<="
    | Gt  => ">"
    | Ge  => ">="
    }
  }
}

module ShortCircuitOp = {
  type t =
    | And
    | Or

  let toString = (op: t): string => {
    switch op {
    | And => "&&"
    | Or  => "||"
    }
  }
}

module UniOp = {
  type t =
    | Not  // boolean negation

  let toString = (op: t): string => {
    switch op {
    | Not => "!"
    }
  }
}