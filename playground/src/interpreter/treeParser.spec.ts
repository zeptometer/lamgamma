import { expect, it, beforeAll, describe } from 'vitest'
import Parser from 'web-tree-sitter';

import { parseTree } from './treeParser';

let parser: Parser;

beforeAll(
  async () => {
    await Parser.init();
    const parser1 = new Parser();
    const Lang = await Parser.Language.load('public/tree-sitter-lamgamma_parser.wasm');
    parser1.setLanguage(Lang);
    parser = parser1;
  }
)

describe('Tree Parser', () => {
  it('parse variable', () => {
    const input = 'x';
    const expectedOutput = { kind: 'variable', name: 'x' };
    expect(parseTree((parser?.parse(input)).rootNode))
      .toEqual(expectedOutput);
  });

  it('parse abstraction', () => {
    const input = 'fn x -> x';
    const expectedOutput = {
      kind: 'lambda',
      params: [{ kind: 'variable', name: 'x' }],
      body: { kind: 'variable', name: 'x' }
    };
    expect(parseTree((parser?.parse(input)).rootNode))
      .toEqual(expectedOutput);
  });

  it('parse application', () => {
    const input = 'x y';
    const expectedOutput = {
      kind: 'application',
      func: { kind: 'variable', name: 'x' },
      arg: { kind: 'variable', name: 'y' }
    };
    expect(parseTree((parser?.parse(input)).rootNode))
      .toEqual(expectedOutput);
  });

  it('parse paren', () => {
    const input = '(x)';
    const expectedOutput = { kind: 'variable', name: 'x' };
    expect(parseTree((parser?.parse(input)).rootNode))
      .toEqual(expectedOutput);
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
    expect(parseTree((parser?.parse(input)).rootNode))
      .toEqual(expectedOutput)
  })
})
