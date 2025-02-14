/**
 * @file parser for lamgamma
 * @author Yuito Murase <yuito@acupof.coffee>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "lamgamma_parser",

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.variable_declaration,
      $.function_declaration,
      $.expression_statement
    ),

    variable_declaration: $ => seq(
      'let',
      $.identifier,
      '=',
      $.expression,
      ';'
    ),

    function_declaration: $ => seq(
      'function',
      $.identifier,
      '(',
      optional($.parameters),
      ')',
      '{',
      repeat($._statement),
      '}'
    ),

    expression_statement: $ => seq(
      $.expression,
      ';'
    ),

    expression: $ => choice(
      $.identifier,
      $.number,
      $.function_call
    ),

    function_call: $ => seq(
      $.identifier,
      '(',
      optional($.arguments),
      ')'
    ),

    parameters: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier))
    ),

    arguments: $ => seq(
      $.expression,
      repeat(seq(',', $.expression))
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: $ => /\d+/
  }
});
