import { describe, expect, it } from "vitest";
import { RenamingEnv } from "./ckstate";
import { List } from "immutable";

describe("RenamingEnv", () => {
    it("should lookup identifiers", () => {
        const renv: RenamingEnv = List([
            { from: { kind: "raw", name: "f" }, to: { kind: "colored", basename: "f", id: 1 } },
        ]);

        const result = RenamingEnv.lookup(renv, { kind: "raw", name: "f" });
        expect(result).toEqual({ kind: "colored", basename: "f", id: 1 });
    });

    it("should return null if the identifier is not found", () => {
        const renv: RenamingEnv = List([]);
        const result = RenamingEnv.lookup(renv, { kind: "raw", name: "f" });
        expect(result).toBeNull();
    });
});