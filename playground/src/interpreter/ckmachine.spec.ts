import Parser from 'web-tree-sitter';
import { parseNode } from './parseNode';
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { CKMachine } from './ckmachine';
import { ok, err } from 'neverthrow';
import { List } from 'immutable';
import { Identifier } from './expression';

const { initState, executeStep, execute } = CKMachine;
let parser: Parser;

beforeAll(
    async () => {
        await Parser.init();
        const parser1 = new Parser();
        const lamgamma = await Parser.Language.load('public/tree-sitter-lamgamma_parser.wasm');
        parser1.setLanguage(lamgamma);
        parser = parser1;
    }
)

beforeEach(
    () => {
        Identifier.reset();
    }
)

/* We assume that expressions in tests are valid */
const parse = (input: string) => parseNode((parser.parse(input)).rootNode)._unsafeUnwrap();

describe("CKMachine", () => {
    it("case 1", () => {
        const subject = initState(parse("fn x -> x"));

        const actual1 = executeStep(subject);

        expect(actual1).toEqual(ok({
            kind: "applyCont0",
            val: {
                kind: "closure",
                lambda: {
                    kind: "lambda",
                    param: { kind: "raw", "name": "x" },
                    body: { kind: "variable", ident: { kind: "raw", "name": "x" } },
                },
                renv: List.of(),
                env: List.of(),
            },
            cont: List.of(),
        }));

        const actual2 = executeStep(actual1._unsafeUnwrap());

        expect(actual2).toEqual(err(new Error("Empty continuation")));
    });

    it("case 2", () => {
        const subject = initState(parse("(fn x -> x) (fn y -> y)"));

        const actual = execute(subject);

        expect(actual.isOk()).toBeTruthy();
        expect(actual._unsafeUnwrap()).toEqual({
            kind: "closure",
            lambda: {
                kind: "lambda",
                param: { kind: "raw", name: "y" },
                body: { kind: "variable", ident: { kind: "raw", name: "y" } },
            },
            renv: List.of(),
            env: List.of({
                kind: "env",
                ident: { kind: "colored", basename: "x", id: 1 },
                val: {
                    kind: "closure",
                    lambda: {
                        kind: "lambda",
                        param: { kind: "raw", name: "y" },
                        body: { kind: "variable", ident: { kind: "raw", name: "y" } },
                    },
                    renv: List.of(),
                    env: List.of()
                }
            })
        });
    });

    it("SKK = I", () => {
        const subject = initState(parse(`
            (fn x y z -> x z (y z)) (fn p q -> p) (fn a b -> a) 0
        `));

        const actual1 = execute(subject);

        expect(actual1).toEqual(ok(
            {
                kind: "integer",
                value: 0
            }
        ));
    });

    it("case 4", () => {
        const subject = initState(parse("(1 + 2 * 3 - 4 / 2) mod 4"));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 1
            }
        ))
    });

    it("variable resolves to most closely bound value", () => {
        const subject = initState(parse(`
            (fn x -> (fn x -> x)) 1 2
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 2
            }
        ))
    });

    it("fixpoint", () => {
        const subject = initState(parse(`
            (fix f -> fn n -> if n == 0 then 1 else n * f (n - 1)) 5
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 120
            }
        ))
    });

    it("quote", () => {
        const subject = initState(parse(`
            \`{ x }
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "code",
                expr: {
                    kind: "variable",
                    ident: { kind: "raw", name: "x" }
                }
            }
        ))
    });

    it("quote and splice", () => {
        const subject = initState(parse(`
            (fn x -> \`{ ~{x} }) \`{ 1 }
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "code",
                expr: {
                    kind: "integer",
                    value: 1
                }
            }
        ))
    });

    it("run-time evaluation", () => {
        const subject = initState(parse(`
            ~0{\`{ 1 }}
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 1
            }
        ))
    });

    it("run-time evaluation with csp", () => {
        const subject = initState(parse(`
            (fn x -> ~0{\`{ x }}) 1
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 1
            }
        ))
    });

    it("specialized power function", () => {
        const subject = initState(parse(`
            ~0{(fix spow -> fn n x ->
                if n == 0 then \`{ 1 }
                else if n == 1 then x
                else
                  \`{ ~{x} * ~{spow (n - 1) x}}
            ) 5 \`{2}}
        `));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "integer",
                value: 32
            }
        ))
    });
});
