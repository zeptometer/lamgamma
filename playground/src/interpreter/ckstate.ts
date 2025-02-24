import { List } from "immutable";
import { Lambda, Expression, PrimitiveOp, Integer, Identifier, ShortCircuitOp, Boolean } from "./expression";

export type RenamingEnv = List<{ from: Identifier, to: Identifier }>;

const lookupRenamingEnv = (renv: RenamingEnv, ident: Identifier): Identifier | null => {
    return renv.find((r) => Identifier.eq(r.from, ident))?.to ?? null;
}

export const RenamingEnv = { lookup: lookupRenamingEnv };

export type Value = Closure | Integer | Boolean;

export type Closure = {
    kind: "closure";
    lambda: Lambda;
    renv: RenamingEnv;
    env: List<EnvFrame>;
};

export type Frame = AppLFrame | AppRFrame | EnvFrame | PrimFrame | IfCFrame | ShortCircuitFrame;
export type Cont = List<Frame>;

export type AppLFrame = {
    kind: "appL";
    arg: Expression;
    renv: RenamingEnv;
};

export type AppRFrame = {
    kind: "appR";
    closure: Closure;
};

export type EnvFrame = {
    kind: "env";
    ident: Identifier;
    val: Value;
};

export type PrimFrame = {
    kind: "prim";
    renv: RenamingEnv;
    op: PrimitiveOp;
    done: List<Value>;
    rest: List<Expression>;
}

export type IfCFrame = {
    kind: "ifC";
    renv: RenamingEnv;
    then: Expression;
    else_: Expression;
}

export type ShortCircuitFrame = {
    kind: "shortCircuit";
    renv: RenamingEnv;
    op: ShortCircuitOp;
    right: Expression;
}

export const Cont = {
    lookup: (cont: Cont, ident: Identifier): Value | null => {
        const frame = cont.find((frame) => {
            return frame.kind === "env" && frame.ident === ident;
        });
        if (frame === null) {
            return null;
        }
        return (frame as EnvFrame).val;
    }
}

export type CKState = EvalState | ApplyContState;

export type EvalState = {
    kind: "eval";
    renv: RenamingEnv;
    expr: Expression;
    cont: Cont;
};

export type ApplyContState = {
    kind: "applyCont";
    val: Value;
    cont: Cont;
};