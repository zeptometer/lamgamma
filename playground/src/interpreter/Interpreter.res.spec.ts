import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseExprNode } from './SyntaxNodeParser.gen.ts';
import { stripTypeInfo } from './Expr.gen.ts';
import { evaluate, ValEnv_make } from './Interpreter.gen.ts';
import { t as Expr_t } from './Expr.gen.ts'

let parser;

const parse = (input) => {
    // Assume that parse always succeeds
    return stripTypeInfo(parseExprNode((parser.parse(input)).rootNode)._0 as Expr_t);
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

const env = ValEnv_make();

describe('Literal evaluation', () => {
    it('evaluates integer literal 123', () => {
        expect(evaluate(parse('123'), env)).toEqual({
            TAG: "Ok",
            _0: { TAG: "IntVal", _0: 123 }
        });
    });

    it('evaluates boolean literal true', () => {
        expect(evaluate(parse('true'), env)).toEqual({
            TAG: "Ok",
            _0: { TAG: "BoolVal", _0: true }
        });
    });

    it('evaluates boolean literal false', () => {
        expect(evaluate(parse('false'), env)).toEqual({
            TAG: "Ok",
            _0: { TAG: "BoolVal", _0: false }
        });
    });
});

describe('Binary operations with', () => {
    describe('Arithmetic', () => {
        describe('successfully', () => {
            it('adds 1 + 2 to equal 3', () => {
                expect(evaluate(parse('1 + 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 3 }
                });
            });

            it('subtract 5 - 2 = 3', () => {
                expect(evaluate(parse('5 - 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 3 }
                });
            });

            it('multiply 3 * 4 = 12', () => {
                expect(evaluate(parse('3 * 4'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 12 }
                });
            });

            it('divide 8 / 2 = 4', () => {
                expect(evaluate(parse('8 / 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 4 }
                });
            });

            it('modulo 8 mod 3 = 2', () => {
                expect(evaluate(parse('8 mod 3'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 2 }
                });
            });
        });

        describe('fail', () => {
            it('due to non-integer values', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Add",
                    left: { TAG: "BoolLit", _0: true },
                    right: { TAG: "IntLit", _0: 2 }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });

            it('due to zero division', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Div",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 0 }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "ZeroDivision"
                });
            });
        });
    });

    describe('Equality', () => {
        describe('successfully', () => {
            it('eq 3 == 3 => true', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 3 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('eq 3 == 4 => false', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 4 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('eq true == true => true', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "BoolLit", _0: true },
                    right: { TAG: "BoolLit", _0: true }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Ordering', () => {
        describe('successfully', () => {
            it('lt 2 < 3 => true', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Lt",
                    left: { TAG: "IntLit", _0: 2 },
                    right: { TAG: "IntLit", _0: 3 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('lt 3 < 2 => false', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Lt",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 2 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('gt 5 > 2 => true', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 5 },
                    right: { TAG: "IntLit", _0: 2 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('gt 2 > 5 => false', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 2 },
                    right: { TAG: "IntLit", _0: 5 }
                }, env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluate({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });
});

describe('Logical operations with', () => {
    describe('And', () => {
        describe('successfully', () => {
            it('true && true => true', () => {
                expect(evaluate(parse('true && true'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('true && false => false', () => {
                expect(evaluate(parse('true && false'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('false && true => false', () => {
                expect(evaluate(parse('false && true'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('false && false => false', () => {
                expect(evaluate(parse('false && false'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('short-circuits evaluation when left is false', () => {
                expect(evaluate(parse('false && (1 / 0)'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluate({
                    TAG: "ShortCircuitOp",
                    op: "And",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Or', () => {
        describe('successfully', () => {
            it('true || true => true', () => {
                expect(evaluate(parse('true || true'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('true || false => true', () => {
                expect(evaluate(parse('true || false'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('false || true => true', () => {
                expect(evaluate(parse('false || true'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('false || false => false', () => {
                expect(evaluate(parse('false || false'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('short-circuits evaluation when left is true', () => {
                expect(evaluate(parse('true || (1 / 0)'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluate({
                    TAG: "ShortCircuitOp",
                    op: "Or",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Logical Negation', () => {
        describe('successfully', () => {
            it('!true => false', () => {
                expect(evaluate(parse('!true'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('!false => true', () => {
                expect(evaluate(parse('!false'), env)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluate(parse('!1'), env)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });
});

describe('If expressions', () => {
    describe('successfully', () => {
        it('if true then 1 else 1/0 => 1', () => {
            expect(evaluate(parse('if true then 1 else 1/0'), env)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 1 }
            });
        });

        it('if false then 1/0 else 2 => 2', () => {
            expect(evaluate(parse('if false then 1/0 else 2'), env)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 2 }
            });
        });
    });

    describe('fail', () => {
        it('due to non-boolean condition', () => {
            expect(evaluate(parse('if 1 then 2 else 3'), env)).toEqual({
                TAG: "Error",
                _0: "TypeMismatch"
            });
        });
    });
});

describe('Variables and Let bindings', () => {
    describe('successfully', () => {
        it('let x = 3 in x + 2 => 5', () => {
            expect(evaluate(parse('let x = 3 in x + 2'), env)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 5 }
            });
        });

        it('let x = 3 in let y = 4 in x * y => 12', () => {
            expect(evaluate(parse('let x = 3 in let y = 4 in x * y'), env)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 12 }
            });
        });

        it('let x = 3 in let x = 4 in x * 2 => 8 (inner binding shadows outer)', () => {
            expect(evaluate(parse('let x = 3 in let x = 4 in x * 2'), env)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 8 }
            });
        });
    });

    describe('fail', () => {
        it('due to undefined variable', () => {
            expect(evaluate(parse('x + 2'), env)).toEqual({
                TAG: "Error",
                _0: "UndefinedVariable"
            });
        });
    });
});