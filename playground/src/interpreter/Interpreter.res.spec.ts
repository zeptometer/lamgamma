import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';
import { stripTypeInfo } from './Expr.gen.ts';
import { evaluateRuntime, Env_make, Store_make } from './Interpreter.gen.ts';
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
const store = Store_make();

const runit = (expr: string) => {
    const result = evaluateRuntime(parse(expr), venv, nenv, store)

    switch (result.TAG) {
        case "Ok":
            return result._0[0]

        case "Error":
            return result._0
    }
}

describe('Literal evaluation', () => {
    it('evaluates integer literal 123', () => {
        expect(runit('123')).toEqual({ TAG: "IntVal", _0: 123 });
    });

    it('evaluates boolean literal true', () => {
        expect(runit('true')).toEqual({ TAG: "BoolVal", _0: true });
    });

    it('evaluates boolean literal false', () => {
        expect(runit('false')).toEqual({ TAG: "BoolVal", _0: false });
    });
});

describe('Binary operations with', () => {
    describe('Arithmetic', () => {
        describe('successfully', () => {
            it('adds 1 + 2 to equal 3', () => {
                expect(runit('1 + 2')).toEqual(
                    { TAG: "IntVal", _0: 3 }
                );
            });

            it('subtract 5 - 2 = 3', () => {
                expect(runit('5 - 2')).toEqual({ TAG: "IntVal", _0: 3 });
            });

            it('multiply 3 * 4 = 12', () => {
                expect(runit('3 * 4')).toEqual({ TAG: "IntVal", _0: 12 });
            });

            it('divide 8 / 2 = 4', () => {
                expect(runit('8 / 2')).toEqual({ TAG: "IntVal", _0: 4 });
            });
        });

        it('modulo 8 mod 3 = 2', () => {
            expect(runit('8 mod 3')).toEqual({ TAG: "IntVal", _0: 2 });
        });
    });

    describe('fail', () => {
        it('due to non-integer values', () => {
            expect(runit('true + 2')).toEqual("TypeMismatch");
        });

        it('due to zero division', () => {
            expect(runit('1 / 0')).toEqual("ZeroDivision");
        });
    });
});

describe('Equality', () => {
    describe('successfully', () => {
        it('eq 3 == 3 => true', () => {
            expect(runit('3 == 3')).toEqual({ TAG: "BoolVal", _0: true });
        });

        it('eq 3 == 4 => false', () => {
            expect(runit('3 == 4')).toEqual({ TAG: "BoolVal", _0: false });
        });

        it('eq true == true => true', () => {
            expect(runit('true == true')).toEqual({ TAG: "BoolVal", _0: true });
        });

        it('eq true == false => false', () => {
            expect(runit('true == false')).toEqual({ TAG: "BoolVal", _0: false });
        });
    });

    describe('fail', () => {
        it('due to type mismatch', () => {
            expect(runit('1 == true')).toEqual("TypeMismatch");
        });
    });
});

describe('Ordering', () => {
    describe('successfully', () => {
        it('lt 2 < 3 => true', () => {
            expect(runit('2 < 3')).toEqual({ TAG: "BoolVal", _0: true });
        });

        it('lt 3 < 2 => false', () => {
            expect(runit('3 < 2')).toEqual({ TAG: "BoolVal", _0: false });
        });

        it('gt 5 > 2 => true', () => {
            expect(runit('5 > 2')).toEqual({ TAG: "BoolVal", _0: true });
        });

        it('gt 2 > 5 => false', () => {
            expect(runit('2 > 5')).toEqual({ TAG: "BoolVal", _0: false });
        });
    });

    describe('fail', () => {
        it('due to type mismatch', () => {
            expect(runit('1 > true')).toEqual("TypeMismatch");
        });
    });
});

describe('Logical operations with', () => {
    describe('And', () => {
        describe('successfully', () => {
            it('true && true => true', () => {
                expect(runit('true && true')).toEqual({ TAG: "BoolVal", _0: true });
            });

            it('true && false => false', () => {
                expect(runit('true && false')).toEqual({ TAG: "BoolVal", _0: false });
            });

            it('false && true => false', () => {
                expect(runit('false && true')).toEqual({ TAG: "BoolVal", _0: false });
            });

            it('false && false => false', () => {
                expect(runit('false && false')).toEqual({ TAG: "BoolVal", _0: false });
            });

            it('short-circuits evaluation when left is false', () => {
                expect(runit('false && (1 / 0)')).toEqual({ TAG: "BoolVal", _0: false });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(runit('1 && true')).toEqual("TypeMismatch");
            });
        });
    });

    describe('Or', () => {
        describe('successfully', () => {
            it('true || true => true', () => {
                expect(runit('true || true')).toEqual({ TAG: "BoolVal", _0: true });
            });

            it('true || false => true', () => {
                expect(runit('true || false')).toEqual({ TAG: "BoolVal", _0: true });
            });

            it('false || true => true', () => {
                expect(runit('false || true')).toEqual({ TAG: "BoolVal", _0: true });
            });

            it('false || false => false', () => {
                expect(runit('false || false')).toEqual({ TAG: "BoolVal", _0: false });
            });

            it('short-circuits evaluation when left is true', () => {
                expect(runit('true || (1 / 0)')).toEqual({ TAG: "BoolVal", _0: true });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(runit('1 || true')).toEqual("TypeMismatch");
            });
        });
    });

    describe('Logical Negation', () => {
        describe('successfully', () => {
            it('!true => false', () => {
                expect(runit('!true')).toEqual({ TAG: "BoolVal", _0: false });
            });

            it('!false => true', () => {
                expect(runit('!false')).toEqual({ TAG: "BoolVal", _0: true });
            });
        });

        describe('fail', () => {
            it('due to type mismatch', () => {
                expect(runit('!1')).toEqual("TypeMismatch");
            });
        });
    });
});

describe('If expressions', () => {
    describe('successfully', () => {
        it('if true then 1 else 1/0 => 1', () => {
            expect(runit('if true then 1 else 1/0')).toEqual({ TAG: "IntVal", _0: 1 });
        });

        it('if false then 1/0 else 2 => 2', () => {
            expect(runit('if false then 1/0 else 2')).toEqual({ TAG: "IntVal", _0: 2 });
        });
    });

    describe('fail', () => {
        it('due to non-boolean condition', () => {
            expect(runit('if 1 then 2 else 3')).toEqual("TypeMismatch");
        });
    });
});

describe('Variables and Let bindings', () => {
    describe('successfully', () => {
        it('let x = 3 in x + 2 => 5', () => {
            expect(runit('let x = 3 in x + 2')).toEqual({ TAG: "IntVal", _0: 5 });
        });

        it('let x = 3 in let y = 4 in x * y => 12', () => {
            expect(runit('let x = 3 in let y = 4 in x * y')).toEqual({ TAG: "IntVal", _0: 12 });
        });

        it('let x = 3 in let x = 4 in x * 2 => 8 (inner binding shadows outer)', () => {
            expect(runit('let x = 3 in let x = 4 in x * 2')).toEqual({ TAG: "IntVal", _0: 8 });
        });
    });

    describe('fail', () => {
        it('due to undefined variable', () => {
            expect(runit('x + 2')).toEqual("UndefinedVariable");
        });
    });
});

describe('Functions and Applications', () => {
    describe('successfully', () => {
        it('apply function', () => {
            expect(runit('let x = (y) => { 0 } in x 10')).toEqual({ TAG: "IntVal", _0: 0 });
        });

        it('assign value to new env', () => {
            expect(runit('let x = (y) => { y * 2 } in x 10')).toEqual({ TAG: "IntVal", _0: 20 });
        });

        it('curry', () => {
            expect(runit('let x = (y, z) => { y + z } in x 10 5')).toEqual({ TAG: "IntVal", _0: 15 });
        });

    });

    describe('fail', () => {
        it('due to application to integer', () => {
            expect(runit('10 20')).toEqual("TypeMismatch");
        });

        it('due to application to boolean', () => {
            expect(runit('true false')).toEqual("TypeMismatch");
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
            expect(runit(code)).toEqual({ TAG: "IntVal", _0: 15 });
        });
    });

    describe('fail', () => {
        it('for non-functional recursion', () => {
            const code = `
              let rec x = x in
              x
            `
            expect(runit(code)).toEqual("UnsupportedForm");
        });

        it('for unnecessary rec', () => {
            const code = `
              let rec x = 1 in
              x
            `
            expect(runit(code)).toEqual("UnsupportedForm");
        });
    });
});

describe('Recursive Functions', () => {
    describe('successfully', () => {
        it('quote', () => {
            const code = `
              \`{ 1 }
            `
            expect(runit(code)).toMatchInlineSnapshot(`
              {
                "TAG": "Code",
                "_0": {
                  "TAG": "IntLit",
                  "_0": 1,
                },
              }
            `)
        });

        it('quote and splice', () => {
            const code = `
              let x = \`{ 1 } in
              \`{ ~x + ~x }
            `
            expect(runit(code)).toMatchInlineSnapshot(`
              {
                "TAG": "Code",
                "_0": {
                  "TAG": "BinOp",
                  "left": {
                    "TAG": "IntLit",
                    "_0": 1,
                  },
                  "op": "Add",
                  "right": {
                    "TAG": "IntLit",
                    "_0": 1,
                  },
                },
              }
            `)
        });

        it('runtime eval', () => {
            const code = `
              let x = 1 in
              let y = \`{ x } in
              ~0 y
            `
            expect(runit(code)).toEqual({ TAG: "IntVal", _0: 1 })
        });
    });

    describe('fail', () => {
        it('due to splicing non-quote', () => {
            const code = "`{ ~1 }"
            expect(runit(code)).toEqual("TypeMismatch");
        });

        it('due to invalid splice', () => {
            const code = "~`{ 1 }"
            expect(runit(code)).toEqual("MalformedSplice");
        });
    });
});

describe('Mutable State', () => {
    describe('successfully', () => {
        it('reference creation', () => {
            const code = 'ref 10'
            expect(runit(code)).toEqual({ TAG: "Location", _0: 1 });
        });

        it('reference creation and dereference', () => {
            const code = `let x = ref 10 in deref x`
            expect(runit(code)).toEqual({ TAG: "IntVal", _0: 10 });
        });

        it('reference creation, update and dereference', () => {
            const code = `
                let x = ref 10 in
                let _ = x := 15 in
                deref x
            `
            expect(runit(code)).toEqual({ TAG: "IntVal", _0: 15 });
        });
    });

    describe('fails', () => {
        it('dereference non-ref', () => {
            const code = 'deref 10'
            expect(runit(code)).toEqual("TypeMismatch")
        })

        it('update non-ref', () => {
            const code = '10 := 20'
            expect(runit(code)).toEqual("TypeMismatch")
        })

    })
});

describe('big program', () => {
    it('genpow', () => {
        const code = `
          let rec pow1 = (n, xq) => {
            if n == 0 then
              \`{ 1 }
            else if n == 1 then
              xq
            else
              \`{ ~xq * ~(pow1 (n-1) xq) }
          } in
          let pow = (n) => {
            \`{ (x) => { ~(pow1 n \`{ x }) } }
          } in
          let pow4 = ~0(pow 4) in
          pow4 2
        `
        expect(runit(code)).toEqual({ TAG: "IntVal", _0: 16 });
    })
})