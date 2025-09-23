module Runtime = {
  type val =
    | IntVal(int)
    | BoolVal(bool)
}

type evalError =
  | TypeMismatch
  | ZeroDivision

let return = (x: Runtime.val) => Belt.Result.Ok(x)
let raise = (x: evalError) => Belt.Result.Error(x)

let rec eval = (e: Expr.t): Belt.Result.t<Runtime.val, evalError> => {
  open Runtime
  open Expr
  open Belt.Result

  switch e {
  | IntLit(i) => return(IntVal(i))
  | BoolLit(b) => return(BoolVal(b))
  | BinOp({op, left, right}) =>
    eval(left)->flatMap(leftVal =>
      eval(right)->flatMap(rightVal =>
        switch op {
        | Operator.BinOp.Add =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(IntVal(l + r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Sub =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(IntVal(l - r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Mul =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(IntVal(l * r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Div =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => raise(ZeroDivision)
          | (IntVal(l), IntVal(r)) => return(IntVal(l / r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Eq =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l == r))
          | (BoolVal(l), BoolVal(r)) => return(BoolVal(l == r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Lt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l < r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Gt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l > r))
          | _ => raise(TypeMismatch)
          }
        }
      )
    )
  }
}
