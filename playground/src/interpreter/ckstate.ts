import { Variable, Lambda, Expression } from "./expression";

export type Env = { var: Variable; val: Value }[];

export const Env = {
    empty: (): Env => [],
    extend: (env: Env, v: Variable, val: Value): Env => {
        return [{ var: v, val: val }, ...env];
    }
}

export type Value = Closure;;

export type Closure = {
    kind: "closure";
    lambda: Lambda;
    env: Env;
};

export type Cont = AppLCont | AppRCont | FrameCont | HaltCont;

export type AppLCont = {
    kind: "appL";
    arg: Expression;
    rest: Cont;
};

export type AppRCont = {
    kind: "appR";
    closure: Closure;
    rest: Cont;
};

export type FrameCont = {
    kind: "frame";
    var: Variable;
    val: Value;
    rest: Cont;
};

export const Cont = {
    lookup: (cont: Cont, v: Variable): Value | null => {
        switch (cont.kind) {
            case "frame":
                if (cont.var.name === v.name) {
                    return cont.val;
                } else {
                    return Cont.lookup(cont.rest, v);
                }
            case "halt":
                return null;
            case "appL":
            case "appR":
                return Cont.lookup(cont.rest, v);
            default:
                throw new Error(`Unknown type: ${(cont as { kind: "__invalid__" }).kind}`);
        }
    },
    expandEnv: (env: Env, cont: Cont): Cont => {
        var cont1 = cont;
        for (var i = env.length - 1; i >= 0; i--) {
            cont1 = { kind: "frame", var: env[i].var, val: env[i].val, rest: cont1 };
        }
        return cont1;
    }
}

export type HaltCont = {
    kind: "halt";
}

export type CKState = EvalState | ApplyContState;

export type EvalState = {
    kind: "eval";
    expr: Expression;
    cont: Cont;
};

export type ApplyContState = {
    kind: "applyCont";
    value: Value;
    cont: Cont;
};