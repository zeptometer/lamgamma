import { expect, it, beforeAll, describe } from 'vitest'
import Parser from 'web-tree-sitter';

import { parseNode } from './parseNode';
import { ok } from 'neverthrow';
import { List } from 'immutable';

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

describe('Tree Parser, success cases', () => {
  describe('basic stlc constructs', () => {
    it('parse variable', () => {
      const input = 'x';
      const expectedOutput = { kind: 'variable', name: 'x' };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });

    it('parse abstraction', () => {
      const input = 'fn x -> x';
      const expectedOutput = {
        kind: 'lambda',
        param: { kind: 'variable', name: 'x' },
        body: { kind: 'variable', name: 'x' }
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });

    it('parse abstraction with multiple params', () => {
      const input = 'fn x y -> x';
      const expectedOutput = {
        kind: 'lambda',
        param: { kind: 'variable', name: 'x' },
        body: {
          kind: 'lambda',
          param: { kind: 'variable', name: 'y' },
          body: { kind: 'variable', name: 'x' }
        }
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });

    it('parse application', () => {
      const input = 'x y';
      const expectedOutput = {
        kind: 'application',
        func: { kind: 'variable', name: 'x' },
        arg: { kind: 'variable', name: 'y' }
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });

    it('parse paren', () => {
      const input = '(x)';
      const expectedOutput = { kind: 'variable', name: 'x' };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });

    it('compound expression', () => {
      const input = '(fn x -> x) y';
      const expectedOutput = {
        kind: 'application',
        func: {
          kind: 'lambda',
          param: { kind: 'variable', name: 'x' },
          body: { kind: 'variable', name: 'x' }
        },
        arg: { kind: 'variable', name: 'y' }
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput))
    })
  });
  describe('basic arithmetic', () => {
    it('parse number', () => {
      const input = '123';
      const expectedOutput = { kind: 'number', value: 123 };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
    it('parse addition', () => {
      const input = '1 + 2';
      const expectedOutput = {
        kind: 'primitive',
        op: 'add',
        args: List.of({ kind: 'number', value: 1 }, { kind: 'number', value: 2 })
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
    it('parse subtraction', () => {
      const input = '1 - 2';
      const expectedOutput = {
        kind: 'primitive',
        op: 'sub',
        args: List.of({ kind: 'number', value: 1 }, { kind: 'number', value: 2 })
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
    it('parse multiplication', () => {
      const input = '1 * 2';
      const expectedOutput = {
        kind: 'primitive',
        op: 'mul',
        args: List.of({ kind: 'number', value: 1 }, { kind: 'number', value: 2 })
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
    it('parse division', () => {
      const input = '1 / 2';
      const expectedOutput = {
        kind: 'primitive',
        op: 'div',
        args: List.of({ kind: 'number', value: 1 }, { kind: 'number', value: 2 })
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
    it('parse modulo', () => {
      const input = '1 mod 2';
      const expectedOutput = {
        kind: 'primitive',
        op: 'mod',
        args: List.of({ kind: 'number', value: 1 }, { kind: 'number', value: 2 })
      };
      expect(parseNode((parser.parse(input)).rootNode))
        .toEqual(ok(expectedOutput));
    });
  });
});


describe('Tree Parser, failing cases', () => {
  it('missing body in function', () => {
    const input = 'fn x ->';
    const r = parseNode((parser.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Missing node: identifier');
    expect(e.node.startPosition).toEqual({ row: 0, column: 7 });
    expect(e.node.endPosition).toEqual({ row: 0, column: 7 });
  });

  it('missing parameter in function', () => {
    const input = 'fn -> x';
    const r = parseNode((parser.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Missing node: identifier');
    expect(e.node.startPosition).toEqual({ row: 0, column: 2 });
    expect(e.node.endPosition).toEqual({ row: 0, column: 2 });
  });

  it('function needs to be parenthesized', () => {
    const input = 'x fn x -> x';
    const r = parseNode((parser.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Syntax error');
    expect(e.node.startPosition).toEqual({ row: 0, column: 7 });
    expect(e.node.endPosition).toEqual({ row: 0, column: 9 });
  });
});