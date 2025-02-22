/**
 * @file parser for lamgamma
 * @author Yuito Murase <yuito@acupof.coffee>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// borrow from tree-sitter-satysfi
const PREC = {
  recordmember: 13,
  stage: 12,
  application: 11,
  constructor: 10,
  unary: 10,
  divisive: 9,
  multiplicative: 9,
  additive: 8,
  subtractive: 8,
  comparative: 7,
  concat: 6,
  and: 5,
  or: 4,
  assign: 3,
  lambda: 3,

  match: 1,

  typeapplication: 2,
  typefunc: 0,
  typeprod: 1,
};

module.exports = grammar({
  name: "lamgamma_parser",

  word: $ => $.identifier,

  rules: {
    source_file: $ => $._expression,

    _expression: $ => choice(
      $._simple_expression,
      $.lambda,
      $.application,
      $.add,
      $.sub,
      $.mult,
      $.div,
      $.mod
    ),

    // Expressions that can be used as an argument as-is
    _simple_expression: $ => choice(
      seq('(', $._expression, ')'),
      $.identifier,
      $.number
    ),

    lambda: $ => prec.right(PREC.lambda,
      seq('fn', $.parameters, '->', $._expression)),

    application: $ =>
      prec.left(PREC.application, seq(
        $._expression,
        $._simple_expression
      )),

    parameters: $ => repeat1($.identifier),

    identifier: $ => /[a-z_][a-zA-Z0-9_]*/,

    number: $ => /\d+/,

    // binary operators
    add: $ => prec.left(PREC.additive,
      seq(
        field("left", $._expression),
        '+',
        field("right", $._expression))),

    sub: $ => prec.left(PREC.subtractive,
      seq(
        field("left", $._expression),
        '-',
        field("right", $._expression))),

    mult: $ => prec.left(PREC.multiplicative,
      seq(
        field("left", $._expression),
        '*',
        field("right", $._expression))),

    div: $ => prec.left(PREC.divisive,
      seq(
        field("left", $._expression),
        '/',
        field("right", $._expression))),

    mod: $ => prec.left(PREC.divisive,
      seq(
        field("left", $._expression),
        'mod',
        field("right", $._expression)))
  }
});
