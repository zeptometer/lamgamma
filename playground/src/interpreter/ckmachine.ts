import { Expression, Identifier } from "./expression"
import { CKState, Value, Cont, Frame, RenamingEnv } from "./ckstate";
import { Result, ok, err } from "neverthrow";
import { List } from "immutable";

const arityOps = {
    add: 2,
    sub: 2,
    mul: 2,
    div: 2,
    mod: 2,
} as const;

const performPrimitiveOp = (op: keyof typeof arityOps, args: List<Value>): Result<Value, Error> => {
    const values = args.map(arg => {
        if (arg.kind !== "integer") {
            return err(new Error(`Expected integer but got ${arg.kind}`));
        }
        return ok(arg.value);
    });

    if (values.some(v => v.isErr())) {
        return err(new Error("All arguments must be integers"));
    }

    const nums = values.map(v => v._unsafeUnwrap());
    let result: number;

    switch (op) {
        case "add": result = nums.get(0)! + nums.get(1)!; break;
        case "sub": result = nums.get(0)! - nums.get(1)!; break;
        case "mul": result = nums.get(0)! * nums.get(1)!; break;
        case "div": result = Math.floor(nums.get(0)! / nums.get(1)!); break;
        case "mod": result = nums.get(0)! % nums.get(1)!; break;
    }

    return ok({
        kind: "integer",
        value: result
    });
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
                    if (expr.args.size !== arityOps[expr.op]) {
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

                default:
                    throw new Error(`Unknown type: ${(expr as { kind: "__invalid__" }).kind}`);
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

                        case "integer": {
                            return ok({ kind: "applyCont", val: val, cont: rest });
                        }

                        default:
                            throw new Error(`Unknown type: ${(val as { kind: "__invalid__" }).kind}`);
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

                default:
                    throw new Error(`Unknown type: ${(frame as { kind: "__invalid__" }).kind}`);
            }
        }
        default:
            throw new Error(`Unknown type: ${(state as { kind: "__invalid__" }).kind}`);
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