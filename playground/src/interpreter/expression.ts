export type Expression = Variable | Lambda | Application;

export type Variable = {
    kind: "variable";
    name: string;
};

export type Lambda = {
    kind: "lambda";
    param: Variable;
    body: Expression;
}

export type Application = {
    kind: "application";
    func: Expression;
    arg: Expression;
}
