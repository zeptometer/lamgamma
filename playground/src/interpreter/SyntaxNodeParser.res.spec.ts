import { expect, it, beforeAll, beforeEach, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSourceFileNode } from './SyntaxNodeParser.gen.ts';
import { Source_reset as classifier_source_reset } from './Classifier.gen.ts';

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

beforeEach(() => {
  classifier_source_reset();
})

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
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 14,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Let",
                        "body": {
                          "metaData": {
                            "end": {
                              "col": 14,
                              "row": 0,
                            },
                            "start": {
                              "col": 13,
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
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 9,
                              "row": 0,
                            },
                            "start": {
                              "col": 8,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 1,
                          },
                        },
                        "param": {
                          "cls": {
                            "TAG": "Generated",
                            "_0": 1,
                          },
                          "typ": undefined,
                          "var": {
                            "TAG": "Raw",
                            "name": "x",
                          },
                        },
                      },
                    },
                  }
                `);
    });

    it('parse let x:int = 1 in x', () => {
      const input = 'let x:int = 1 in x';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 18,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Let",
                        "body": {
                          "metaData": {
                            "end": {
                              "col": 18,
                              "row": 0,
                            },
                            "start": {
                              "col": 17,
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
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 13,
                              "row": 0,
                            },
                            "start": {
                              "col": 12,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 1,
                          },
                        },
                        "param": {
                          "cls": {
                            "TAG": "Generated",
                            "_0": 1,
                          },
                          "typ": "Int",
                          "var": {
                            "TAG": "Raw",
                            "name": "x",
                          },
                        },
                      },
                    },
                  }
                `);
    });

    it('parse let with classifier annotation', () => {
      const input = 'let x@g = 1 in x';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 16,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Let",
                        "body": {
                          "metaData": {
                            "end": {
                              "col": 16,
                              "row": 0,
                            },
                            "start": {
                              "col": 15,
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
                        "expr": {
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
                            "_0": 1,
                          },
                        },
                        "param": {
                          "cls": {
                            "TAG": "Named",
                            "_0": "g",
                          },
                          "typ": undefined,
                          "var": {
                            "TAG": "Raw",
                            "name": "x",
                          },
                        },
                      },
                    },
                  }
                `);
    });

    it('parse let with both type and classifier annotation', () => {
      const input = 'let x:int@g = 1 in x';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 20,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Let",
                        "body": {
                          "metaData": {
                            "end": {
                              "col": 20,
                              "row": 0,
                            },
                            "start": {
                              "col": 19,
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
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 15,
                              "row": 0,
                            },
                            "start": {
                              "col": 14,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 1,
                          },
                        },
                        "param": {
                          "cls": {
                            "TAG": "Named",
                            "_0": "g",
                          },
                          "typ": "Int",
                          "var": {
                            "TAG": "Raw",
                            "name": "x",
                          },
                        },
                      },
                    },
                  }
                `)
    });
  });

  describe('for function definitions', () => {
    it('parse (x) => { 10 }', () => {
      const input = '(x) => { 10 }';

      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 13,
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
                              "col": 11,
                              "row": 0,
                            },
                            "start": {
                              "col": 9,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 10,
                          },
                        },
                        "params": {
                          "hd": {
                            "cls": {
                              "TAG": "Generated",
                              "_0": 1,
                            },
                            "typ": undefined,
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
    });

    it('parse (x:int):int => {10}', () => {
      const input = '(x:int):int => { 10 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 21,
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
                              "col": 19,
                              "row": 0,
                            },
                            "start": {
                              "col": 17,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 10,
                          },
                        },
                        "params": {
                          "hd": {
                            "cls": {
                              "TAG": "Generated",
                              "_0": 1,
                            },
                            "typ": "Int",
                            "var": {
                              "TAG": "Raw",
                              "name": "x",
                            },
                          },
                          "tl": 0,
                        },
                        "returnType": "Int",
                      },
                    },
                  }
                `);
    })

    it('parse func with both type and classifier annotations', () => {
      const input = '(x:int@g):int => { 10 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 23,
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
                              "col": 21,
                              "row": 0,
                            },
                            "start": {
                              "col": 19,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 10,
                          },
                        },
                        "params": {
                          "hd": {
                            "cls": {
                              "TAG": "Named",
                              "_0": "g",
                            },
                            "typ": "Int",
                            "var": {
                              "TAG": "Raw",
                              "name": "x",
                            },
                          },
                          "tl": 0,
                        },
                        "returnType": "Int",
                      },
                    },
                  }
                `)
    })

    it('parse function with multiple params', () => {
      const input = '(x, y:int, z:int@g):int => { 10 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 33,
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
                              "col": 31,
                              "row": 0,
                            },
                            "start": {
                              "col": 29,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "IntLit",
                            "_0": 10,
                          },
                        },
                        "params": {
                          "hd": {
                            "cls": {
                              "TAG": "Generated",
                              "_0": 1,
                            },
                            "typ": undefined,
                            "var": {
                              "TAG": "Raw",
                              "name": "x",
                            },
                          },
                          "tl": {
                            "hd": {
                              "cls": {
                                "TAG": "Generated",
                                "_0": 2,
                              },
                              "typ": "Int",
                              "var": {
                                "TAG": "Raw",
                                "name": "y",
                              },
                            },
                            "tl": {
                              "hd": {
                                "cls": {
                                  "TAG": "Named",
                                  "_0": "g",
                                },
                                "typ": "Int",
                                "var": {
                                  "TAG": "Raw",
                                  "name": "z",
                                },
                              },
                              "tl": 0,
                            },
                          },
                        },
                        "returnType": "Int",
                      },
                    },
                  }
                `);
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

  describe('for quotations', () => {
    it('parse quotation', () => {
      const input = '`{ x + 1 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 10,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Quote",
                        "cls": undefined,
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 8,
                              "row": 0,
                            },
                            "start": {
                              "col": 3,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "BinOp",
                            "left": {
                              "metaData": {
                                "end": {
                                  "col": 4,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 3,
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
                            "op": "Add",
                            "right": {
                              "metaData": {
                                "end": {
                                  "col": 8,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 7,
                                  "row": 0,
                                },
                              },
                              "raw": {
                                "TAG": "IntLit",
                                "_0": 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  }
                `)
    });

    it('parse quotation with classifier annotation', () => {
      const input = '`{@g x + 1 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
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
                      "raw": {
                        "TAG": "Quote",
                        "cls": {
                          "TAG": "Named",
                          "_0": "g",
                        },
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 10,
                              "row": 0,
                            },
                            "start": {
                              "col": 5,
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
                                  "col": 5,
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
                            "op": "Add",
                            "right": {
                              "metaData": {
                                "end": {
                                  "col": 10,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 9,
                                  "row": 0,
                                },
                              },
                              "raw": {
                                "TAG": "IntLit",
                                "_0": 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  }
                `)
    });

  });

  describe('for splices', () => {
    it('parse splice', () => {
      const input = '~1{ x + 1 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
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
                        "TAG": "Splice",
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 9,
                              "row": 0,
                            },
                            "start": {
                              "col": 4,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "BinOp",
                            "left": {
                              "metaData": {
                                "end": {
                                  "col": 5,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 4,
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
                            "op": "Add",
                            "right": {
                              "metaData": {
                                "end": {
                                  "col": 9,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 8,
                                  "row": 0,
                                },
                              },
                              "raw": {
                                "TAG": "IntLit",
                                "_0": 1,
                              },
                            },
                          },
                        },
                        "shift": 1,
                      },
                    },
                  }
                `)
    });

    it('parse splice without shift', () => {
      const input = '~{ x + 1 }';
      expect(parseSourceFileNode((parser.parse(input)).rootNode))
        .toMatchInlineSnapshot(`
                  {
                    "TAG": "Ok",
                    "_0": {
                      "metaData": {
                        "end": {
                          "col": 10,
                          "row": 0,
                        },
                        "start": {
                          "col": 0,
                          "row": 0,
                        },
                      },
                      "raw": {
                        "TAG": "Splice",
                        "expr": {
                          "metaData": {
                            "end": {
                              "col": 8,
                              "row": 0,
                            },
                            "start": {
                              "col": 3,
                              "row": 0,
                            },
                          },
                          "raw": {
                            "TAG": "BinOp",
                            "left": {
                              "metaData": {
                                "end": {
                                  "col": 4,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 3,
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
                            "op": "Add",
                            "right": {
                              "metaData": {
                                "end": {
                                  "col": 8,
                                  "row": 0,
                                },
                                "start": {
                                  "col": 7,
                                  "row": 0,
                                },
                              },
                              "raw": {
                                "TAG": "IntLit",
                                "_0": 1,
                              },
                            },
                          },
                        },
                        "shift": 1,
                      },
                    },
                  }
                `)
    });
  });
});

describe('parseTypeNode', () => {
  it('parse int type', () => {
    const input = '(x:int) => { x }';
    expect(parseSourceFileNode((parser.parse(input)).rootNode))
      .toMatchInlineSnapshot(`
              {
                "TAG": "Ok",
                "_0": {
                  "metaData": {
                    "end": {
                      "col": 16,
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
                          "col": 14,
                          "row": 0,
                        },
                        "start": {
                          "col": 13,
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
                        "cls": {
                          "TAG": "Generated",
                          "_0": 1,
                        },
                        "typ": "Int",
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

  it('parse bool type', () => {
    const input = '(x:bool) => { x }';
    expect(parseSourceFileNode((parser.parse(input)).rootNode))
      .toMatchInlineSnapshot(`
              {
                "TAG": "Ok",
                "_0": {
                  "metaData": {
                    "end": {
                      "col": 17,
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
                          "col": 15,
                          "row": 0,
                        },
                        "start": {
                          "col": 14,
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
                        "cls": {
                          "TAG": "Generated",
                          "_0": 1,
                        },
                        "typ": "Bool",
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
            `)
  });

  it('parse func type', () => {
    const input = '(x:int->int) => { x }';
    expect(parseSourceFileNode((parser.parse(input)).rootNode))
      .toMatchInlineSnapshot(`
              {
                "TAG": "Ok",
                "_0": {
                  "metaData": {
                    "end": {
                      "col": 21,
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
                          "col": 19,
                          "row": 0,
                        },
                        "start": {
                          "col": 18,
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
                        "cls": {
                          "TAG": "Generated",
                          "_0": 1,
                        },
                        "typ": {
                          "TAG": "Func",
                          "_0": "Int",
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
                        "cls": {
                          "TAG": "Generated",
                          "_0": 1,
                        },
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
});

describe('parseClassifier', () => {
  it('parse classifier', () => {
    const input = '(x@!) => { x }';
    expect(parseSourceFileNode((parser.parse(input)).rootNode))
      .toMatchInlineSnapshot(`
          {
            "TAG": "Ok",
            "_0": {
              "metaData": {
                "end": {
                  "col": 14,
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
                      "col": 12,
                      "row": 0,
                    },
                    "start": {
                      "col": 11,
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
                    "cls": "Initial",
                    "typ": undefined,
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
        `)
  });
});