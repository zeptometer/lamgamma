import { Expression, Identifier, Integer, Boolean, Lambda } from "./expression"
import { CKState, Value, Cont, RuntimeFrame, RenamingEnv, CodeFrame } from "./ckstate";
import { Result, ok, err } from "neverthrow";
import { List } from "immutable";
import { unreachable } from "../common/assertNever";

const arityOps = {
    add: [2, ["integer", "integer"]],
    sub: [2, ["integer", "integer"]],
    mul: [2, ["integer", "integer"]],
    div: [2, ["integer", "integer"]],
    mod: [2, ["integer", "integer"]],
    eq: [2, ["integer", "integer"]],
    ne: [2, ["integer", "integer"]],
    lt: [2, ["integer", "integer"]],
    le: [2, ["integer", "integer"]],
    gt: [2, ["integer", "integer"]],
    ge: [2, ["integer", "integer"]],
    neg: [1, ["boolean"]],
} as const;

const performPrimitiveOp = (op: keyof typeof arityOps, args: List<Value>): Result<Value, Error> => {
    const [arity, types] = arityOps[op];
    if (args.size !== arity) {
        return err(new Error(`Arity mismatch: ${op} expects ${arity} arguments, but got ${args.size}`));
    }

    for (let i = 0; i < arity; i++) {
        if (args.get(i)!.kind !== types[i]) {
            return err(new Error(`Type mismatch: ${op} expects ${types[i]} but got ${args.get(i)!.kind}`));
        }
    }

    switch (op) {
        case "add": {
            return ok({
                kind: "integer",
                value: (args.get(0) as Integer).value + (args.get(1) as Integer).value
            });
        }

        case "sub": {
            return ok({
                kind: "integer",
                value: (args.get(0) as Integer).value - (args.get(1) as Integer).value
            });
        }

        case "mul": {
            return ok({
                kind: "integer",
                value: (args.get(0) as Integer).value * (args.get(1) as Integer).value
            });
        }

        case "div": {
            return ok({
                kind: "integer",
                value: Math.floor((args.get(0) as Integer).value / (args.get(1) as Integer).value)
            });
        }

        case "mod": {
            return ok({
                kind: "integer",
                value: (args.get(0) as Integer).value % (args.get(1) as Integer).value
            });
        }

        case "eq": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value === (args.get(1) as Integer).value
            });
        }

        case "ne": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value !== (args.get(1) as Integer).value
            });
        }

        case "lt": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value < (args.get(1) as Integer).value
            });
        }

        case "le": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value <= (args.get(1) as Integer).value
            });
        }

        case "gt": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value > (args.get(1) as Integer).value
            });
        }

        case "ge": {
            return ok({
                kind: "boolean",
                value: (args.get(0) as Integer).value >= (args.get(1) as Integer).value
            });
        }

        case "neg": {
            return ok({
                kind: "boolean",
                value: !(args.get(0) as Boolean).value
            });
        }

        default: throw unreachable(op);
    }
}

const executeStep = (state: CKState): Result<CKState, Error> => {
    switch (state.kind) {
        case "eval": {
            const { level, renv, expr, cont } = state;
            if (level == 0) {
                switch (expr.kind) {
                    case "variable": {
                        const finalIdent = RenamingEnv.lookup(renv, expr.ident);
                        if (finalIdent === null) {
                            return err(new Error(`Failed to rename identifier: ${Identifier.stringify(expr.ident)}`));
                        }
                        const val = Cont.lookup(cont, finalIdent);
                        if (val === "NotFound") {
                            return err(new Error(`Unbound variable: ${Identifier.stringify(expr.ident)}`));
                        } else if (val === "FutureBinding") {
                            return err(new Error(`The variable ${Identifier.stringify(expr.ident)} is to be bound in future stages`));
                        }

                        return ok({
                            kind: "applyCont0",
                            val: val,
                            cont: cont
                        })
                    }

                    case "lambda": {
                        return ok({
                            kind: "applyCont0",
                            val: { kind: "closure", lambda: expr, renv: renv, env: List.of() },
                            cont: cont
                        });
                    }

                    case "application": {
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            expr: expr.func,
                            cont: cont.unshift({ kind: "appL", arg: expr.arg, renv: renv })
                        });
                    }

                    case "fixpoint": {
                        if (expr.body.kind !== "lambda") {
                            return err(new Error("Fixpoint operator expects a lambda expression"));
                        }
                        return ok({
                            kind: "applyCont0",
                            val: {
                                kind: "closure",
                                lambda: expr,
                                renv: renv,
                                env: List.of()
                            },
                            cont: cont
                        });
                    }

                    case "integer": {
                        return ok({
                            kind: "applyCont0",
                            val: { kind: "integer", value: expr.value },
                            cont: cont
                        });
                    }

                    case "primitive": {
                        if (expr.args.size !== arityOps[expr.op][0]) {
                            return err(new Error(`Arity mismatch: ${expr.op} expects ${arityOps[expr.op]} arguments, but got ${expr.args.size}`));
                        }
                        if (expr.args.isEmpty()) {
                            return err(new Error("Primitive with no arguments are not allowed"));
                        }
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            // expr.args.first() is guaranteed to be non-null because we checked the size above
                            expr: expr.args.first()!,
                            cont: cont.unshift({
                                kind: "prim",
                                renv: renv,
                                op: expr.op,
                                done: List.of(),
                                rest: expr.args.rest()
                            })
                        });
                    }

                    case "boolean": {
                        return ok({
                            kind: "applyCont0",
                            val: { kind: "boolean", value: expr.value },
                            cont: cont
                        })
                    }

                    case "if": {
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            expr: expr.cond,
                            cont: cont.unshift({
                                kind: "ifC",
                                renv: renv,
                                then: expr.then,
                                else_: expr.else_
                            })
                        })
                    }

                    case "shortCircuit": {
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            expr: expr.left,
                            cont: cont.unshift({
                                kind: "shortCircuit",
                                renv: renv,
                                op: expr.op,
                                right: expr.right
                            })
                        })
                    }

                    case "quote": {
                        return ok({
                            kind: "eval",
                            level: 1,
                            renv: renv,
                            expr: expr.expr,
                            cont: cont.unshift({
                                kind: "quoteC"
                            })
                        })
                    }

                    case "splice": {
                        const { shift, expr: innerExpr } = expr;

                        if (shift < 0 || !Number.isInteger(shift)) {
                            return err(new Error(`Expected unreachable: Invalid shift value: ${shift}`));
                        }

                        if (shift > 0) {
                            return err(new Error("Splice referring to a negative stage is not allowed"));
                        }

                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            expr: innerExpr,
                            cont: cont.unshift({
                                kind: "splice",
                                shift: shift
                            })
                        })
                    }

                    case "let": {
                        const { ident, value, body } = expr;
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: renv,
                            expr: value,
                            cont: cont.unshift({
                                kind: "let",
                                ident: ident,
                                renv: renv,
                                expr: body
                            })
                        });
                    }

                    default: throw (unreachable(expr));
                }
            } else {
                switch (expr.kind) {
                    case "variable": {
                        return ok({
                            kind: "applyContF",
                            level: level,
                            code: {
                                kind: "variable",
                                ident: RenamingEnv.lookup(renv, expr.ident)
                            },
                            cont: cont
                        })
                    }

                    case "lambda": {
                        const coloredParam = Identifier.color(expr.param);
                        const newRenv = renv.unshift({ from: expr.param, to: coloredParam });
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: newRenv,
                            expr: expr.body,
                            cont: cont.unshift({ kind: "lamC", param: coloredParam })
                        });
                    }

                    case "application": {
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: expr.func,
                            cont: cont.unshift({
                                kind: "appLC",
                                renv: renv,
                                arg: expr.arg
                            })
                        });
                    }

                    case "fixpoint": {
                        if (expr.body.kind !== "lambda") {
                            return err(new Error("Fixpoint operator expects a lambda expression"));
                        }
                        const { param: recParam, body: { param: funcParam, body: funcBody } } = expr;
                        const coloredRecParam = Identifier.color(recParam);
                        const coloredFuncParam = Identifier.color(funcParam);
                        const newRenv = renv
                            .unshift({ from: recParam, to: coloredRecParam })
                            .unshift({ from: funcParam, to: coloredFuncParam });
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: newRenv,
                            expr: funcBody,
                            cont: cont.unshift({
                                kind: "fixC",
                                recParam: coloredRecParam,
                                funcParam: coloredFuncParam
                            })
                        });
                    }

                    case "integer": {
                        return ok({
                            kind: "applyContF",
                            level: level,
                            code: expr,
                            cont: cont
                        });
                    }

                    case "primitive": {
                        if (expr.args.size !== arityOps[expr.op][0]) {
                            return err(new Error(`Arity mismatch: ${expr.op} expects ${arityOps[expr.op]} arguments, but got ${expr.args.size}`));
                        }
                        if (expr.args.isEmpty()) {
                            return err(new Error("Primitive with no arguments are not allowed"));
                        }
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: expr.args.first()!,
                            cont: cont.unshift({
                                kind: "primC",
                                op: expr.op,
                                renv: renv,
                                done: List.of(),
                                rest: expr.args.shift()
                            })
                        });
                    }

                    case "boolean": {
                        return ok({
                            kind: "applyContF",
                            level: level,
                            code: expr,
                            cont: cont
                        })
                    }

                    case "if": {
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: expr.cond,
                            cont: cont.unshift({
                                kind: "ifCC",
                                renv: renv,
                                then: expr.then,
                                else_: expr.else_
                            })
                        })
                    }

                    case "shortCircuit": {
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: expr.left,
                            cont: cont.unshift({
                                kind: "shortCircuitLC",
                                renv: renv,
                                op: expr.op,
                                right: expr.right
                            })
                        })
                    }

                    case "quote": {
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: expr.expr,
                            cont: cont.unshift({
                                kind: "quoteC"
                            })
                        })
                    }

                    case "splice": {
                        const { shift, expr: innerExpr } = expr;

                        if (shift < 0 || !Number.isInteger(shift)) {
                            return err(new Error(`Expected unreachable: Invalid shift value: ${shift}`));
                        }

                        if (shift > level) {
                            return err(new Error("Splice referring to a negative stage is not allowed"));
                        }

                        return ok({
                            kind: "eval",
                            level: level - shift,
                            renv: renv,
                            expr: innerExpr,
                            cont: cont.unshift({
                                kind: (level === shift) ? "splice" : "spliceC",
                                shift: shift
                            })
                        })
                    }

                    case "let": {
                        const { ident, value, body } = expr;

                        const renamed = Identifier.color(ident);
                        const newRenv = renv.unshift({ from: ident, to: renamed });

                        return ok({
                            kind: "eval",
                            level: level,
                            renv: renv,
                            expr: value,
                            cont: cont.unshift({
                                kind: "letValC",
                                ident: renamed,
                                renv: newRenv,
                                expr: body
                            })
                        });
                    }

                    default: throw (unreachable(expr));
                }
            }
        }
        case "applyCont0": {
            const { val, cont } = state;
            if (cont.isEmpty()) {
                return err(new Error("Empty continuation"));
            }

            // We expect cont.first() to be RuntimeFrame because applyCont0's level is 0
            const frame = cont.first() as RuntimeFrame;
            const rest = cont.shift();

            switch (frame.kind) {
                case "appL": {
                    if (val.kind !== "closure") {
                        return err(new Error("Expected a closure, but got a non-closure"));
                    }
                    return ok({
                        kind: "eval",
                        level: 0,
                        renv: frame.renv,
                        expr: frame.arg,
                        cont: rest.unshift({ kind: "appR", closure: val })
                    });
                }

                case "appR": {
                    const { closure: { lambda, renv, env } } = frame;

                    switch (lambda.kind) {
                        case "lambda": {
                            const { param, body } = lambda;

                            const renamedParam = Identifier.color(param);
                            const newRenv = renv.unshift({ from: param, to: renamedParam });
                            return ok({
                                kind: "eval",
                                level: 0,
                                renv: newRenv,
                                expr: body,
                                cont: env
                                    .push({ kind: "env", ident: renamedParam, val: val })
                                    .concat(rest)
                            });
                        }

                        case "fixpoint": {
                            const { param: recParam, body: recBody } = lambda;
                            // We know that recBody is a lambda because we checked it in the eval state
                            const { param: funcParam, body: funcBody } = recBody as Lambda;

                            const renamedRecParam = Identifier.color(recParam);
                            const renamedFuncParam = Identifier.color(funcParam);
                            const newRenv = renv
                                .unshift({ from: recParam, to: renamedRecParam })
                                .unshift({ from: funcParam, to: renamedFuncParam });
                            const self = frame.closure;

                            return ok({
                                kind: "eval",
                                level: 0,
                                renv: newRenv,
                                expr: funcBody,
                                cont: env
                                    .push({ kind: "env", ident: renamedFuncParam, val: val })
                                    .push({ kind: "env", ident: renamedRecParam, val: self })
                                    .concat(rest)
                            });
                        }

                        default: throw unreachable(lambda);
                    }
                }

                case "env": {
                    switch (val.kind) {
                        case "closure": {
                            const { lambda, renv, env } = val;
                            const clos = {
                                kind: "closure" as const,
                                renv: renv,
                                env: env.push(frame),
                                lambda: lambda
                            };
                            return ok({ kind: "applyCont0", val: clos, cont: rest });
                        }

                        case "integer":
                        case "boolean": {
                            return ok({ kind: "applyCont0", val: val, cont: rest });
                        }

                        case "code": {
                            if (Expression.hasFreeVariable(val.expr, frame.ident)) {
                                return err(new Error(`Scope extrusion: ${JSON.stringify(frame.ident)}`));
                            }
                            return ok({
                                kind: "applyCont0",
                                val: val,
                                cont: rest
                            })
                        }

                        default:
                            throw unreachable(val);
                    }
                }

                case "prim": {
                    if (frame.rest.isEmpty()) {
                        return performPrimitiveOp(frame.op, frame.done.push(val))
                            .map(val => ({
                                kind: "applyCont0",
                                val: val,
                                cont: rest
                            }));
                    } else {
                        return ok({
                            kind: "eval",
                            level: 0,
                            renv: frame.renv,
                            expr: frame.rest.first()!,
                            cont: rest.unshift({
                                kind: "prim",
                                renv: frame.renv,
                                op: frame.op,
                                done: frame.done.push(val),
                                rest: frame.rest.rest()
                            })
                        });
                    }
                }

                case "ifC": {
                    if (val.kind !== "boolean") {
                        return err(new Error("Expected a boolean, but got a non-boolean"));
                    }
                    return ok({
                        kind: "eval",
                        level: 0,
                        renv: frame.renv,
                        expr: val.value ? frame.then : frame.else_,
                        cont: rest
                    });
                }

                case "shortCircuit": {
                    if (val.kind !== "boolean") {
                        return err(new Error("Expected a boolean, but got a non-boolean"));
                    }
                    const op = frame.op;
                    switch (op) {
                        case "and": {
                            if (val.value) {
                                return ok({
                                    kind: "eval",
                                    level: 0,
                                    renv: frame.renv,
                                    expr: frame.right,
                                    cont: rest
                                });
                            } else {
                                return ok({
                                    kind: "applyCont0",
                                    val: { kind: "boolean", value: false },
                                    cont: rest
                                });
                            }
                        }

                        case "or": {
                            if (val.value) {
                                return ok({
                                    kind: "applyCont0",
                                    val: { kind: "boolean", value: true },
                                    cont: rest
                                });
                            } else {
                                return ok({
                                    kind: "eval",
                                    level: 0,
                                    renv: frame.renv,
                                    expr: frame.right,
                                    cont: rest
                                });
                            }
                        }

                        default:
                            throw unreachable(op);
                    }
                }

                case "splice": {
                    if (val.kind !== "code") {
                        return err(new Error(`Expected a code fragment, but got ${val.kind}`));
                    }

                    if (frame.shift === 0) {
                        return ok({
                            kind: "eval",
                            level: 0,
                            // renv can be empty because identifiers in val
                            // are already renamed
                            renv: List.of(),
                            expr: val.expr,
                            cont: rest
                        });
                    } else {
                        return ok({
                            kind: "applyContF",
                            level: frame.shift,
                            code: val.expr,
                            cont: rest
                        })
                    }
                }

                case "let": {
                    const { ident, renv, expr } = frame;

                    const renamed = Identifier.color(ident);
                    const newRenv = renv.unshift({ from: ident, to: renamed });

                    return ok({
                        kind: "eval",
                        level: 0,
                        renv: newRenv,
                        expr: expr,
                        cont: rest.unshift({
                            kind: "env",
                            ident: renamed,
                            val: val
                        })
                    });
                }

                default:
                    throw unreachable(frame);
            }
        }

        case "applyContF": {
            const { level, code, cont } = state;
            if (cont.isEmpty()) {
                return err(new Error("Empty continuation"));
            } else if (level <= 0) {
                return err(new Error("Level should be more than 0 in applyContF"));
            }

            // We expect cont.first() to be CodeFrame because applyContF requires level > 0
            const frame = cont.first() as CodeFrame;
            const rest = cont.shift();

            switch (frame.kind) {
                case "lamC":
                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            kind: "lambda",
                            param: frame.param,
                            body: code
                        },
                        cont: rest
                    });

                case "appLC":
                    return ok({
                        kind: "eval",
                        level: level,
                        renv: frame.renv,
                        expr: frame.arg,
                        cont: rest.unshift({
                            kind: "appRC",
                            func: code
                        })
                    });

                case "appRC":
                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            kind: "application",
                            func: frame.func,
                            arg: code
                        },
                        cont: rest
                    });

                case "fixC":
                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            kind: "fixpoint",
                            param: frame.recParam,
                            body: {
                                kind: "lambda",
                                param: frame.funcParam,
                                body: code
                            }
                        },
                        cont: rest
                    });

                case "primC":
                    if (frame.rest.isEmpty()) {
                        return ok({
                            kind: "applyContF",
                            level: level,
                            code: {
                                kind: "primitive",
                                op: frame.op,
                                args: frame.done.push(code)
                            },
                            cont: rest
                        })
                    } else {
                        return ok({
                            kind: "eval",
                            level: level,
                            renv: frame.renv,
                            expr: frame.rest.first()!,
                            cont: rest.unshift({
                                kind: "primC",
                                renv: frame.renv,
                                op: frame.op,
                                done: frame.done.push(code),
                                rest: frame.rest.rest()
                            })
                        });
                    }

                case "ifCC":
                    return ok({
                        kind: "eval",
                        level: level,
                        renv: frame.renv,
                        expr: frame.then,
                        cont: rest.unshift({
                            kind: "ifTC",
                            renv: frame.renv,
                            cond: code,
                            else_: frame.else_
                        })
                    })

                case "ifTC":
                    return ok({
                        kind: "eval",
                        level: level,
                        renv: frame.renv,
                        expr: frame.else_,
                        cont: rest.unshift({
                            kind: "ifEC",
                            cond: frame.cond,
                            then: code
                        })
                    })

                case "ifEC":
                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            kind: "if",
                            cond: frame.cond,
                            then: frame.then,
                            else_: code
                        },
                        cont: rest
                    })

                case "shortCircuitLC":
                    return ok({
                        kind: "eval",
                        level: level,
                        renv: frame.renv,
                        expr: frame.right,
                        cont: rest.unshift({
                            kind: "shortCircuitRC",
                            op: frame.op,
                            left: code
                        })
                    })

                case "shortCircuitRC":
                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            kind: "shortCircuit",
                            op: frame.op,
                            left: frame.left,
                            right: code
                        },
                        cont: rest
                    })

                case "quoteC":
                    if (level === 1) {
                        return ok({
                            kind: "applyCont0",
                            val: {
                                kind: "code",
                                expr: code
                            },
                            cont: rest
                        })
                    } else {
                        return ok({
                            kind: "applyContF",
                            level: level - 1,
                            code: {
                                kind: "quote",
                                expr: code
                            },
                            cont: rest
                        })
                    }

                case "spliceC":
                    if (level <= frame.shift) {
                        return err(new Error("Invalid shift in SpliceCF"));
                    }

                    return ok({
                        kind: "applyContF",
                        level: level - frame.shift,
                        code: {
                            kind: "splice",
                            shift: frame.shift,
                            expr: code,
                        },
                        cont: rest
                    })

                case "letValC": {
                    const { ident, renv, expr } = frame;

                    return ok({
                        kind: "eval",
                        level: level,
                        renv: renv,
                        expr: expr,
                        cont: rest.unshift({
                            kind: "letBodyC",
                            ident: ident,
                            val: code
                        })
                    });
                }

                case "letBodyC": {
                    const { ident, val } = frame;

                    return ok({
                        kind: "applyContF",
                        level: level,
                        code: {
                            "kind": "let",
                            "ident": ident,
                            "value": val,
                            "body": code
                        },
                        cont: rest
                    });
                }

                default: throw unreachable(frame)
            }
        }

        default:
            throw unreachable(state);
    }
}

const execute = (state: CKState): Result<Value, Error> => {
    let nextState = state;
    while (true) {
        if (nextState.kind === "applyCont0" && nextState.cont.isEmpty()) {
            return ok(nextState.val);
        }

        const nextStateResult = executeStep(nextState);

        if (nextStateResult.isErr()) {
            return err(nextStateResult.error);
        }
        nextState = nextStateResult.value;
    }
}

const initState = (expr: Expression): CKState => {
    return {
        kind: "eval",
        level: 0,
        renv: List.of(),
        expr: expr,
        cont: List.of()
    };
}

const stateLevel = (state: CKState): number => {
    switch (state.kind) {
        case "eval":
            return state.level;
        case "applyCont0":
            return 0;
        case "applyContF":
            return state.level;
    }
}

export const CKMachine = {
    initState,
    execute,
    executeStep,
    stateLevel,
}