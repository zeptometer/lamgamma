type typeError = TypeMismatch(string)

let ok = (x: Typ.t) => Belt.Result.Ok(x)
let fail = (x: typeError) => Belt.Result.Error(x)

let rec inferType = (expr: Expr.t): result<Typ.t, typeError> => {
  open Expr
  open Typ

  switch expr {
  | IntLit(_) => ok(IntType)
  | BoolLit(_) => ok(BoolType)
  | BinOp({op, left, right}) =>
    inferType(left)->Result.flatMap(leftType => {
      inferType(right)->Result.flatMap(rightType => {
        open Operator.BinOp
        switch op {
        // Arithmetic operations require both operands to be integers and return an integer.
        | Add | Sub | Mul | Div | Mod =>
          if leftType != IntType {
            fail(TypeMismatch("Left operand is not an integer"))
          } else if rightType != IntType {
            fail(TypeMismatch("Right operand is not an integer"))
          } else {
            ok(IntType)
          }

        // Comparison operations return a boolean. For equality and inequality, both operands must be of the same type.
        | Eq | Ne =>
          if leftType == rightType {
            ok(BoolType)
          } else {
            fail(TypeMismatch("Equality operations require operands of the same type"))
          }

        // Relational comparisons require both operands to be integers and return a boolean.
        | Lt | Le | Gt | Ge =>
          if leftType != IntType {
            fail(TypeMismatch("Left operand is not an integer"))
          } else if rightType != IntType {
            fail(TypeMismatch("Right operand is not an integer"))
          } else {
            ok(BoolType)
          }
        }
      })
    })
  }
}
