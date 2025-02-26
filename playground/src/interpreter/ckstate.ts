import { List } from "immutable";
import { Lambda, Expression, PrimitiveOp, Integer, Identifier, ShortCircuitOp, Boolean, Fixpoint } from "./expression";

export type RenamingEnv = List<{ from: Identifier, to: Identifier }>;

const lookupRenamingEnv = (renv: RenamingEnv, ident: Identifier): Identifier => {
    return renv.find((r) => Identifier.eq(r.from, ident))?.to ?? ident;
}

export const RenamingEnv = { lookup: lookupRenamingEnv };

export type Value = Closure | Integer | Boolean | Code;

export type Closure = {
    kind: "closure";
    lambda: Lambda | Fixpoint;
    renv: RenamingEnv;
    env: List<EnvRF>;
};

export type Code = {
    kind: "code";
    expr: Expression;
}

export type RuntimeFrame = AppLRF | AppRRF | EnvRF | PrimRF | IfCRF | ShortCircuitRF | SpliceRF | LetRF;
export type CodeFrame = LamCF | AppLCF | AppRCF | FixCF | PrimCF | IfCCF | IfTCF | IFECF |
    ShortCircuitLCF | ShortCircuitRCF | QuoteCF | SpliceCF | LetValCF | LetBodyCF;
export type Cont = List<RuntimeFrame | CodeFrame>;

/* Runtime Frames */
export type AppLRF = {
    kind: "appL";
    arg: Expression;
    renv: RenamingEnv;
};

export type AppRRF = {
    kind: "appR";
    closure: Closure;
};

export type EnvRF = {
    kind: "env";
    ident: Identifier;
    val: Value;
};

export type PrimRF = {
    kind: "prim";
    renv: RenamingEnv;
    op: PrimitiveOp;
    done: List<Value>;
    rest: List<Expression>;
}

export type IfCRF = {
    kind: "ifC";
    renv: RenamingEnv;
    then: Expression;
    else_: Expression;
}

export type ShortCircuitRF = {
    kind: "shortCircuit";
    renv: RenamingEnv;
    op: ShortCircuitOp;
    right: Expression;
}

export type SpliceRF = {
    kind: "splice";
    shift: number;
}

export type LetRF = {
    kind: "let",
    ident: Identifier,
    renv: RenamingEnv,
    expr: Expression
}

/* Code Frames */
export type LamCF = {
    kind: "lamC",
    param: Identifier,
}

export type AppLCF = {
    kind: "appLC",
    renv: RenamingEnv,
    arg: Expression,
}

export type AppRCF = {
    kind: "appRC",
    func: Expression
}

export type FixCF = {
    kind: "fixC",
    recParam: Identifier,
    funcParam: Identifier
}

export type PrimCF = {
    kind: "primC",
    op: PrimitiveOp,
    renv: RenamingEnv,
    done: List<Expression>,
    rest: List<Expression>
}

export type IfCCF = {
    kind: "ifCC",
    renv: RenamingEnv,
    then: Expression,
    else_: Expression,
}

export type IfTCF = {
    kind: "ifTC",
    renv: RenamingEnv,
    cond: Expression,
    else_: Expression,
}

export type IFECF = {
    kind: "ifEC",
    cond: Expression,
    then: Expression,
}

export type ShortCircuitLCF = {
    kind: "shortCircuitLC",
    renv: RenamingEnv,
    op: ShortCircuitOp,
    right: Expression,
}

export type ShortCircuitRCF = {
    kind: "shortCircuitRC",
    op: ShortCircuitOp,
    left: Expression,
}

export type QuoteCF = {
    kind: "quoteC"
}

export type SpliceCF = {
    kind: "spliceC",
    shift: number
}

export type LetValCF = {
    kind: "letValC",
    ident: Identifier,
    renv: RenamingEnv,
    expr: Expression
}

export type LetBodyCF = {
    kind: "letBodyC",
    ident: Identifier,
    val: Expression
}

export const Cont = {
    lookup: (cont: Cont, ident: Identifier): Value | "NotFound" | "FutureBinding" => {
        const frame = cont.find((frame) => {
            return (frame.kind === "env" && frame.ident === ident) ||
            (frame.kind === "lamC" && frame.param === ident) ||
            (frame.kind === "fixC" && (frame.recParam === ident || frame.funcParam === ident));
        });
        if (!frame) {
            return "NotFound";
        } else if (["lamC", "fixC"].includes(frame.kind)) {
            return "FutureBinding";
        }
        return (frame as EnvRF).val;
    }
}

export type CKState = EvalState | ApplyCont0State | ApplyContFState;

export type EvalState = {
    kind: "eval";
    level: number;
    renv: RenamingEnv;
    expr: Expression;
    cont: Cont;
}

export type ApplyCont0State = {
    kind: "applyCont0";
    val: Value;
    cont: Cont;
}

export type ApplyContFState = {
    kind: "applyContF";
    level: number;
    code: Expression;
    cont: Cont;
}
