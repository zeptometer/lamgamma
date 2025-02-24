import { Expression, Identifier, Integer, Boolean } from "./expression"
import { CKState, Value, Cont, Frame, RenamingEnv } from "./ckstate";
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
            const { expr, cont } = state;
            switch (expr.kind) {
                case "variable": {
                    const finalIdent = RenamingEnv.lookup(state.renv, expr.ident);
                    if (finalIdent === null) {
                        return err(new Error(`Failed to rename identifier: ${Identifier.stringify(expr.ident)}`));
                    }
                    const val = Cont.lookup(cont, finalIdent);
                    if (val === null) {
                        return err(new Error(`Unbound variable: ${Identifier.stringify(expr.ident)}`));
                    }
                    return ok({
                        kind: "applyCont",
                        val: val,
                        cont: cont
                    })
                }

                case "lambda": {
                    return ok({
                        kind: "applyCont",
                        val: { kind: "closure", lambda: expr, renv: state.renv, env: List.of() },
                        cont: cont
                    });
                }

                case "application": {
                    return ok({
                        kind: "eval",
                        renv: state.renv,
                        expr: expr.func,
                        cont: cont.unshift({ kind: "appL", arg: expr.arg, renv: state.renv })
                    });
                }

                case "integer": {
                    return ok({
                        kind: "applyCont",
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
                        renv: state.renv,
                        // expr.args.first() is guaranteed to be non-null because we checked the size above
                        expr: expr.args.first()!,
                        cont: cont.unshift({
                            kind: "prim",
                            renv: state.renv,
                            op: expr.op,
                            done: List.of(),
                            rest: expr.args.rest()
                        })
                    });
                }

                case "boolean": {
                    return ok({
                        kind: "applyCont",
                        val: { kind: "boolean", value: expr.value },
                        cont: cont
                    })
                }

                case "if": {
                    return ok({
                        kind: "eval",
                        renv: state.renv,
                        expr: expr.cond,
                        cont: cont.unshift({
                            kind: "ifC",
                            renv: state.renv,
                            then: expr.then,
                            else_: expr.else_
                        })
                    })
                }

                case "shortCircuit": {
                    return ok({
                        kind: "eval",
                        renv: state.renv,
                        expr: expr.left,
                        cont: cont.unshift({
                            kind: "shortCircuit",
                            renv: state.renv,
                            op: expr.op,
                            right: expr.right
                        })
                    })
                }

                default: throw (unreachable(expr));
            }
        }
        case "applyCont": {
            const { val, cont } = state;
            if (cont.isEmpty()) {
                return err(new Error("Empty continuation"));
            }

            const frame = cont.first() as Frame;
            const rest = cont.shift();

            switch (frame.kind) {
                case "appL": {
                    if (val.kind !== "closure") {
                        return err(new Error("Expected a closure, but got a non-closure"));
                    }
                    return ok({
                        kind: "eval",
                        renv: frame.renv,
                        expr: frame.arg,
                        cont: rest.unshift({ kind: "appR", closure: val })
                    });
                }

                case "appR": {
                    const { closure: { lambda: { body, param }, renv, env } } = frame;
                    const renamedParam = Identifier.color(param.ident);
                    const newRenv = renv.push({ from: param.ident, to: renamedParam });
                    return ok({
                        kind: "eval",
                        renv: newRenv,
                        expr: body,
                        cont: env
                            .push({ kind: "env", ident: renamedParam, val: val })
                            .concat(rest)
                    });
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
                            return ok({ kind: "applyCont", val: clos, cont: rest });
                        }

                        case "integer":
                        case "boolean": {
                            return ok({ kind: "applyCont", val: val, cont: rest });
                        }

                        default:
                            throw unreachable(val);
                    }
                }

                case "prim": {
                    if (frame.rest.isEmpty()) {
                        return performPrimitiveOp(frame.op, frame.done.push(val))
                            .map(val => ({
                                kind: "applyCont",
                                val: val,
                                cont: rest
                            }));
                    } else {
                        return ok({
                            kind: "eval",
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
                                    renv: frame.renv,
                                    expr: frame.right,
                                    cont: rest
                                });
                            } else {
                                return ok({
                                    kind: "applyCont",
                                    val: { kind: "boolean", value: false },
                                    cont: rest
                                });
                            }
                        }

                        case "or": {
                            if (val.value) {
                                return ok({
                                    kind: "applyCont",
                                    val: { kind: "boolean", value: true },
                                    cont: rest
                                });
                            } else {
                                return ok({
                                    kind: "eval",
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

                default:
                    throw unreachable(frame);
            }
        }
        default:
            throw unreachable(state);
    }
}

const execute = (state: CKState): Result<Value, Error> => {
    let nextState = state;
    while (true) {
        if (nextState.kind === "applyCont" && nextState.cont.isEmpty()) {
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
        renv: List.of(),
        expr: expr,
        cont: List.of()
    };
}

export const CKMachine = {
    initState,
    execute,
    executeStep,
}