/* TypeScript file generated from SyntaxNodeParser.res by genType. */

/* eslint-disable */
/* tslint:disable */

import * as SyntaxNodeParserJS from './SyntaxNodeParser.res.mjs';

import type {t as Expr_t} from './Expr.gen';

export type loc = { readonly row: number; readonly column: number };

export type syntaxNode = {
  readonly text: (undefined | string); 
  readonly isError: boolean; 
  readonly isMissing: boolean; 
  readonly namedChildCount: number; 
  readonly type: string; 
  readonly namedChild: (_1:number) => (undefined | syntaxNode); 
  readonly startPosition: loc; 
  readonly endPosition: loc
};

export type parseError = 
    { TAG: "SyntaxError"; readonly start: loc; readonly end: loc }
  | { TAG: "MissingNodeError"; _0: syntaxNode };

export const parseSyntaxNode: (node:syntaxNode) => 
    { TAG: "Ok"; _0: Expr_t }
  | { TAG: "Error"; _0: parseError } = SyntaxNodeParserJS.parseSyntaxNode as any;
