import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';
import { typeCheck, GlobalEnv_make } from './TypeChecker.gen.ts';
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

const env = GlobalEnv_make();

describe('Typechecker', () => {
    describe('for literals', () => {
        it('infer type of 123', () => {
            expect(typeCheck(parse('123'), env)).toEqual({
                TAG: "Ok",
                _0: "Int"
            });
        });

        it('infer type of true', () => {
            expect(typeCheck(parse('true'), env)).toEqual({
                TAG: "Ok",
                _0: "Bool"
            });
        });

        it('infer type of false', () => {
            expect(typeCheck(parse('false'), env)).toEqual({
                TAG: "Ok",
                _0: "Bool"
            });
        });
    });

    describe('for arithmetic', () => {
        describe('successfully', () => {
            it('infer type of 1 + 2 as Int', () => {
                expect(typeCheck(parse('1 + 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 5 - 2 as Int', () => {
                expect(typeCheck(parse('5 - 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 3 * 4 as Int', () => {
                expect(typeCheck(parse('3 * 4'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 8 / 2 as Int', () => {
                expect(typeCheck(parse('8 / 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of 7 mod 3 as Int', () => {
                expect(typeCheck(parse('7 mod 3'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 + true as Error', () => {
                expect(typeCheck(parse('1 + true'), env)).toEqual({
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
                expect(typeCheck(parse('false - 2'), env)).toEqual({
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
            expect(typeCheck(parse('(1 + 2) * (3 - 4) / (5 + 6 mod 2)'), env)).toEqual({
                TAG: "Ok",
                _0: "Int"
            });
        });
    });

    describe('for comparison', () => {
        describe('successfully', () => {
            it('infer type of 1 == 2 as Bool', () => {
                expect(typeCheck(parse('1 == 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true == false as Bool', () => {
                expect(typeCheck(parse('true == false'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 3 != 4 as Bool', () => {
                expect(typeCheck(parse('3 != 4'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true != true as Bool', () => {
                expect(typeCheck(parse('true != true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 5 < 6 as Bool', () => {
                expect(typeCheck(parse('5 < 6'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 7 <= 8 as Bool', () => {
                expect(typeCheck(parse('7 <= 8'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 9 > 10 as Bool', () => {
                expect(typeCheck(parse('9 > 10'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of 11 >= 12 as Bool', () => {
                expect(typeCheck(parse('11 >= 12'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of 1 == true as Error', () => {
                expect(typeCheck(parse('1 == true'), env)).toEqual({
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
                expect(typeCheck(parse('false != 2'), env)).toEqual({
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
                expect(typeCheck(parse('3 < true'), env)).toEqual({
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
                expect(typeCheck(parse('false <= 4'), env)).toEqual({
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
                expect(typeCheck(parse('true && false'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of false || true as Bool', () => {
                expect(typeCheck(parse('false || true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true && false || true as Bool', () => {
                expect(typeCheck(parse('true && false || true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of true || false && true as Bool', () => {
                expect(typeCheck(parse('true || false && true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of !true as Bool', () => {
                expect(typeCheck(parse('!true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of true && 1 as Error', () => {
                expect(typeCheck(parse('true && 1'), env)).toEqual({
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
                expect(typeCheck(parse('false || 2'), env)).toEqual({
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
                expect(typeCheck(parse('!1'), env)).toEqual({
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
                expect(typeCheck(parse('if 1 < 2 then 3 + 4 else 5 * 6'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of if false then false else true as Bool', () => {
                expect(typeCheck(parse('if false then false else true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of if 1 then 2 else 3 as Error', () => {
                expect(typeCheck(parse('if 1 then 2 else 3'), env)).toEqual({
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
                expect(typeCheck(parse('if true then 1 else false'), env)).toEqual({
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
                expect(typeCheck(parse('let x = 1 in x + 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
            it('infer type of let y = true in if y then false else true as Bool', () => {
                expect(typeCheck(parse('let y = true in if y then false else true'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Bool"
                });
            });
            it('infer type of let x = 1 in let y = 2 in x + y as Int', () => {
                expect(typeCheck(parse('let x = 1 in let y = 2 in x + y'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });

        describe('fails typecheck', () => {
            it('infer type of let x:int = true in x as Error', () => {
                expect(typeCheck(parse('let x:int = true in x'), env)).toEqual({
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
                expect(typeCheck(parse('(x: int) => { x + 1 }'), env)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Func",
                        _0: "Int",
                        _1: "Int"
                    }
                });
            });

            it('infer type of (x: int):int => { x + 1 } as (Int -> Int)', () => {
                expect(typeCheck(parse('(x: int):int => { x + 1 }'), env)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Func",
                        _0: "Int",
                        _1: "Int"
                    }
                });
            });

            it('infer type of (x: int, y:bool) => { x + y } as (Int -> Int)', () => {
                expect(typeCheck(parse('(x: int, y: bool) => { if y then x + 1 else x - 1 }'), env)).
                    toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "TAG": "Func",
                      "_0": "Int",
                      "_1": {
                        "TAG": "Func",
                        "_0": "Bool",
                        "_1": "Int",
                      },
                    },
                  }
                `)
            });
        });

        describe('fails typecheck', () => {
            it('infer type of (x: int):bool => { x + 1 } as Error', () => {
                expect(typeCheck(parse('(x: int):bool => { x + 1 }'), env)).toEqual({
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
                expect(typeCheck(parse('(x) => { x + 1 }'), env)).toEqual({
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
                expect(typeCheck(parse('let y = (x: int) => { x + 1 } in y 2'), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });
        });
    });

    describe('for let rec expressions', () => {
        describe('successfully', () => {
            it('infer let rec with clsabs', () => {
                const input = `
                let rec f = [g1:>!](x: <int@g1>):<int@g1> =>
                              { \`{@g1 ~{ x } + 1 } } in
                \`{@! (y:int@g2) => { ~{ f^g2 \`{@g2 y } } } }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "TAG": "Code",
                      "cls": "Initial",
                      "typ": {
                        "TAG": "Func",
                        "_0": "Int",
                        "_1": "Int",
                      },
                    },
                  }
                `);
            });

            it('infer let rec with different type annotation', () => {
                const input = `
                let rec f:[g:>!](<int@g>-><int@g>) = [g1:>!](x: <int@g1>) =>
                              { \`{@g1 ~{ x } + 1 } } in
                \`{@! (y:int@g2) => { ~{ f^g2 \`{@g2 y } } } }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "TAG": "Code",
                      "cls": "Initial",
                      "typ": {
                        "TAG": "Func",
                        "_0": "Int",
                        "_1": "Int",
                      },
                    },
                  }
                `);
            });
        });

        describe('fails', () => {
            it('due to insufficient type annotation', () => {
                const input = `
                let rec f = [g1:>!](x: <int@g1>) =>
                              { \`{@g1 ~{ x } + 1 } } in
                \`{@! (y:int@g2) => { ~{ f^g2 \`{@g2 y } } } }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "InsufficientTypeAnnotation",
                      "metaData": {
                        "end": {
                          "col": 52,
                          "row": 2,
                        },
                        "start": {
                          "col": 35,
                          "row": 1,
                        },
                      },
                    },
                  }
                `);
            });
        });

    });

    describe('for quottation', () => {
        describe('successfully', () => {
            it('infer type of quotation', () => {
                const input = "`{@! 1 + 1 }"
                expect(typeCheck(parse(input), env)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Code",
                        cls: "Initial",
                        typ: "Int"
                    }
                });
            });

            it('infer type of nested quotation', () => {
                const input = "`{@! `{@! 1 + 1 }}"
                expect(typeCheck(parse(input), env)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Code",
                        cls: "Initial",
                        typ: {
                            TAG: "Code",
                            cls: "Initial",
                            typ: "Int"
                        }
                    }
                });
            });
        })

        describe('fails', () => {
            it('due to undefined classifier', () => {
                const input = "`{@g 1 + 1 }"
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "UndefinedClassifier",
                      "cls": {
                        "TAG": "Named",
                        "_0": "g",
                      },
                      "metaData": {
                        "end": {
                          "col": 12,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                    },
                  }
                `)
            });

            it('due to illegal use of variables', () => {
                const input = `
                let x:int = 1 in
                \`{@! x }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "UndefinedVariable",
                      "metaData": {
                        "end": {
                          "col": 22,
                          "row": 2,
                        },
                        "start": {
                          "col": 21,
                          "row": 2,
                        },
                      },
                      "var": {
                        "TAG": "Raw",
                        "name": "x",
                      },
                    },
                  }
                `)
            })
        })
    })

    describe('for splice', () => {
        describe('successfully', () => {
            it('infer type of splice with initial classifier', () => {
                const input = "`{@! ~{ `{@! 1 + 1 } } }"
                expect(typeCheck(parse(input), env)).toEqual({
                    TAG: "Ok",
                    _0: {
                        TAG: "Code",
                        cls: "Initial",
                        typ: "Int"
                    }
                });
            });

            it('infer type of splice with non-initial classifier', () => {
                const input = `
                  let x:int@g = 1 in
                  let double = (y:<int@g>) => {
                    \`{@g ~{y} * 2 }
                  } in
                  let z = \`{@g x + ~{ double \`{@g x } }} in
                  1
                `
                expect(typeCheck(parse(input), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });

            it('infer type of run-time evaluation', () => {
                const input = `
                  let x:int@g = 1 in
                  let y = \`{@g x + 1 } in
                  ~0{ y }
                `
                expect(typeCheck(parse(input), env)).toEqual({
                    TAG: "Ok",
                    _0: "Int"
                });
            });

        })

        describe('fails', () => {
            it('due to classifier inconsistency', () => {
                const input = `
                  let x:int@g = 1 in
                  let y:<int@g> = \`{@g x } in
                  \`{@! 1 + ~{ y } }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "ClassifierMismatch",
                      "current": "Initial",
                      "metaData": {
                        "end": {
                          "col": 33,
                          "row": 3,
                        },
                        "start": {
                          "col": 27,
                          "row": 3,
                        },
                      },
                      "spliced": {
                        "TAG": "Named",
                        "_0": "g",
                      },
                    },
                  }
                `)
            })
        })
    })

    describe('for clsabs and clsapp', () => {
        describe('successfully', () => {
            it('infer type of classifier abstraction', () => {
                const input = "[g1:>!](x:<int@g1>)=>{ `{@g1 ~{ x } + 1 } }"
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "TAG": "ClsAbs",
                      "base": "Initial",
                      "body": {
                        "TAG": "Func",
                        "_0": {
                          "TAG": "Code",
                          "cls": {
                            "TAG": "Named",
                            "_0": "g1",
                          },
                          "typ": "Int",
                        },
                        "_1": {
                          "TAG": "Code",
                          "cls": {
                            "TAG": "Named",
                            "_0": "g1",
                          },
                          "typ": "Int",
                        },
                      },
                      "cls": {
                        "TAG": "Named",
                        "_0": "g1",
                      },
                    },
                  }
                `)
            });

            it('infer type of classifier abstraction', () => {
                const input = `
                (f:[g1:>!](<int@g1>-><int@g1>))=>{
                  let y:int@g2 = 10 in
                  ~0{ f^g2 \`{@g2 y } }
                }
                `
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "TAG": "Func",
                      "_0": {
                        "TAG": "ClsAbs",
                        "base": "Initial",
                        "body": {
                          "TAG": "Func",
                          "_0": {
                            "TAG": "Code",
                            "cls": {
                              "TAG": "Named",
                              "_0": "g1",
                            },
                            "typ": "Int",
                          },
                          "_1": {
                            "TAG": "Code",
                            "cls": {
                              "TAG": "Named",
                              "_0": "g1",
                            },
                            "typ": "Int",
                          },
                        },
                        "cls": {
                          "TAG": "Named",
                          "_0": "g1",
                        },
                      },
                      "_1": "Int",
                    },
                  }
                `)
            });


        });
    });

    describe('for scope extrusion detection', () => {
        describe('success cases', () => {
            it('let', () => {
                const input = "let x:int@g = 1 in `{@g x }"
                // FIXME: metadata wrong
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "ClassifierEscape",
                      "metaData": {
                        "end": {
                          "col": 27,
                          "row": 0,
                        },
                        "start": {
                          "col": 19,
                          "row": 0,
                        },
                      },
                    },
                  }
                `);
            });

            it('let rec value part', () => {
                const input = "let rec x@g = (y:int):<int@g> => { `{@g x } } in 1"
                // FIXME: metadata wrong
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "ClassifierEscape",
                      "metaData": {
                        "end": {
                          "col": 45,
                          "row": 0,
                        },
                        "start": {
                          "col": 14,
                          "row": 0,
                        },
                      },
                    },
                  }
                `);
            });

            it('let rec body part', () => {
                const input = "let rec x@g = (y:int):int => { y } in `{@g x }"
                // FIXME: metadata wrong
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "ClassifierEscape",
                      "metaData": {
                        "end": {
                          "col": 46,
                          "row": 0,
                        },
                        "start": {
                          "col": 38,
                          "row": 0,
                        },
                      },
                    },
                  }
                `);
            });

            it('function', () => {
                const input = "(x:int@g) => { `{@g x } }"
                // FIXME: metadata wrong
                expect(typeCheck(parse(input), env)).toMatchInlineSnapshot(`
                  {
                    "TAG": "Error",
                    "_0": {
                      "TAG": "ClassifierEscape",
                      "metaData": {
                        "end": {
                          "col": 25,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                    },
                  }
                `);
            })

        })
    });

});
