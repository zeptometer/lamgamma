/* TypeScript file generated from Expr.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {BinOp_t as Operator_BinOp_t} from './Operator.gen';

export type t = 
    { TAG: "IntLit"; _0: number }
  | { TAG: "BoolLit"; _0: boolean }
  | { TAG: "BinOp"; readonly op: Operator_BinOp_t; readonly left: t; readonly right: t };
