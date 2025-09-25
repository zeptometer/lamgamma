module Runtime = {
  @genType
  type val =
    | IntVal(int)
    | BoolVal(bool)

  @genType
  let toString = (v: val): string =>
    switch v {
    | IntVal(i) => Int.toString(i)
    | BoolVal(b) => if b { "true" } else { "false" }
    }
}

type evalError =
  | TypeMismatch
  | ZeroDivision

let return = (x: Runtime.val) => Belt.Result.Ok(x)
let raise = (x: evalError) => Belt.Result.Error(x)

@genType
let rec evaluate = (e: RawExpr.t): result<Runtime.val, evalError> => {
  open Runtime
  open RawExpr

  switch e {
  | IntLit(i) => return(IntVal(i))
  | BoolLit(b) => return(BoolVal(b))
  | BinOp({op, left, right}) =>
    evaluate(left)->Result.flatMap(leftVal =>
      evaluate(right)->Result.flatMap(rightVal =>
        switch op {
        // Arithmetic
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
        | Operator.BinOp.Mod =>
          switch (leftVal, rightVal) {
          | (IntVal(_), IntVal(0)) => raise(ZeroDivision)
          | (IntVal(l), IntVal(r)) => return(IntVal(Int.mod(l, r)))
          | _ => raise(TypeMismatch)
          }
        // Comparison
        | Operator.BinOp.Eq =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l == r))
          | (BoolVal(l), BoolVal(r)) => return(BoolVal(l == r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Ne =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l != r))
          | (BoolVal(l), BoolVal(r)) => return(BoolVal(l != r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Lt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l < r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Le =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l <= r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Gt =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l > r))
          | _ => raise(TypeMismatch)
          }
        | Operator.BinOp.Ge =>
          switch (leftVal, rightVal) {
          | (IntVal(l), IntVal(r)) => return(BoolVal(l >= r))
          | _ => raise(TypeMismatch)
          }
        }
      )
    )
  }
}
