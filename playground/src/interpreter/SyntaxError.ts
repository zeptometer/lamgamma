import Parser from 'web-tree-sitter';

export class SyntaxError extends Error {
    node: Parser.SyntaxNode;

    constructor(msg: string, node: Parser.SyntaxNode) {
        super(msg);
        this.node = node;
        this.name = 'SyntaxError';
    }
}