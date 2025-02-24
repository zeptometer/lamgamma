import Parser from 'web-tree-sitter';
import { parseNode } from './parseNode';
import { describe, it, expect, beforeAll } from "vitest";
import { CKMachine } from './ckmachine';
import { ok, err } from 'neverthrow';
import { List } from 'immutable';
import { Closure } from './ckstate';

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

/* We assume that expressions in tests are valid */
const parse = (input: string) => parseNode((parser.parse(input)).rootNode)._unsafeUnwrap();

describe("CKMachine", () => {
    it("case 1", () => {
        const subject = initState(parse("fn x -> x"));

        const actual1 = executeStep(subject);

        expect(actual1).toEqual(ok({
            kind: "applyCont",
            val: {
                kind: "closure",
                lambda: {
                    kind: "lambda",
                    param: { kind: "variable", name: "x" },
                    body: { kind: "variable", name: "x" },
                },
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
                param: { kind: "variable", name: "y" },
                body: { kind: "variable", name: "y" },
            },
            env: List.of({
                kind: "env",
                var: { kind: "variable", name: "x" },
                val: {
                    kind: "closure",
                    lambda: {
                        kind: "lambda",
                        param: { kind: "variable", name: "y" },
                        body: { kind: "variable", name: "y" },
                    },
                    env: List.of()
                }
            })
        });
    });

    it("case 3", () => {
        const subject = initState(parse("(fn x -> (fn x -> x)) (fn y -> y) (fn z -> z)"));

        const actual1 = execute(subject);

        expect(actual1.isOk()).toBeTruthy();
        const v = actual1._unsafeUnwrap();
        expect(v.kind).toEqual("closure");
        expect((v as Closure).lambda).toEqual({
            kind: "lambda",
            param: { kind: "variable", name: "y" },
            body: { kind: "variable", name: "y" }
        });
    });

    it("SKK = I", () => {
        const subject = initState(parse(`
            (fn x y z -> x z (y z)) (fn p q -> p) (fn a b -> a)
            (fn c -> c)
        `));

        const actual1 = execute(subject);

        expect(actual1.isOk()).toBeTruthy();
        const actual2 = actual1._unsafeUnwrap();
        expect(actual2.kind).toEqual("closure");
        expect((actual2 as Closure).lambda).toEqual({
            kind: "lambda",
            param: { kind: "variable", name: "c" },
            body: { kind: "variable", name: "c" }
        });
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
});
