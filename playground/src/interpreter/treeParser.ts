import { Expression, Variable } from './expression';
import { SyntaxError } from './SyntaxError';
import Parser from 'web-tree-sitter';
import { err, ok, Result } from 'neverthrow';

export const parseNode = (node: Parser.SyntaxNode): Result<Expression, SyntaxError> => {
    if (node.isError) {
        return err(new SyntaxError("Syntax error", node));
    }

    if (node.isMissing) {
        return err(new SyntaxError(`Missing node: ${node.type}`, node));
    }

    if (node.type === 'source_file') {
        const expr = node.namedChild(0);
        if (expr == null) {
            return err(new SyntaxError(
                "Expected unreachable: source_file node has no children",
                node
            ));
        }
        return parseNode(expr);

    } else if (node.type === "identifier") {
        return ok({ kind: "variable", name: node.text });

    } else if (node.type === "lambda") {
        const paramsNode = node.namedChild(0);
        const bodyNode = node.namedChild(1);
        if (paramsNode == null || bodyNode == null) {
            return err(new SyntaxError(
                "Expected unreachable: params or body is missing in lambda",
                node
            ));
        }

        return Result.combine([parseParams(paramsNode), parseNode(bodyNode)]).andThen(
            ([params, body]) => ok({
                kind: "lambda" as const,
                params: params,
                body: body
            })
        );

    } else if (node.type === "application") {
        const funcNode = node.namedChild(0);
        const argNode = node.namedChild(1);
        if (funcNode == null || argNode == null) {
            return err(new SyntaxError(
                "Expected unreachable: func or arg is missing in application",
            node));
        }

        return Result.combine([parseNode(funcNode), parseNode(argNode)]).andThen(
            ([func, arg]) => {
                return ok({
                    kind: "application" as const,
                    func: func,
                    arg: arg
                })
            }
        )
    } else {
        return err(new SyntaxError(`Got unexpected node: ${node.type}`, node));
    }
}

const parseParams = (node: Parser.SyntaxNode): Result<Variable[], SyntaxError> => {
    return Result.combine(node.children.map((child) => parseIdentifier(child)));
}

const parseIdentifier = (node: Parser.SyntaxNode): Result<Variable, SyntaxError> => {
    if (node.isMissing) {
        return err(new SyntaxError(`Missing node: ${node.type}`, node));
    }

    if (node.type === "identifier") {
        return ok({ kind: "variable" as const, name: node.text });
    } else {
        return err(new SyntaxError(`Expected identifier, but got ${node.type}`, node));
    }
}
