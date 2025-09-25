/* TypeScript file generated from Val.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as ValJS from './Val.res.mjs';

export type t = 
    { TAG: "IntLit"; _0: number }
  | { TAG: "BoolLit"; _0: boolean };

export const toString: (expr:t) => string = ValJS.toString as any;
