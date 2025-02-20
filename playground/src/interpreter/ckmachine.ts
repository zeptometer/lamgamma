import { Expression } from "./expression"
import { CKState, Value, Cont, Frame } from "./ckstate";
import { Result, ok, err } from "neverthrow";
import { List } from "immutable";

const executeStep = (state: CKState): Result<CKState, Error> => {
    switch (state.kind) {
        case "eval": {
            const { expr, cont } = state;
            switch (expr.kind) {
                case "variable": {
                    const val = Cont.lookup(cont, expr);
                    if (val === null) {
                        return err(new Error(`Unbound variable: ${expr.name}`));
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
                        val: { kind: "closure", lambda: expr, env: List.of() },
                        cont: cont
                    });
                }

                case "application": {
                    return ok({
                        kind: "eval",
                        expr: expr.func,
                        cont: cont.unshift({ kind: "appL", arg: expr.arg })
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
                    return ok({
                        kind: "eval",
                        expr: frame.arg,
                        cont: rest.unshift({ kind: "appR", closure: val })
                    });
                }

                case "appR": {
                    const { closure: { lambda: { body, param }, env } } = frame;
                    return ok({
                        kind: "eval",
                        expr: body,
                        cont: env
                            .push({ kind: "frame", var: param, val: val })
                            .concat(rest)
                    });
                }

                case "frame": {
                    const { lambda, env } = val;
                    const clos = { kind: "closure" as const, lambda: lambda, env: env.push(frame) };
                    return ok({ kind: "applyCont", val: clos, cont: rest });
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
        expr: expr,
        cont: List.of()
    };
}

export const CKMachine = {
    initState,
    execute,
    executeStep,
}