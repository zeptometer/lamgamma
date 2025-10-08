import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';

let parser;

beforeAll(
    async () => {
        await Parser.init();
        const parser1 = new Parser();
        const lamgamma = await Language.load('public/tree-sitter-lamgamma_parser.wasm');
        parser1.setLanguage(lamgamma);
        parser = parser1;
    }
)

describe('parseSourceFileNode', () => {
    describe('for integer', () => {
        it('parse zero', () => {
            const input = '0';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 }, },
                    raw: { TAG: "IntLit", _0: 0 }
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse literal', () => {
            const input = '12321';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 }, },
                    raw: { TAG: "IntLit", _0: 12321 }
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        /* This should be fixed */
        it('parse 0-headed literal', () => {
            const input = '00001';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 }, },
                    raw: { TAG: "IntLit", _0: 1 }
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

    });

    describe('for boolean', () => {
        it('parse true', () => {
            const input = 'true';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 4 }, },
                    raw: { TAG: "BoolLit", _0: true }
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse false', () => {
            const input = 'false';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 }, },
                    raw: { TAG: "BoolLit", _0: false }
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for arithmetic', () => {
        it('parse addition', () => {
            const input = '1 + 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 5 },
                    },
                    raw: {
                        TAG: "BinOp",
                        op: "Add",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 },
                        },
                    },
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse subtraction', () => {
            const input = '1 - 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 5 },
                    },
                    raw: {
                        TAG: "BinOp",
                        op: "Sub",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 },
                        },
                    },
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse multiplication', () => {
            const input = '1 * 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 5 },
                    },
                    raw: {
                        TAG: "BinOp",
                        op: "Mul",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 },
                        },
                    },
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse division', () => {
            const input = '1 / 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 5 },
                    },
                    raw: {
                        TAG: "BinOp",
                        op: "Div",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 },
                        },
                    },
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse modulus', () => {
            const input = '5 mod 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 7 },
                    },
                    raw: {
                        TAG: "BinOp",
                        op: "Mod",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 5 },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 6 }, end: { row: 0, col: 7 } },
                            raw: { TAG: "IntLit", _0: 2 },
                        },
                    },
                },
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for comparison', () => {
        it('parse equality', () => {
            const input = '1 == 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 6 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Eq",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 5 }, end: { row: 0, col: 6 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse inequality', () => {
            const input = '1 != 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 6 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Ne",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 5 }, end: { row: 0, col: 6 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse less-than', () => {
            const input = '1 < 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Lt",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse less-than-or-equal', () => {
            const input = '1 <= 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 6 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Le",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 5 }, end: { row: 0, col: 6 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse greater-than', () => {
            const input = '1 > 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Gt",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse greater-than-or-equal', () => {
            const input = '1 >= 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 6 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Ge",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 5 }, end: { row: 0, col: 6 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for parens', () => {
        it('parse (1 + 2) * 3', () => {
            const input = '(1 + 2) * 3';
            expect(parseSourceFileNode((parser.parse(input)).rootNode)).toMatchInlineSnapshot(`
              {
                "TAG": "Ok",
                "_0": {
                  "metaData": {
                    "end": {
                      "col": 11,
                      "row": 0,
                    },
                    "start": {
                      "col": 0,
                      "row": 0,
                    },
                  },
                  "raw": {
                    "TAG": "BinOp",
                    "left": {
                      "metaData": {
                        "end": {
                          "col": 6,
                          "row": 0,
                        },
                        "start": {
                          "col": 1,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "BinOp",
                        "left": {
                          "metaData": {
                            "end": {
                              "col": 2,
                              "row": 0,
                            },
                            "start": {
                              "col": 1,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 1,
                          },
                        },
                        "op": "Add",
                        "right": {
                          "metaData": {
                            "end": {
                              "col": 6,
                              "row": 0,
                            },
                            "start": {
                              "col": 5,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 2,
                          },
                        },
                      },
                    },
                    "op": "Mul",
                    "right": {
                      "metaData": {
                        "end": {
                          "col": 11,
                          "row": 0,
                        },
                        "start": {
                          "col": 10,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "IntLit",
                        "_0": 3,
                      },
                    },
                  },
                },
              }
            `)
        });
    });

    describe('for logical operators', () => {
        it('parse true && false || true', () => {
            const input = 'true && false || true';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 21 },
                    },
                    raw: {
                        TAG: "ShortCircuitOp",
                        op: "Or",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 13 } },
                            raw: {
                                TAG: "ShortCircuitOp",
                                op: "And",
                                left: {
                                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } },
                                    raw: { TAG: "BoolLit", _0: true }
                                },
                                right: {
                                    metaData: { start: { row: 0, col: 8 }, end: { row: 0, col: 13 } },
                                    raw: { TAG: "BoolLit", _0: false }
                                }
                            }
                        },
                        right: {
                            metaData: { start: { row: 0, col: 17 }, end: { row: 0, col: 21 } },
                            raw: { TAG: "BoolLit", _0: true }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse !true', () => {
            const input = '!true';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
                    raw: {
                        TAG: "UniOp",
                        op: "Not",
                        expr: {
                            metaData: { start: { row: 0, col: 1 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "BoolLit", _0: true }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for if expressions', () => {
        it('parse if true then 1 else 2', () => {
            const input = 'if true then 1 else 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 21 },
                    },
                    raw: {
                        TAG: "If",
                        cond: {
                            metaData: { start: { row: 0, col: 3 }, end: { row: 0, col: 7 } },
                            raw: { TAG: "BoolLit", _0: true }
                        },
                        thenBranch: {
                            metaData: { start: { row: 0, col: 13 }, end: { row: 0, col: 14 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        elseBranch: {
                            metaData: { start: { row: 0, col: 20 }, end: { row: 0, col: 21 } },
                            raw: { TAG: "IntLit", _0: 2 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for variables', () => {
        it('parse x', () => {
            const input = 'x';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                    raw: { TAG: "Var", _0: { TAG: "Raw", name: 'x' } }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for let expressions', () => {
        it('parse let x = 1 in x', () => {
            const input = 'let x = 1 in x';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 14 } },
                    raw: {
                        TAG: "Let",
                        param: { typ: undefined, var: { TAG: "Raw", name: 'x' } },
                        expr: {
                            metaData: { start: { row: 0, col: 8 }, end: { row: 0, col: 9 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        body: {
                            metaData: { start: { row: 0, col: 13 }, end: { row: 0, col: 14 } },
                            raw: { TAG: "Var", _0: { TAG: "Raw", name: 'x' } }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse let x:int = 1 in x', () => {
            const input = 'let x:int = 1 in x';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 18 } },
                    raw: {
                        TAG: "Let",
                        param: { typ: "Int", var: { TAG: "Raw", name: 'x' } },
                        expr: {
                            metaData: { start: { row: 0, col: 12 }, end: { row: 0, col: 13 } },
                            raw: { TAG: "IntLit", _0: 1 }
                        },
                        body: {
                            metaData: { start: { row: 0, col: 17 }, end: { row: 0, col: 18 } },
                            raw: { TAG: "Var", _0: { TAG: "Raw", name: 'x' } }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

    });

    describe('for function definitions', () => {
        it('parse (x) => { 10 }', () => {
            const input = '(x) => { 10 }';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 13 } },
                    raw: {
                        TAG: "Func",
                        params: { hd: { typ: undefined, var: { TAG: "Raw", name: "x" } }, tl: 0 },
                        returnType: undefined,
                        body: {
                            metaData: { start: { row: 0, col: 9 }, end: { row: 0, col: 11 } },
                            raw: { TAG: "IntLit", _0: 10 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse (x:int):int => {10}', () => {
            const input = '(x:int):int => { 10 }';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 21 } },
                    raw: {
                        TAG: "Func",
                        params: { hd: { typ: "Int", var: { TAG: "Raw", name: "x" } }, tl: 0 },
                        returnType: "Int",
                        body: {
                            metaData: { start: { row: 0, col: 17 }, end: { row: 0, col: 19 } },
                            raw: { TAG: "IntLit", _0: 10 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        })

        it('parse (x:int, y:int):int => {10}', () => {
            const input = '(x:int, y:int):int => { 10 }';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 28 } },
                    raw: {
                        TAG: "Func",
                        params: { hd: { typ: "Int", var: { TAG: "Raw", name: "x" } }, tl: { hd: { typ: "Int", var: { TAG: "Raw", name: "y" } }, tl: 0 } },
                        returnType: "Int",
                        body: {
                            metaData: { start: { row: 0, col: 24 }, end: { row: 0, col: 26 } },
                            raw: { TAG: "IntLit", _0: 10 }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        })
    });

    describe('for applications', () => {
        it('parse x y z', () => {
            const input = 'x y z';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
                    raw: {
                        TAG: "App",
                        func: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 3 } },
                            raw: {
                                TAG: "App",
                                func: {
                                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                                    raw: { TAG: "Var", _0: { TAG: "Raw", name: "x" } }
                                },
                                arg: {
                                    metaData: { start: { row: 0, col: 2 }, end: { row: 0, col: 3 } },
                                    raw: { TAG: "Var", _0: { TAG: "Raw", name: "y" } }
                                }
                            }
                        },
                        arg: {
                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                            raw: { TAG: "Var", _0: { TAG: "Raw", name: "z" } }
                        }
                    }
                }
            };
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        })
    })

    describe('for combined expressions', () => {
        it('parse (1 + 2) * 3 == 9 - 6 / 2', () => {
            const input = '(1 + 2) * 3 == 9 - 6 / 2';
            expect(parseSourceFileNode((parser.parse(input)).rootNode)).toMatchSnapshot();
        });
    });

    describe('for errornious input', () => {
        it('unneccesarry fun', () => {
            const input = 'fun (x: int) -> { x + 1 }';
            expect(parseSourceFileNode((parser.parse(input)).rootNode)).toMatchInlineSnapshot(`
              {
                "TAG": "Error",
                "_0": {
                  "TAG": "SyntaxError",
                  "end": {
                    "column": 11,
                    "row": 0,
                  },
                  "start": {
                    "column": 6,
                    "row": 0,
                  },
                },
              }
            `);
        })
    })
});

describe('parseTypeNode', () => {
    it('parse int type', () => {
        const input = '(x:int) => { x }';
        const expectedOutput = {
            TAG: "Ok",
            _0: {
                metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 16 } },
                raw: {
                    TAG: "Func",
                    params: { hd: { typ: "Int", var: { TAG: "Raw", name: "x" } }, tl: 0 },
                    returnType: undefined,
                    body: {
                        metaData: { start: { row: 0, col: 13 }, end: { row: 0, col: 14 } },
                        raw: { TAG: "Var", _0: { TAG: "Raw", name: "x" } }
                    }
                }
            }
        };
        expect(parseSourceFileNode((parser.parse(input)).rootNode))
            .toEqual(expectedOutput);
    })

    it('parse bool type', () => {
        const input = '(x:bool) => { x }';
        const expectedOutput = {
            TAG: "Ok",
            _0: {
                metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 17 } },
                raw: {
                    TAG: "Func",
                    params: { hd: { typ: "Bool", var: { TAG: "Raw", name: "x" } }, tl: 0 },
                    returnType: undefined,
                    body: {
                        metaData: { start: { row: 0, col: 14 }, end: { row: 0, col: 15 } },
                        raw: { TAG: "Var", _0: { TAG: "Raw", name: "x" } }
                    }
                }
            }
        };
        expect(parseSourceFileNode((parser.parse(input)).rootNode))
            .toEqual(expectedOutput);
    })


    it('parse func type', () => {
        const input = '(x:int->int) => { x }';
        const expectedOutput = {
            TAG: "Ok",
            _0: {
                metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 21 } },
                raw: {
                    TAG: "Func",
                    params: { hd: { typ: { TAG: "Func", _0: "Int", _1: "Int" }, var: { TAG: "Raw", name: "x" } }, tl: 0 },
                    returnType: undefined,
                    body: {
                        metaData: { start: { row: 0, col: 18 }, end: { row: 0, col: 19 } },
                        raw: { TAG: "Var", _0: { TAG: "Raw", name: "x" } }
                    }
                }
            }
        };
        expect(parseSourceFileNode((parser.parse(input)).rootNode))
            .toEqual(expectedOutput);
    })

    it('parse type with paren', () => {
        const input = '(x:(int->int)->int) => { x }';
        expect(parseSourceFileNode((parser.parse(input)).rootNode))
            .toMatchInlineSnapshot(`
              {
                "TAG": "Ok",
                "_0": {
                  "metaData": {
                    "end": {
                      "col": 28,
                      "row": 0,
                    },
                    "start": {
                      "col": 0,
                      "row": 0,
                    },
                  },
                  "raw": {
                    "TAG": "Func",
                    "body": {
                      "metaData": {
                        "end": {
                          "col": 26,
                          "row": 0,
                        },
                        "start": {
                          "col": 25,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Var",
                        "_0": {
                          "TAG": "Raw",
                          "name": "x",
                        },
                      },
                    },
                    "params": {
                      "hd": {
                        "typ": {
                          "TAG": "Func",
                          "_0": {
                            "TAG": "Func",
                            "_0": "Int",
                            "_1": "Int",
                          },
                          "_1": "Int",
                        },
                        "var": {
                          "TAG": "Raw",
                          "name": "x",
                        },
                      },
                      "tl": 0,
                    },
                    "returnType": undefined,
                  },
                },
              }
            `);
    })

    describe('for letrec expressions', () => {
        it('parse let rec', () => {
            const input = `
              let rec x: int->int = (y) => {
                if y >= 0 then
                  0
                else
                  y + x(y-1)
              } in
              x 10
            `;
            expect(parseSourceFileNode((parser.parse(input)).rootNode))
                .toMatchSnapshot();
        });

    });

});