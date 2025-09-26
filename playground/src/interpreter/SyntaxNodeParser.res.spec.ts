import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSyntaxNode } from './SyntaxNodeParser.gen.ts';

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

describe('SyntaxNodeParser', () => {
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse complex expression', () => {
            const input = '1 + 2 * 3 - 4 / 5';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        start: { row: 0, col: 0 },
                        end: { row: 0, col: 17 },
                    },
                    raw: {
                        TAG: "BinOp",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 9 } },
                            raw: {
                                TAG: "BinOp",
                                left: {
                                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                                    raw: { TAG: "IntLit", _0: 1 },
                                },
                                op: "Add",
                                right: {
                                    metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 9 } },
                                    raw: {
                                        TAG: "BinOp",
                                        left: {
                                            metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                                            raw: { TAG: "IntLit", _0: 2 },
                                        },
                                        op: "Mul",
                                        right: {
                                            metaData: { start: { row: 0, col: 8 }, end: { row: 0, col: 9 } },
                                            raw: { TAG: "IntLit", _0: 3 },
                                        },
                                    },
                                },
                            },
                        },
                        op: "Sub",
                        right: {
                            metaData: { start: { row: 0, col: 12 }, end: { row: 0, col: 17 } },
                            raw: {
                                TAG: "BinOp",
                                left: {
                                    metaData: { start: { row: 0, col: 12 }, end: { row: 0, col: 13 } },
                                    raw: { TAG: "IntLit", _0: 4 },
                                },
                                op: "Div",
                                right: {
                                    metaData: { start: { row: 0, col: 16 }, end: { row: 0, col: 17 } },
                                    raw: { TAG: "IntLit", _0: 5 },
                                },
                            },
                        },
                    },
                },
            }
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
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
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse complex expression', () => {
            const input = '1 + 2 == 4 - 5';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 14 } },
                    raw: {
                        TAG: "BinOp",
                        op: "Eq",
                        left: {
                            metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 5 } },
                            raw: {
                                TAG: "BinOp",
                                left: {
                                    metaData: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 } },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 1,
                                    },
                                },
                                op: "Add",
                                right: {
                                    metaData: { start: { row: 0, col: 4 }, end: { row: 0, col: 5 } },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 2,
                                    },
                                },
                            },
                        },
                        right: {
                            metaData: { start: { row: 0, col: 9 }, end: { row: 0, col: 14 } },
                            raw: {
                                TAG: "BinOp",
                                op: "Sub",
                                left: {
                                    metaData: { start: { row: 0, col: 9 }, end: { row: 0, col: 10 } },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 4,
                                    },
                                },
                                right: {
                                    metaData: { start: { row: 0, col: 13 }, end: { row: 0, col: 14 } },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 5,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });

    describe('for parens', () => {
        it('parse (1 + 2) * 3', () => {
            const input = '(1 + 2) * 3';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    metaData: {
                        end: { row: 0, col: 11 },
                        start: { row: 0, col: 0 },
                    },
                    raw: {
                        TAG: "BinOp",
                        left: {
                            metaData: {
                                end: { row: 0, col: 6 },
                                start: { row: 0, col: 1 },
                            },
                            raw: {
                                TAG: "BinOp",
                                left: {
                                    metaData: {
                                        end: { row: 0, col: 2 },
                                        start: { row: 0, col: 1 },
                                    },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 1,
                                    },
                                },
                                op: "Add",
                                right: {
                                    metaData: {
                                        end: { row: 0, col: 6 },
                                        start: { row: 0, col: 5 },
                                    },
                                    raw: {
                                        TAG: "IntLit",
                                        _0: 2,
                                    },
                                },
                            },
                        },
                        op: "Mul",
                        right: {
                            metaData: {
                                end: { row: 0, col: 11 },
                                start: { row: 0, col: 10 },
                            },
                            raw: {
                                TAG: "IntLit",
                                _0: 3,
                            },
                        },
                    },
                },
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });
});