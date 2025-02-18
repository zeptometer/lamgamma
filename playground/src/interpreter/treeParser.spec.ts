import { expect, it, beforeAll, describe } from 'vitest'
import Parser from 'web-tree-sitter';

import { parseNode } from './treeParser';
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

describe('Tree Parser, success cases', () => {
  it('parse variable', () => {
    const input = 'x';
    const expectedOutput = { kind: 'variable', name: 'x' };
    expect(parseNode((parser?.parse(input)).rootNode))
      .toEqual(ok(expectedOutput));
  });

  it('parse abstraction', () => {
    const input = 'fn x -> x';
    const expectedOutput = {
      kind: 'lambda',
      params: [{ kind: 'variable', name: 'x' }],
      body: { kind: 'variable', name: 'x' }
    };
    expect(parseNode((parser?.parse(input)).rootNode))
      .toEqual(ok(expectedOutput));
  });

  it('parse application', () => {
    const input = 'x y';
    const expectedOutput = {
      kind: 'application',
      func: { kind: 'variable', name: 'x' },
      arg: { kind: 'variable', name: 'y' }
    };
    expect(parseNode((parser?.parse(input)).rootNode))
      .toEqual(ok(expectedOutput));
  });

  it('parse paren', () => {
    const input = '(x)';
    const expectedOutput = { kind: 'variable', name: 'x' };
    expect(parseNode((parser?.parse(input)).rootNode))
      .toEqual(ok(expectedOutput));
  });

  it('compound expression', () => {
    const input = '(fn x -> x) y';
    const expectedOutput = {
      kind: 'application',
      func: {
        kind: 'lambda',
        params: [{ kind: 'variable', name: 'x' }],
        body: { kind: 'variable', name: 'x' }
      },
      arg: { kind: 'variable', name: 'y' }
    };
    expect(parseNode((parser?.parse(input)).rootNode))
      .toEqual(ok(expectedOutput))
  })
});

describe('Tree Parser, failing cases', () => {
  it('missing body in function', () => {
    const input = 'fn x ->';
    const r = parseNode((parser?.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Missing node: identifier');
    expect(e.node.startPosition).toEqual({row:0, column: 7});
    expect(e.node.endPosition).toEqual({row:0, column: 7});
  });

  it('missing parameter in function', () => {
    const input = 'fn -> x';
    const r = parseNode((parser?.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Missing node: identifier');
    expect(e.node.startPosition).toEqual({row:0, column: 2});
    expect(e.node.endPosition).toEqual({row:0, column: 2});
  });

  it('function needs to be parenthesized', () => {
    const input = 'x fn x -> x';
    const r = parseNode((parser?.parse(input)).rootNode);
    expect(r.isErr()).toBeTruthy();

    const e = r._unsafeUnwrapErr();
    expect(e.message).toBe('Syntax error');
    expect(e.node.startPosition).toEqual({row:0, column: 7});
    expect(e.node.endPosition).toEqual({row:0, column: 9});
  });
});