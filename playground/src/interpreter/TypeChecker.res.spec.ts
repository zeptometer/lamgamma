import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';
import { typeCheck, TypeEnv_make } from './TypeChecker.gen.ts';
import { t as Expr_t } from './Expr.gen.ts'

let parser;

const parse = (input) => {
    // Assume that parse always succeeds
    return parseSourceFileNode((parser.parse(input)).rootNode)._0 as Expr_t;
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

const emptyEnv = TypeEnv_make();

describe('Typechecker', () => {
    describe('for literals', () => {
        it('infer type of 123', () => {
            expect(typeCheck(parse('123'), emptyEnv)).toEqual({
                TAG: "Ok",
                _0: "Int"
            });
        });

        it('infer type of true', () => {
            expect(typeCheck(parse('true'), emptyEnv)).toEqual({
                TAG: "Ok",
                _0: "Bool"
            });
        });

        it('infer type of false', () => {
            expect(typeCheck(parse('false'), emptyEnv)).toEqual({
                TAG: "Ok",
                _0: "Bool"
            });
        });
    });

    describe('for arithmetic', () => {
        describe('successfully', () => {
            it('infer type of 1 + 2 as Int', () => {
                expect(typeCheck(parse('1 + 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 5 - 2 as Int', () => {
                expect(typeCheck(parse('5 - 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 3 * 4 as Int', () => {
                expect(typeCheck(parse('3 * 4'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 8 / 2 as Int', () => {
                expect(typeCheck(parse('8 / 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 7 mod 3 as Int', () => {
                expect(typeCheck(parse('7 mod 3'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 + true as Error', () => {
                expect(typeCheck(parse('1 + true'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 4 },
                            end: { row: 0, col: 8 },
                        },
                    }
                });
            });
            it('infer type of false - 2 as Error', () => {
                expect(typeCheck(parse('false - 2'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 0 },
                            end: { row: 0, col: 5 },
                        },
                    }
                });
            });
        });

        it('infer a type for complex expression', () => {
            expect(typeCheck(parse('(1 + 2) * (3 - 4) / (5 + 6 mod 2)'), emptyEnv)).toEqual({
                TAG: "Ok",
                _0: "Int"
            });
        });
    });

    describe('for comparison', () => {
        describe('successfully', () => {
            it('infer type of 1 == 2 as Bool', () => {
                expect(typeCheck(parse('1 == 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true == false as Bool', () => {
                expect(typeCheck(parse('true == false'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 3 != 4 as Bool', () => {
                expect(typeCheck(parse('3 != 4'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true != true as Bool', () => {
                expect(typeCheck(parse('true != true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 5 < 6 as Bool', () => {
                expect(typeCheck(parse('5 < 6'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 7 <= 8 as Bool', () => {
                expect(typeCheck(parse('7 <= 8'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 9 > 10 as Bool', () => {
                expect(typeCheck(parse('9 > 10'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 11 >= 12 as Bool', () => {
                expect(typeCheck(parse('11 >= 12'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 == true as Error', () => {
                expect(typeCheck(parse('1 == true'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 5 },
                            end: { row: 0, col: 9 },
                        },
                    }
                });
            });

            it('infer type of false != 2 as Error', () => {
                expect(typeCheck(parse('false != 2'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 9 },
                            end: { row: 0, col: 10 },
                        },
                    }
                });
            });
            it('infer type of 3 < true as Error', () => {
                expect(typeCheck(parse('3 < true'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 4 },
                            end: { row: 0, col: 8 },
                        },
                    }
                });
            });
            it('infer type of false <= 4 as Error', () => {
                expect(typeCheck(parse('false <= 4'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 0 },
                            end: { row: 0, col: 5 },
                        },
                    }
                });
            });
        });
    });

    describe('for logical operations', () => {
        describe('successfully', () => {
            it('infer type of true && false as Bool', () => {
                expect(typeCheck(parse('true && false'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of false || true as Bool', () => {
                expect(typeCheck(parse('false || true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true && false || true as Bool', () => {
                expect(typeCheck(parse('true && false || true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true || false && true as Bool', () => {
                expect(typeCheck(parse('true || false && true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of !true as Bool', () => {
                expect(typeCheck(parse('!true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of true && 1 as Error', () => {
                expect(typeCheck(parse('true && 1'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 8 },
                            end: { row: 0, col: 9 },
                        },
                    }
                });
            });

            it('infer type of false || 2 as Error', () => {
                expect(typeCheck(parse('false || 2'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 9 },
                            end: { row: 0, col: 10 },
                        },
                    }
                });
            });

            it('inter type of !1 as Error', () => {
                expect(typeCheck(parse('!1'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 1 },
                            end: { row: 0, col: 2 },
                        },
                    }
                });
            });
        });
    });

    describe('for if expressions', () => {
        describe('successfully', () => {
            it('infer type of if 1 < 2 then 3 + 4 else 5 * 6 as Int', () => {
                expect(typeCheck(parse('if 1 < 2 then 3 + 4 else 5 * 6'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of if false then false else true as Bool', () => {
                expect(typeCheck(parse('if false then false else true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of if 1 then 2 else 3 as Error', () => {
                expect(typeCheck(parse('if 1 then 2 else 3'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 3 },
                            end: { row: 0, col: 4 },
                        },
                    }
                });
            });
            it('infer type of if true then 1 else false as Error', () => {
                expect(typeCheck(parse('if true then 1 else false'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        actual: "Bool",
                        expected: "Int",
                        metaData: {
                            start: { row: 0, col: 20 },
                            end: { row: 0, col: 25 },
                        },
                    }
                });
            });
        });
    });

    describe('for let expressions', () => {
        describe('successfully', () => {
            it('infer type of let x = 1 in x + 2 as Int', () => {
                expect(typeCheck(parse('let x = 1 in x + 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of let y = true in if y then false else true as Bool', () => {
                expect(typeCheck(parse('let y = true in if y then false else true'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of let x = 1 in let y = 2 in x + y as Int', () => {
                expect(typeCheck(parse('let x = 1 in let y = 2 in x + y'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of let x:int = true in x as Error', () => {
                expect(typeCheck(parse('let x:int = true in x'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Int",
                        actual: "Bool",
                        metaData: {
                            start: { row: 0, col: 12 },
                            end: { row: 0, col: 16 },
                        },
                    }
                });
            });
        });
    });

    describe('for function expressions', () => {
        describe('successfully', () => {
            it('infer type of (x: int) => { x + 1 } as (Int -> Int)', () => {
                expect(typeCheck(parse('(x: int) => { x + 1 }'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Func",
                        _0: "Int",
                        _1: "Int"
                    }
                });
            });

            it('infer type of (x: int):int => { x + 1 } as (Int -> Int)', () => {
                expect(typeCheck(parse('(x: int):int => { x + 1 }'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Func",
                        _0: "Int",
                        _1: "Int"
                    }
                });
            });

            it('infer type of (x: int, y:int) => { x + y } as (Int -> Int)', () => {
                expect(typeCheck(parse('(x: int, y: int) => { x + y }'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Func",
                        _0: "Int",
                        _1: {
                            TAG: "Func",
                            _0: "Int",
                            _1: "Int"
                        }
                    }
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of (x: int):bool => { x + 1 } as Error', () => {
                expect(typeCheck(parse('(x: int):bool => { x + 1 }'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "TypeMismatch",
                        expected: "Bool",
                        actual: "Int",
                        metaData: {
                            start: { row: 0, col: 19 },
                            end: { row: 0, col: 24 },
                        },
                    }
                });
            });

            it('infer type of (x) => { x + 1 } as Error', () => {
                expect(typeCheck(parse('(x) => { x + 1 }'), emptyEnv)).toEqual({
                    TAG: "Error",
                    _0: {
                        TAG: "InsufficientTypeAnnotation",
                        metaData: {
                            start: { row: 0, col: 0 },
                            end: { row: 0, col: 16 },
                        },
                    }
                });
            });

        });
    });

    describe('for function application', () => {
        describe('successfully', () => {
            it('infer type of let y = (x: int) => { x + 1 } in y 2 as Int', () => {
                expect(typeCheck(parse('let y = (x: int) => { x + 1 } in y 2'), emptyEnv)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });
    });
});
