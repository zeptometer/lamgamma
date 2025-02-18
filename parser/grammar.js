/**
 * @file parser for lamgamma
 * @author Yuito Murase <yuito@acupof.coffee>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "lamgamma_parser",

  word: $ => $.identifier,

  rules: {
    source_file: $ => $._expression,

    _expression: $ => choice(
      $._simple_expression,
      $.lambda,
      $.application
    ),

    // Expressions that can be used as an argument as-is
    _simple_expression: $ => choice(
      seq('(', $._expression, ')'),
      $.identifier,
    ),

    lambda: $ => seq('fn', $.parameters, '->', $._expression),

    application: $ => 
      prec.left(1, seq(
      $._expression,
      $._simple_expression
    )),

    parameters: $ => repeat1($.identifier),

    identifier: $ => /[a-z_][a-zA-Z0-9_]*/,

    number: $ => /\d+/
  }
});
