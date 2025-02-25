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
      // fixpoint
      $.fixpoint,
      // arithmetic
      $.add,
      $.sub,
      $.mult,
      $.div,
      $.mod,
      // boolean
      $.ctrl_if,
      $.eq,
      $.ne,
      $.lt,
      $.le,
      $.gt,
      $.ge,
      $.and,
      $.or,
      $.neg,
    ),

    // Expressions that can be used as an argument as-is
    _simple_expression: $ => choice(
      seq('(', $._expression, ')'),
      $.identifier,
      $.number,
      $.boolean,
      // staging
      $.quote,
      $.splice,
    ),

    lambda: $ => prec.right(PREC.lambda,
      seq('fn', $.parameters, '->', $._expression)),

    fixpoint: $ => prec.right(PREC.lambda,
      seq('fix', $.identifier, '->', $._expression)),

    application: $ =>
      prec.left(PREC.application, seq(
        $._expression,
        $._simple_expression
      )),

    parameters: $ => repeat1($.identifier),

    identifier: $ => /[a-z_][a-zA-Z0-9_]*/,

    // arithmetic
    number: $ => /\d+/,

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
        field("right", $._expression))),

    // boolean
    boolean: $ => choice('true', 'false'),

    ctrl_if: $ => prec.right(PREC.match,
      seq('if',
        field("cond", $._expression),
        'then',
        field("then", $._expression),
        'else',
        field("else", $._expression))),

    eq: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '==',
        field("right", $._expression))),

    ne: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '!=',
        field("right", $._expression))),

    lt: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '<',
        field("right", $._expression))),

    le: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '<=',
        field("right", $._expression))),

    gt: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '>',
        field("right", $._expression))),

    ge: $ => prec.left(PREC.comparative,
      seq(
        field("left", $._expression),
        '>=',
        field("right", $._expression))),

    and: $ => prec.left(PREC.and,
      seq(
        field("left", $._expression),
        '&&',
        field("right", $._expression))),

    or: $ => prec.left(PREC.or,
      seq(
        field("left", $._expression),
        '||',
        field("right", $._expression))),

    neg: $ => prec.right(PREC.unary,
      seq('!', $._expression)),

    // staging
    quote: $ => prec(PREC.stage,
      seq('`{', $._expression, '}')),

    splice: $ => prec(PREC.stage,
      choice(
        seq('~{', field("body", $._expression), '}'),
        seq('~', field("shift", $.number), '{', field("body", $._expression), '}')
      )
    )
  }
});
