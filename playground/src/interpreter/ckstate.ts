import { List } from "immutable";
import { Variable, Lambda, Expression } from "./expression";

export type Value = Closure;

export type Closure = {
    kind: "closure";
    lambda: Lambda;
    env: List<EnvFrame>;
};

export type Frame = AppLFrame | AppRFrame | EnvFrame;
export type Cont = List<Frame>;

export type AppLFrame = {
    kind: "appL";
    arg: Expression;
};

export type AppRFrame = {
    kind: "appR";
    closure: Closure;
};

export type EnvFrame = {
    kind: "env";
    var: Variable;
    val: Value;
};

export const Cont = {
    lookup: (cont: Cont, v: Variable): Value | null => {
        const frame = cont.find((frame) => {
            return frame.kind === "env" && frame.var.name === v.name;
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
    expr: Expression;
    cont: Cont;
};

export type ApplyContState = {
    kind: "applyCont";
    val: Value;
    cont: Cont;
};