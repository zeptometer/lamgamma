import { Expression, Identifier } from './expression';
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
        return ok({ kind: "variable", ident: {
            kind: "raw",
            name: node.text,
        } });

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
                const curry = (params: Identifier[], body: Expression): Expression => {
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

    } else if (node.type == "fixpoint") {
        const nameNode = node.namedChild(0);
        const bodyNode = node.namedChild(1);
        if (nameNode == null || bodyNode == null) {
            return err(new SyntaxError(
                "Expected unreachable: name or body is missing in fixpoint",
                node
            ));
        }

        return Result.combine([parseIdentifier(nameNode), parseNode(bodyNode)]).andThen(
            ([ident, body]) => {
                return ok({
                    kind: "fixpoint" as const,
                    ident: ident,
                    body: body
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
            kind: "integer" as const,
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

    } else if (node.type == "boolean") {
        if (node.text == "true") {
            return ok({
                kind: "boolean" as const,
                value: true
            })
        } else if (node.text == "false") {
            return ok({
                kind: "boolean" as const,
                value: false
            })
        } else {
            return err(new SyntaxError(`${stringifyPosition(node)}: Expected unreachable: "${node.text}" is not a boolean`, node));
        }

    } else if (node.type == "ctrl_if") {
        const condNode = node.namedChild(0);
        const thenNode = node.namedChild(1);
        const elseNode = node.namedChild(2);
        if (condNode == null || thenNode == null || elseNode == null) {
            return err(new SyntaxError(
                "Expected unreachable: cond or then or else is missing in ctrl_if",
                node));
        }

        return Result.combine([parseNode(condNode), parseNode(thenNode), parseNode(elseNode)]).andThen(
            ([cond, then, else_]) => {
                return ok({
                    kind: "if" as const,
                    cond: cond,
                    then: then,
                    else_: else_
                })
            }
        )

    } else if (node.type == "eq") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in eq",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "eq" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "ne") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in ne",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "ne" as const,
                    args: List.of(left, right)
                })
            }
        )
    } else if (node.type == "lt") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in lt",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "lt" as const,
                    args: List.of(left, right)
                })
            }
        )

    } else if (node.type == "le") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in le",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "le" as const,
                    args: List.of(left, right)
                })
            }
        )
    } else if (node.type == "gt") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in gt",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "gt" as const,
                    args: List.of(left, right)
                })
            }
        )
    } else if (node.type == "ge") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in ge",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "primitive" as const,
                    op: "ge" as const,
                    args: List.of(left, right)
                })
            }
        )
    } else if (node.type == "and") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in and",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "shortCircuit" as const,
                    op: "and" as const,
                    left: left,
                    right: right
                })
            }
        )

    } else if (node.type == "or") {
        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (left == null || right == null) {
            return err(new SyntaxError(
                "Expected unreachable: left or right is missing in or",
                node));
        }

        return Result.combine([parseNode(left), parseNode(right)]).andThen(
            ([left, right]) => {
                return ok({
                    kind: "shortCircuit" as const,
                    op: "or" as const,
                    left: left,
                    right: right
                })
            }
        )

    } else if (node.type == "neg") {
        const expr = node.namedChild(0);
        if (expr == null) {
            return err(new SyntaxError(
                "Expected unreachable: expr is missing in neg",
                node));
        }

        return parseNode(expr).map((expr) => {
            return {
                kind: "primitive" as const,
                op: "neg" as const,
                args: List.of(expr)
            }
        })

    } else {
        return err(new SyntaxError(`${stringifyPosition(node)}: Got unexpected node: ${node.type}`, node));
    }
}

const parseParams = (node: Parser.SyntaxNode): Result<Identifier[], SyntaxError> => {
    return Result.combine(node.children.map((child) => parseIdentifier(child)));
}

const parseIdentifier = (node: Parser.SyntaxNode): Result<Identifier, SyntaxError> => {
    if (node.isMissing) {
        return err(new SyntaxError(`${stringifyPosition(node)}: Missing ${node.type}`, node));
    }

    if (node.type === "identifier") {
        return ok({ kind: "raw", name: node.text });
    } else {
        return err(new SyntaxError(`${stringifyPosition(node)}: Expected identifier, but got ${node.type}`, node));
    }
}
