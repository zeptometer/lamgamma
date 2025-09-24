import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSyntaxNode } from './TreesitterParser.res.mjs';
import { inferType } from './TypeChecker.res.mjs';

let parser;

let parse = (input) => {
    // Assume that parse always succeeds
    return parseSyntaxNode((parser.parse(input)).rootNode)._0;
}

beforeAll(
    async () => {
        await Parser.init();
        const parser1 = new Parser();
        const lamgamma = await Language.load('public/tree-sitter-lamgamma_parser.wasm');
        parser1.setLanguage(lamgamma);
        parser = parser1;
    }
)

describe('Typechecker', () => {
    describe('for literals', () => {
        it('infer type of 123', () => {
            expect(inferType(parse('123'))).toEqual({
                TAG: "Ok",
                _0: "IntType"
            });
        });

        it('infer type of true', () => {
            expect(inferType(parse('true'))).toEqual({
                TAG: "Ok",
                _0: "BoolType"
            });
        });

        it('infer type of false', () => {
            expect(inferType(parse('false'))).toEqual({
                TAG: "Ok",
                _0: "BoolType"
            });
        });
    });

    describe('for arithmetic', () => {
        describe('successfully', () => {
            it('infer type of 1 + 2 as IntType', () => {
                expect(inferType(parse('1 + 2'))).toEqual({
                    TAG: "Ok",
                    _0: "IntType"
                });
            });
            it('infer type of 5 - 2 as IntType', () => {
                expect(inferType(parse('5 - 2'))).toEqual({
                    TAG: "Ok",
                    _0: "IntType"
                });
            });
            it('infer type of 3 * 4 as IntType', () => {
                expect(inferType(parse('3 * 4'))).toEqual({
                    TAG: "Ok",
                    _0: "IntType"
                });
            });
            it('infer type of 8 / 2 as IntType', () => {
                expect(inferType(parse('8 / 2'))).toEqual({
                    TAG: "Ok",
                    _0: "IntType"
                });
            });
            it('infer type of 7 mod 3 as IntType', () => {
                expect(inferType(parse('7 mod 3'))).toEqual({
                    TAG: "Ok",
                    _0: "IntType"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 + true as Error', () => {
                expect(inferType(parse('1 + true'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Right operand is not an integer"
                    }
                });
            });
            it('infer type of false - 2 as Error', () => {
                expect(inferType(parse('false - 2'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Left operand is not an integer"
                    }
                });
            });
        });

        it('infer a type for complex expression', () => {
            expect(inferType(parse('(1 + 2) * (3 - 4) / (5 + 6 mod 2)'))).toEqual({
                TAG: "Ok",
                _0: "IntType"
            });
        });
    });

    describe('for comparison', () => {
        describe('successfully', () => {
            it('infer type of 1 == 2 as BoolType', () => {
                expect(inferType(parse('1 == 2'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of true == false as BoolType', () => {
                expect(inferType(parse('true == false'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of 3 != 4 as BoolType', () => {
                expect(inferType(parse('3 != 4'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of true != true as BoolType', () => {
                expect(inferType(parse('true != true'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of 5 < 6 as BoolType', () => {
                expect(inferType(parse('5 < 6'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of 7 <= 8 as BoolType', () => {
                expect(inferType(parse('7 <= 8'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of 9 > 10 as BoolType', () => {
                expect(inferType(parse('9 > 10'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
            it('infer type of 11 >= 12 as BoolType', () => {
                expect(inferType(parse('11 >= 12'))).toEqual({
                    TAG: "Ok",
                    _0: "BoolType"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 == true as Error', () => {
                expect(inferType(parse('1 == true'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Equality operations require operands of the same type"
                    }
                });
            });
            it('infer type of false != 2 as Error', () => {
                expect(inferType(parse('false != 2'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Equality operations require operands of the same type"
                    }
                });
            });
            it('infer type of 3 < true as Error', () => {
                expect(inferType(parse('3 < true'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Right operand is not an integer"
                    }
                });
            });
            it('infer type of false <= 4 as Error', () => {
                expect(inferType(parse('false <= 4'))).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        _0: "Left operand is not an integer"
                    }
                });
            });
        });
    });
});