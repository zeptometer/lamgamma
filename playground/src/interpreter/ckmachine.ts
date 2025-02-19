import { Expression } from "./expression"
import { CKState, Cont, Env } from "./ckstate";
import { Result, ok, err } from "neverthrow";

const executeStep = (state: CKState): Result<CKState, Error> => {
    switch (state.kind) {
        case "eval": {
            const { expr, cont } = state;
            switch (expr.kind) {
                case "variable": {
                    const value = Cont.lookup(cont, expr);
                    if (value === null) {
                        return err(new Error(`Unbound variable: ${expr.name}`));
                    }
                    return ok({
                        kind: "applyCont",
                        value: value,
                        cont: cont
                    })
                }

                case "lambda": {
                    return ok({
                        kind: "applyCont",
                        value: { kind: "closure", lambda: expr, env: Env.empty() },
                        cont: cont
                    });
                }

                case "application": {
                    return ok({
                        kind: "eval",
                        expr: expr.func,
                        cont: { kind: "appL", arg: expr.arg, rest: cont }
                    });
                }

                default:
                    throw new Error(`Unknown type: ${(expr as { kind: "__invalid__" }).kind}`);
            }
        }
        case "applyCont": {
            const { value, cont } = state;
            switch (cont.kind) {
                case "appL": {
                    return ok({
                        kind: "eval",
                        expr: cont.arg,
                        cont: { kind: "appR", closure: value, rest: cont.rest }
                    });
                }

                case "appR": {
                    const { closure, rest } = cont;
                    return ok({
                        kind: "eval",
                        expr: closure.lambda.body,
                        cont: {
                            kind: "frame",
                            var: closure.lambda.params[0],
                            val: value,
                            rest: Cont.expandEnv(closure.env, rest)
                        }
                    });
                }

                case "frame": {
                    const { var: x, val, rest } = cont;
                    const { lambda, env } = value;
                    return ok({
                        kind: "applyCont",
                        value: { kind: "closure", lambda: lambda, env: Env.extend(env, x, val) },
                        cont: rest
                    });
                }

                case "halt": {
                    return err(new Error("Evaluation has halted"));
                }

                default:
                    throw new Error(`Unknown type: ${(cont as { kind: "__invalid__" }).kind}`);
            }
        }
        default:
            throw new Error(`Unknown type: ${(state as { kind: "__invalid__" }).kind}`);
    }
}

const execute = (state: CKState): Result<CKState, Error> => {
    let nextState = state;
    while (true) {
        if (nextState.kind === "applyCont" && nextState.cont.kind === "halt") {
            break;
        }
        const nextStateResult = executeStep(nextState);
        if (nextStateResult.isErr()) {
            return err(nextStateResult.error);
        }
        nextState = nextStateResult.value;
    }
    return ok(nextState);
}

const initState = (expr: Expression): CKState => {
    return {
        kind: "eval",
        expr: expr,
        cont: { kind: "halt" }
    };
}

export const CKMachine = {
    initState,
    execute,
    executeStep,
}