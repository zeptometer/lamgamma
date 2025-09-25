import { expect, it, beforeAll, describe } from 'vitest';
import { Parser, Language } from 'web-tree-sitter';
import { parseSyntaxNode } from './SyntaxNodeParser.res.mjs';

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
                _0: { TAG: "IntLit", _0: 0 }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse literal', () => {
            const input = '12321';
            const expectedOutput = {
                TAG: "Ok",
                _0: { TAG: "IntLit", _0: 12321 }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        /* This should be fixed */
        it('parse 0-headed literal', () => {
            const input = '00001';
            const expectedOutput = {
                TAG: "Ok",
                _0: { TAG: "IntLit", _0: 1 }
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
                _0: { TAG: "BoolLit", _0: true }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse false', () => {
            const input = 'false';
            const expectedOutput = {
                TAG: "Ok",
                _0: { TAG: "BoolLit", _0: false }
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
                    TAG: "BinOp",
                    op: "Add",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse subtraction', () => {
            const input = '1 - 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Sub",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse multiplication', () => {
            const input = '1 * 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Mul",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse division', () => {
            const input = '1 / 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Div",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse modulus', () => {
            const input = '5 mod 2';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Mod",
                    left: { TAG: "IntLit", _0: 5 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse complex expression', () => {
            const input = '1 + 2 * 3 - 4 / 5';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Sub",
                    left: {
                        TAG: "BinOp",
                        op: "Add",
                        left: { TAG: "IntLit", _0: 1 },
                        right: {
                            TAG: "BinOp",
                            op: "Mul",
                            left: { TAG: "IntLit", _0: 2 },
                            right: { TAG: "IntLit", _0: 3 }
                        }
                    },
                    right: {
                        TAG: "BinOp",
                        op: "Div",
                        left: { TAG: "IntLit", _0: 4 },
                        right: { TAG: "IntLit", _0: 5 }
                    }
                }
            };
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
                    TAG: "BinOp",
                    op: "Eq",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
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
                    TAG: "BinOp",
                    op: "Ne",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
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
                    TAG: "BinOp",
                    op: "Lt",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
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
                    TAG: "BinOp",
                    op: "Le",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
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
                    TAG: "BinOp",
                    op: "Gt",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
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
                    TAG: "BinOp",
                    op: "Ge",
                    left: { TAG: "IntLit", _0: 1 },
                    right: { TAG: "IntLit", _0: 2 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });

        it('parse complex expression', () => {
            const input = '1 + 2 * 3 == 4 - 5 / 6';
            const expectedOutput = {
                TAG: "Ok",
                _0: {
                    TAG: "BinOp",
                    op: "Eq",
                    left: {
                        TAG: "BinOp",
                        op: "Add",
                        left: { TAG: "IntLit", _0: 1 },
                        right: {
                            TAG: "BinOp",
                            op: "Mul",
                            left: { TAG: "IntLit", _0: 2 },
                            right: { TAG: "IntLit", _0: 3 }
                        }
                    },
                    right: {
                        TAG: "BinOp",
                        op: "Sub",
                        left: { TAG: "IntLit", _0: 4 },
                        right: {
                            TAG: "BinOp",
                            op: "Div",
                            left: { TAG: "IntLit", _0: 5 },
                            right: { TAG: "IntLit", _0: 6 }
                        }
                    }
                }
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
                    TAG: "BinOp",
                    op: "Mul",
                    left: {
                        TAG: "BinOp",
                        op: "Add",
                        left: { TAG: "IntLit", _0: 1 },
                        right: { TAG: "IntLit", _0: 2 }
                    },
                    right: { TAG: "IntLit", _0: 3 }
                }
            };
            expect(parseSyntaxNode((parser.parse(input)).rootNode))
                .toEqual(expectedOutput);
        });
    });
});