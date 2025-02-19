import Parser from 'web-tree-sitter';
import { parseNode } from './parseNode';
import { describe, it, expect, beforeAll } from "vitest";
import { CKMachine } from './ckmachine';
import { ok, err } from 'neverthrow';

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
    it("should work", () => {
        const state0 = CKMachine.initState(parse("fn x -> x"));
        const state1 = CKMachine.executeStep(state0);
        expect(state1).toEqual(ok({
            kind: "applyCont",
            value: {
                kind: "closure",
                lambda: {
                    kind: "lambda",
                    params: [{ kind: "variable", name: "x" }],
                    body: { kind: "variable", name: "x" },
                },
                env: [],
            },
            cont: { kind: "halt" },
        }));

        const state2 = CKMachine.executeStep(state1._unsafeUnwrap());
        expect(state2).toEqual(err(new Error("Evaluation has halted")));
    });
});
