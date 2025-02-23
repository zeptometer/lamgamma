import { List } from "immutable";

export type Expression = Variable | Lambda | Application | Integer | Primitive;
export type PrimitiveOp = "add" | "sub" | "mul" | "div" | "mod";

export type Variable = {
    kind: "variable";
    name: string;
};

export type Lambda = {
    kind: "lambda";
    param: Variable;
    body: Expression;
}

export type Primitive = {
    kind: "primitive";
    op: PrimitiveOp;
    args: List<Expression>;
}

export type Application = {
    kind: "application";
    func: Expression;
    arg: Expression;
}

export type Integer = {
    kind: "integer";
    value: number;
}
