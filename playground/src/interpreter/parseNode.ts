import { Expression, Variable } from './expression';
import { SyntaxError } from './SyntaxError';
import Parser from 'web-tree-sitter';
import { err, ok, Result } from 'neverthrow';
import { List } from 'immutable';

const stringifyPosition = (node: Parser.SyntaxNode): string => {
    const {
        startPosition: { row: sr, column: sc },
        endPosition: { row: er, column: ec }
    } = node;

    return `(${sr + 1},${sc})-(${er + 1}-${ec})`;
}

export const parseNode = (node: Parser.SyntaxNode): Result<Expression, SyntaxError> => {
    if (node.isError) {
        return err(new SyntaxError(`${stringifyPosition(node)}: Syntax error`, node));
    }

    if (node.isMissing) {
        return err(new SyntaxError(`${stringifyPosition(node)}: Missing ${node.type}`, node));
    }

    if (node.type === 'source_file') {
        const expr = node.namedChild(0);
        if (expr == null) {
            return err(new SyntaxError(
                "Expected unreachable: source_file node has no children",
                node
            ));
        }
        if (node.namedChild(1)?.isError) {
            return err(new SyntaxError(
                `${stringifyPosition(node.namedChild(1)!)}: Syntax Error`,
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
            ([params, body]) => {
                const curry = (params: Variable[], body: Expression): Expression => {
                    if (params.length === 0) {
                        return body;
                    } else {
                        return {
                            kind: "lambda",
                            param: params[0],
                            body: curry(params.slice(1), body)
                        }
                    }
                }

                return ok(curry(params, body))
            }
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

    } else if (node.type == "number") {
        if (node.text == null) {
            return err(new SyntaxError(
                "Expected unreachable: number has no text",
                node
            ));
        }

        const number = Number(node.text);
        if (isNaN(number)) {
            return err(new SyntaxError(
                `Expected unreachable: failed to parse number: ${node.text}`,
                node
            ));
        }

        return ok({
            kind: "number" as const,
            value: number
        })

    } else if (node.type == "add") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in add",
                node));
        };

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "add" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "sub") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in sub",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "sub" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "mult") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in mul",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "mul" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "div") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in div",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "div" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "mod") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in mod",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "mod" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else {
        return err(new SyntaxError(`${stringifyPosition(node)}: Got unexpected node: ${node.type}`, node));
    }
}

const parseParams = (node: Parser.SyntaxNode): Result<Variable[], SyntaxError> => {
    return Result.combine(node.children.map((child) => parseIdentifier(child)));
}

const parseIdentifier = (node: Parser.SyntaxNode): Result<Variable, SyntaxError> => {
    if (node.isMissing) {
        return err(new SyntaxError(`${stringifyPosition(node)} Missing node: ${node.type}`, node));
    }

    if (node.type === "identifier") {
        return ok({ kind: "variable" as const, name: node.text });
    } else {
        return err(new SyntaxError(`${stringifyPosition(node)}: Expected identifier, but got ${node.type}`, node));
    }
}
