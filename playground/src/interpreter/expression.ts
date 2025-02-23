import { List } from "immutable";

export type Expression = Variable | Lambda | Application | Number | Primitive;
export type BinOp = "add" | "sub" | "mul" | "div" | "mod";

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
    op: BinOp;
    args: List<Expression>;
}

export type Application = {
    kind: "application";
    func: Expression;
    arg: Expression;
}

export type Number = {
    kind: "number";
    value: number;
}
