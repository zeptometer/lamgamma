import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';
import { stripTypeInfo } from './Expr.gen.ts';
import { evaluateRuntime, Env_make } from './Interpreter.gen.ts';
import { t as Expr_t } from './Expr.gen.ts'

let parser;

const parse = (input) => {
    // Assume that parse always succeeds
    return stripTypeInfo(parseSourceFileNode((parser.parse(input)).rootNode)._0 as Expr_t);
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

const venv = Env_make();
const nenv = Env_make();

describe('Literal evaluation', () => {
    it('evaluates integer literal 123', () => {
        expect(evaluateRuntime(parse('123'), venv, nenv)).toEqual({
            TAG: "Ok",
            _0: { TAG: "IntVal", _0: 123 }
        });
    });

    it('evaluates boolean literal true', () => {
        expect(evaluateRuntime(parse('true'), venv, nenv)).toEqual({
            TAG: "Ok",
            _0: { TAG: "BoolVal", _0: true }
        });
    });

    it('evaluates boolean literal false', () => {
        expect(evaluateRuntime(parse('false'), venv, nenv)).toEqual({
            TAG: "Ok",
            _0: { TAG: "BoolVal", _0: false }
        });
    });
});

describe('Binary operations with', () => {
    describe('Arithmetic', () => {
        describe('successfully', () => {
            it('adds 1 + 2 to equal 3', () => {
                expect(evaluateRuntime(parse('1 + 2'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 3 }
                });
            });

            it('subtract 5 - 2 = 3', () => {
                expect(evaluateRuntime(parse('5 - 2'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 3 }
                });
            });

            it('multiply 3 * 4 = 12', () => {
                expect(evaluateRuntime(parse('3 * 4'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 12 }
                });
            });

            it('divide 8 / 2 = 4', () => {
                expect(evaluateRuntime(parse('8 / 2'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 4 }
                });
            });

            it('modulo 8 mod 3 = 2', () => {
                expect(evaluateRuntime(parse('8 mod 3'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "IntVal", _0: 2 }
                });
            });
        });

        describe('fail', () => {
            it('due to non-integer values', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Add",
                    left: { TAG: "BoolLit", _0: true },
                    right: { TAG: "IntLit", _0: 2 }
                }, venv, nenv)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });

            it('due to zero division', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Div",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 0 }
                }, venv, nenv)).toEqual({
                    TAG: "Error",
                    _0: "ZeroDivision"
                });
            });
        });
    });

    describe('Equality', () => {
        describe('successfully', () => {
            it('eq 3 == 3 => true', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 3 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('eq 3 == 4 => false', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 4 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('eq true == true => true', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "BoolLit", _0: true },
                    right: { TAG: "BoolLit", _0: true }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, venv, nenv)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Ordering', () => {
        describe('successfully', () => {
            it('lt 2 < 3 => true', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Lt",
                    left: { TAG: "IntLit", _0: 2 },
                    right: { TAG: "IntLit", _0: 3 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('lt 3 < 2 => false', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Lt",
                    left: { TAG: "IntLit", _0: 3 },
                    right: { TAG: "IntLit", _0: 2 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('gt 5 > 2 => true', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 5 },
                    right: { TAG: "IntLit", _0: 2 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('gt 2 > 5 => false', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 2 },
                    right: { TAG: "IntLit", _0: 5 }
                }, venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluateRuntime({
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, venv, nenv)).toEqual({
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
                expect(evaluateRuntime(parse('true && true'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('true && false => false', () => {
                expect(evaluateRuntime(parse('true && false'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('false && true => false', () => {
                expect(evaluateRuntime(parse('false && true'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('false && false => false', () => {
                expect(evaluateRuntime(parse('false && false'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('short-circuits evaluation when left is false', () => {
                expect(evaluateRuntime(parse('false && (1 / 0)'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluateRuntime({
                    TAG: "ShortCircuitOp",
                    op: "And",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, venv, nenv)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Or', () => {
        describe('successfully', () => {
            it('true || true => true', () => {
                expect(evaluateRuntime(parse('true || true'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('true || false => true', () => {
                expect(evaluateRuntime(parse('true || false'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('false || true => true', () => {
                expect(evaluateRuntime(parse('false || true'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });

            it('false || false => false', () => {
                expect(evaluateRuntime(parse('false || false'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('short-circuits evaluation when left is true', () => {
                expect(evaluateRuntime(parse('true || (1 / 0)'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluateRuntime({
                    TAG: "ShortCircuitOp",
                    op: "Or",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "BoolLit", _0: true }
                }, venv, nenv)).toEqual({
                    TAG: "Error",
                    _0: "TypeMismatch"
                });
            });
        });
    });

    describe('Logical Negation', () => {
        describe('successfully', () => {
            it('!true => false', () => {
                expect(evaluateRuntime(parse('!true'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: false }
                });
            });

            it('!false => true', () => {
                expect(evaluateRuntime(parse('!false'), venv, nenv)).toEqual({
                    TAG: "Ok",
                    _0: { TAG: "BoolVal", _0: true }
                });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(evaluateRuntime(parse('!1'), venv, nenv)).toEqual({
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
            expect(evaluateRuntime(parse('if true then 1 else 1/0'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 1 }
            });
        });

        it('if false then 1/0 else 2 => 2', () => {
            expect(evaluateRuntime(parse('if false then 1/0 else 2'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 2 }
            });
        });
    });

    describe('fail', () => {
        it('due to non-boolean condition', () => {
            expect(evaluateRuntime(parse('if 1 then 2 else 3'), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "TypeMismatch"
            });
        });
    });
});

describe('Variables and Let bindings', () => {
    describe('successfully', () => {
        it('let x = 3 in x + 2 => 5', () => {
            expect(evaluateRuntime(parse('let x = 3 in x + 2'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 5 }
            });
        });

        it('let x = 3 in let y = 4 in x * y => 12', () => {
            expect(evaluateRuntime(parse('let x = 3 in let y = 4 in x * y'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 12 }
            });
        });

        it('let x = 3 in let x = 4 in x * 2 => 8 (inner binding shadows outer)', () => {
            expect(evaluateRuntime(parse('let x = 3 in let x = 4 in x * 2'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 8 }
            });
        });
    });

    describe('fail', () => {
        it('due to undefined variable', () => {
            expect(evaluateRuntime(parse('x + 2'), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "UndefinedVariable"
            });
        });
    });
});

describe('Functions and Applications', () => {
    describe('successfully', () => {
        it('apply function', () => {
            expect(evaluateRuntime(parse('let x = (y) => { 0 } in x 10'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 0 }
            });
        });

        it('assign value to new env', () => {
            expect(evaluateRuntime(parse('let x = (y) => { y * 2 } in x 10'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 20 }
            });
        });

        it('curry', () => {
            expect(evaluateRuntime(parse('let x = (y, z) => { y + z } in x 10 5'), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 15 }
            });
        });

    });

    describe('fail', () => {
        it('due to application to integer', () => {
            expect(evaluateRuntime(parse('10 20'), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "TypeMismatch"
            });
        });

        it('due to application to boolean', () => {
            expect(evaluateRuntime(parse('true false'), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "TypeMismatch"
            });
        });
    });
});

describe('Recursive Functions', () => {
    describe('successfully', () => {
        it('run sum', () => {
            const code = `
              let rec sum = (n) => {
                if n == 0 then 0 else n + sum(n - 1)
              } in
              sum 5
            `
            expect(evaluateRuntime(parse(code), venv, nenv)).toEqual({
                TAG: "Ok",
                _0: { TAG: "IntVal", _0: 15 }
            });
        });
    });

    describe('fail', () => {
        it('for non-functional recursion', () => {
            const code = `
              let rec x = x in
              x
            `
            expect(evaluateRuntime(parse(code), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "UnsupportedForm"
            });
        });

        it('for unnecessary rec', () => {
            const code = `
              let rec x = 1 in
              x
            `
            expect(evaluateRuntime(parse(code), venv, nenv)).toEqual({
                TAG: "Error",
                _0: "UnsupportedForm"
            });
        });
    });
});