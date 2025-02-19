import Parser from 'web-tree-sitter';
import { parseNode } from './parseNode';
import { describe, it, expect, beforeAll } from "vitest";
import { CKMachine } from './ckmachine';
import { ok, err } from 'neverthrow';

let { initState, executeStep, execute } = CKMachine;
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
            value: {
                kind: "closure",
                lambda: {
                    kind: "lambda",
                    param: { kind: "variable", name: "x" },
                    body: { kind: "variable", name: "x" },
                },
                env: [],
            },
            cont: { kind: "halt" },
        }));

        const actual2 = executeStep(actual1._unsafeUnwrap());

        expect(actual2).toEqual(err(new Error("Evaluation has halted")));
    });

    it("case 2", () => {
        const subject = initState(parse("(fn x -> x) (fn y -> y)"));

        const actual = execute(subject);

        expect(actual).toEqual(ok(
            {
                kind: "closure",
                lambda: {
                    kind: "lambda",
                    param: { kind: "variable", name: "y" },
                    body: { kind: "variable", name: "y" },
                },
                env: [{
                    var: { kind: "variable", name: "x" },
                    val: {
                        kind: "closure",
                        lambda: {
                            kind: "lambda",
                            param: { kind: "variable", name: "y" },
                            body: { kind: "variable", name: "y" }
                        },
                        env: []
                    }
                }],
            }));
    });

    it("SKK = I", () => {
        const subject = initState(parse(`
            (fn x y z -> x z (y z)) (fn x y -> x) (fn x y -> x)
            (fn p -> p)
        `));

        const result = execute(subject);

        expect(result.isOk()).toBeTruthy();
        let v = result._unsafeUnwrap();
        expect(v.kind).toEqual("closure");
        expect(v.lambda).toEqual({
            kind: "lambda",
            param: { kind: "variable", name: "p" },
            body: { kind: "variable", name: "p" }
        });
    });
});
