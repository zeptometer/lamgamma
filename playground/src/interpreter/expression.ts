import { List } from "immutable";

export type Identifier = RawIdentifier | GeneratedIdentifier | ColoredIdentifier
export type RawIdentifier = {
    kind: "raw";
    name: string;
}

export type GeneratedIdentifier = {
    kind: "generated";
    id: number;
}

export type ColoredIdentifier = {
    kind: "colored";
    basename: string;
    id: number;
}

const eqIdentifier = (a: Identifier, b: Identifier): boolean => {
    switch (a.kind) {
        case "raw": {
            return b.kind === "raw" && a.name === b.name;
        }
        case "generated": {
            return b.kind === "generated" && a.id === b.id;
        }
        case "colored": {
            return b.kind === "colored" && a.basename === b.basename && a.id === b.id;
        }
        default:
            return false;
    }
}

let counter = 0;

const stringifyIdentifier = (id: Identifier) => {
    switch (id.kind) {
        case "raw": {
            return id.name;
        }
        case "generated": {
            return `_${id.id}`;
        }
        case "colored": {
            return `${id.basename}_${id.id}`;
        }
        default:
            throw new Error(`Unknown type: ${(id as { kind: "__invalid__" }).kind}`);
    }
}

const color = (id: Identifier): Identifier => {
    counter++;
    switch (id.kind) {
        case "raw": {
            return {
                kind: "colored",    
                basename: id.name,
                id: counter,
            }
        }
        case "generated": {
            return {
                kind: "generated",
                id: counter,
            }
        }
        case "colored": {
            return {
                kind: "colored",
                basename: id.basename,
                id: counter,
            }
        }

        default:
            throw new Error(`Unknown type: ${(id as { kind: "__invalid__" }).kind}`);
    }
}

export type Expression = Variable | Lambda | Application | Integer | Primitive;
export type PrimitiveOp = "add" | "sub" | "mul" | "div" | "mod";

export type Variable = {
    kind: "variable";
    ident: Identifier;
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

export const Identifier = { color, stringify: stringifyIdentifier, eq: eqIdentifier };
