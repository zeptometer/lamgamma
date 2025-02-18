import { Expression, Variable } from './expression';
import Parser from 'web-tree-sitter';

export const parseTree = (tree: Parser.SyntaxNode): Expression | null => {
    if (tree.type === 'source_file') {
        const expr = tree.namedChild(0);
        if (expr == null) {
            return null;
        }
        return parseTree(expr);

    } else if (tree.type === 'identifier') {
        return { kind: 'variable', name: tree.text };

    } else if (tree.type === 'lambda') {
        const paramTree = tree.namedChild(0);
        const bodyTree = tree.namedChild(1);
        if (paramTree == null || bodyTree == null) {
            return null;
        }
        const paramsOrNull = parseParams(paramTree);
        const bodyOrNull = parseTree(bodyTree);
        if (paramsOrNull === null || bodyOrNull === null) {
            return null;
        }

        return {
            kind: 'lambda',
            params: paramsOrNull,
            body: bodyOrNull
        };

    } else if (tree.type === 'application') {
        const funcTree = tree.namedChild(0);
        const argTree = tree.namedChild(1);
        if (funcTree == null || argTree == null) {
            return null;
        } 
        const funcOrNull = parseTree(funcTree);
        const argOrNull = parseTree(argTree);
        if (funcOrNull === null || argOrNull === null) {
            return null;
        }

        return {
            kind: 'application',
            func: funcOrNull,
            arg: argOrNull
        };
    } else {
        return null;
    }
}

const parseParams = (node: Parser.SyntaxNode): Variable[] | null => {
    let preprarams = node.children.map((child) => parseIdentifier(child) );

    preprarams.forEach((paramOrNull) => {
        if (paramOrNull === null) {
            return null;
        }
    });

    return preprarams as Variable[];
}

const parseIdentifier = (node: Parser.SyntaxNode): Variable | null => {
    if (node.type === 'identifier') {
        return { kind: 'variable', name: node.text };
    } else {
        return null;
    }
}
