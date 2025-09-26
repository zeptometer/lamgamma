module TypeError = {
  type t = TypeMismatch({metaData: Expr.MetaData.t, expected: Typ.t, actual: Typ.t})
}

let ok = (x: Typ.t) => Belt.Result.Ok(x)
let fail = (x: TypeError.t) => Belt.Result.Error(x)

@genType
let rec typeCheck = (expr: Expr.t): result<Typ.t, TypeError.t> => {
  open Expr
  open Typ

  switch expr.raw {
  | IntLit(_) => ok(IntType)
  | BoolLit(_) => ok(BoolType)
  | BinOp({op, left, right}) =>
    typeCheck(left)->Result.flatMap(leftType => {
      typeCheck(right)->Result.flatMap(rightType => {
        open Operator.BinOp
        switch op {
        // Arithmetic operations require both operands to be integers and return an integer.
        | Add | Sub | Mul | Div | Mod =>
          if leftType != IntType {
            fail(TypeMismatch({metaData: left.metaData, expected: IntType, actual: leftType}))
          } else if rightType != IntType {
            fail(TypeMismatch({metaData: right.metaData, expected: IntType, actual: rightType}))
          } else {
            ok(IntType)
          }

        // Comparison operations return a boolean. For equality and inequality, both operands must be of the same type.
        | Eq | Ne =>
          if leftType == rightType {
            ok(BoolType)
          } else {
            fail(TypeMismatch({metaData: right.metaData, expected: leftType, actual: rightType}))
          }

        // Relational comparisons require both operands to be integers and return a boolean.
        | Lt | Le | Gt | Ge =>
          if leftType != IntType {
            fail(TypeMismatch({metaData: left.metaData, expected: IntType, actual: leftType}))
          } else if rightType != IntType {
            fail(TypeMismatch({metaData: right.metaData, expected: IntType, actual: rightType}))
          } else {
            ok(BoolType)
          }
        }
      })
    })
  }
}
