/* TypeScript file generated from Interpreter.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as InterpreterJS from './Interpreter.res.mjs';

import type {t as RawExpr_t} from './RawExpr.gen';

export type Runtime_val = 
    { TAG: "IntVal"; _0: number }
  | { TAG: "BoolVal"; _0: boolean };

export type evalError = "TypeMismatch" | "ZeroDivision";

export const Runtime_toString: (v:Runtime_val) => string = InterpreterJS.Runtime.toString as any;

export const evaluate: (e:RawExpr_t) => 
    { TAG: "Ok"; _0: Runtime_val }
  | { TAG: "Error"; _0: evalError } = InterpreterJS.evaluate as any;

export const Runtime: { toString: (v:Runtime_val) => string } = InterpreterJS.Runtime as any;
