#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 24
#define LARGE_STATE_COUNT 9
#define SYMBOL_COUNT 24
#define ALIAS_COUNT 0
#define TOKEN_COUNT 12
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 2
#define MAX_ALIAS_SEQUENCE_LENGTH 4
#define PRODUCTION_ID_COUNT 2

enum ts_symbol_identifiers {
  sym_identifier = 1,
  anon_sym_LPAREN = 2,
  anon_sym_RPAREN = 3,
  anon_sym_fn = 4,
  anon_sym_DASH_GT = 5,
  sym_number = 6,
  anon_sym_PLUS = 7,
  anon_sym_DASH = 8,
  anon_sym_STAR = 9,
  anon_sym_SLASH = 10,
  anon_sym_mod = 11,
  sym_source_file = 12,
  sym__expression = 13,
  sym__simple_expression = 14,
  sym_lambda = 15,
  sym_application = 16,
  sym_parameters = 17,
  sym_add = 18,
  sym_sub = 19,
  sym_mult = 20,
  sym_div = 21,
  sym_mod = 22,
  aux_sym_parameters_repeat1 = 23,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_fn] = "fn",
  [anon_sym_DASH_GT] = "->",
  [sym_number] = "number",
  [anon_sym_PLUS] = "+",
  [anon_sym_DASH] = "-",
  [anon_sym_STAR] = "*",
  [anon_sym_SLASH] = "/",
  [anon_sym_mod] = "mod",
  [sym_source_file] = "source_file",
  [sym__expression] = "_expression",
  [sym__simple_expression] = "_simple_expression",
  [sym_lambda] = "lambda",
  [sym_application] = "application",
  [sym_parameters] = "parameters",
  [sym_add] = "add",
  [sym_sub] = "sub",
  [sym_mult] = "mult",
  [sym_div] = "div",
  [sym_mod] = "mod",
  [aux_sym_parameters_repeat1] = "parameters_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_fn] = anon_sym_fn,
  [anon_sym_DASH_GT] = anon_sym_DASH_GT,
  [sym_number] = sym_number,
  [anon_sym_PLUS] = anon_sym_PLUS,
  [anon_sym_DASH] = anon_sym_DASH,
  [anon_sym_STAR] = anon_sym_STAR,
  [anon_sym_SLASH] = anon_sym_SLASH,
  [anon_sym_mod] = anon_sym_mod,
  [sym_source_file] = sym_source_file,
  [sym__expression] = sym__expression,
  [sym__simple_expression] = sym__simple_expression,
  [sym_lambda] = sym_lambda,
  [sym_application] = sym_application,
  [sym_parameters] = sym_parameters,
  [sym_add] = sym_add,
  [sym_sub] = sym_sub,
  [sym_mult] = sym_mult,
  [sym_div] = sym_div,
  [sym_mod] = sym_mod,
  [aux_sym_parameters_repeat1] = aux_sym_parameters_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_LPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_fn] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DASH_GT] = {
    .visible = true,
    .named = false,
  },
  [sym_number] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_PLUS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DASH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_STAR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SLASH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_mod] = {
    .visible = true,
    .named = false,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__expression] = {
    .visible = false,
    .named = true,
  },
  [sym__simple_expression] = {
    .visible = false,
    .named = true,
  },
  [sym_lambda] = {
    .visible = true,
    .named = true,
  },
  [sym_application] = {
    .visible = true,
    .named = true,
  },
  [sym_parameters] = {
    .visible = true,
    .named = true,
  },
  [sym_add] = {
    .visible = true,
    .named = true,
  },
  [sym_sub] = {
    .visible = true,
    .named = true,
  },
  [sym_mult] = {
    .visible = true,
    .named = true,
  },
  [sym_div] = {
    .visible = true,
    .named = true,
  },
  [sym_mod] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_parameters_repeat1] = {
    .visible = false,
    .named = false,
  },
};

enum ts_field_identifiers {
  field_left = 1,
  field_right = 2,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_left] = "left",
  [field_right] = "right",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 2},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_left, 0},
    {field_right, 2},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
  [5] = 5,
  [6] = 6,
  [7] = 7,
  [8] = 8,
  [9] = 9,
  [10] = 10,
  [11] = 11,
  [12] = 12,
  [13] = 13,
  [14] = 14,
  [15] = 15,
  [16] = 16,
  [17] = 17,
  [18] = 18,
  [19] = 19,
  [20] = 20,
  [21] = 21,
  [22] = 22,
  [23] = 23,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(4);
      if (lookahead == '(') ADVANCE(5);
      if (lookahead == ')') ADVANCE(6);
      if (lookahead == '*') ADVANCE(13);
      if (lookahead == '+') ADVANCE(10);
      if (lookahead == '-') ADVANCE(12);
      if (lookahead == '/') ADVANCE(14);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(9);
      if (lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(8);
      END_STATE();
    case 1:
      if (lookahead == '-') ADVANCE(2);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(1);
      if (lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(8);
      END_STATE();
    case 2:
      if (lookahead == '>') ADVANCE(7);
      END_STATE();
    case 3:
      if (eof) ADVANCE(4);
      if (lookahead == '(') ADVANCE(5);
      if (lookahead == ')') ADVANCE(6);
      if (lookahead == '*') ADVANCE(13);
      if (lookahead == '+') ADVANCE(10);
      if (lookahead == '-') ADVANCE(11);
      if (lookahead == '/') ADVANCE(14);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(3);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(9);
      if (lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(8);
      END_STATE();
    case 4:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 5:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 6:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 7:
      ACCEPT_TOKEN(anon_sym_DASH_GT);
      END_STATE();
    case 8:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(8);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(sym_number);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(9);
      END_STATE();
    case 10:
      ACCEPT_TOKEN(anon_sym_PLUS);
      END_STATE();
    case 11:
      ACCEPT_TOKEN(anon_sym_DASH);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(anon_sym_DASH);
      if (lookahead == '>') ADVANCE(7);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(anon_sym_STAR);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(anon_sym_SLASH);
      END_STATE();
    default:
      return false;
  }
}

static bool ts_lex_keywords(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (lookahead == 'f') ADVANCE(1);
      if (lookahead == 'm') ADVANCE(2);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      END_STATE();
    case 1:
      if (lookahead == 'n') ADVANCE(3);
      END_STATE();
    case 2:
      if (lookahead == 'o') ADVANCE(4);
      END_STATE();
    case 3:
      ACCEPT_TOKEN(anon_sym_fn);
      END_STATE();
    case 4:
      if (lookahead == 'd') ADVANCE(5);
      END_STATE();
    case 5:
      ACCEPT_TOKEN(anon_sym_mod);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 0},
  [7] = {.lex_state = 0},
  [8] = {.lex_state = 0},
  [9] = {.lex_state = 3},
  [10] = {.lex_state = 3},
  [11] = {.lex_state = 3},
  [12] = {.lex_state = 3},
  [13] = {.lex_state = 3},
  [14] = {.lex_state = 3},
  [15] = {.lex_state = 3},
  [16] = {.lex_state = 3},
  [17] = {.lex_state = 3},
  [18] = {.lex_state = 3},
  [19] = {.lex_state = 1},
  [20] = {.lex_state = 0},
  [21] = {.lex_state = 1},
  [22] = {.lex_state = 1},
  [23] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_fn] = ACTIONS(1),
    [anon_sym_DASH_GT] = ACTIONS(1),
    [sym_number] = ACTIONS(1),
    [anon_sym_PLUS] = ACTIONS(1),
    [anon_sym_DASH] = ACTIONS(1),
    [anon_sym_STAR] = ACTIONS(1),
    [anon_sym_SLASH] = ACTIONS(1),
    [anon_sym_mod] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(23),
    [sym__expression] = STATE(16),
    [sym__simple_expression] = STATE(16),
    [sym_lambda] = STATE(16),
    [sym_application] = STATE(16),
    [sym_add] = STATE(16),
    [sym_sub] = STATE(16),
    [sym_mult] = STATE(16),
    [sym_div] = STATE(16),
    [sym_mod] = STATE(16),
    [sym_identifier] = ACTIONS(3),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(9),
  },
  [2] = {
    [sym__expression] = STATE(15),
    [sym__simple_expression] = STATE(15),
    [sym_lambda] = STATE(15),
    [sym_application] = STATE(15),
    [sym_add] = STATE(15),
    [sym_sub] = STATE(15),
    [sym_mult] = STATE(15),
    [sym_div] = STATE(15),
    [sym_mod] = STATE(15),
    [sym_identifier] = ACTIONS(11),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(13),
  },
  [3] = {
    [sym__expression] = STATE(10),
    [sym__simple_expression] = STATE(10),
    [sym_lambda] = STATE(10),
    [sym_application] = STATE(10),
    [sym_add] = STATE(10),
    [sym_sub] = STATE(10),
    [sym_mult] = STATE(10),
    [sym_div] = STATE(10),
    [sym_mod] = STATE(10),
    [sym_identifier] = ACTIONS(15),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(17),
  },
  [4] = {
    [sym__expression] = STATE(11),
    [sym__simple_expression] = STATE(11),
    [sym_lambda] = STATE(11),
    [sym_application] = STATE(11),
    [sym_add] = STATE(11),
    [sym_sub] = STATE(11),
    [sym_mult] = STATE(11),
    [sym_div] = STATE(11),
    [sym_mod] = STATE(11),
    [sym_identifier] = ACTIONS(19),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(21),
  },
  [5] = {
    [sym__expression] = STATE(9),
    [sym__simple_expression] = STATE(9),
    [sym_lambda] = STATE(9),
    [sym_application] = STATE(9),
    [sym_add] = STATE(9),
    [sym_sub] = STATE(9),
    [sym_mult] = STATE(9),
    [sym_div] = STATE(9),
    [sym_mod] = STATE(9),
    [sym_identifier] = ACTIONS(23),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(25),
  },
  [6] = {
    [sym__expression] = STATE(12),
    [sym__simple_expression] = STATE(12),
    [sym_lambda] = STATE(12),
    [sym_application] = STATE(12),
    [sym_add] = STATE(12),
    [sym_sub] = STATE(12),
    [sym_mult] = STATE(12),
    [sym_div] = STATE(12),
    [sym_mod] = STATE(12),
    [sym_identifier] = ACTIONS(27),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(29),
  },
  [7] = {
    [sym__expression] = STATE(13),
    [sym__simple_expression] = STATE(13),
    [sym_lambda] = STATE(13),
    [sym_application] = STATE(13),
    [sym_add] = STATE(13),
    [sym_sub] = STATE(13),
    [sym_mult] = STATE(13),
    [sym_div] = STATE(13),
    [sym_mod] = STATE(13),
    [sym_identifier] = ACTIONS(31),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(33),
  },
  [8] = {
    [sym__expression] = STATE(14),
    [sym__simple_expression] = STATE(14),
    [sym_lambda] = STATE(14),
    [sym_application] = STATE(14),
    [sym_add] = STATE(14),
    [sym_sub] = STATE(14),
    [sym_mult] = STATE(14),
    [sym_div] = STATE(14),
    [sym_mod] = STATE(14),
    [sym_identifier] = ACTIONS(35),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(37),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(45), 1,
      anon_sym_mod,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(39), 6,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_DASH,
      anon_sym_STAR,
      anon_sym_SLASH,
  [24] = 8,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(49), 1,
      anon_sym_STAR,
    ACTIONS(51), 1,
      anon_sym_SLASH,
    ACTIONS(53), 1,
      anon_sym_mod,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(47), 4,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_DASH,
  [52] = 8,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(49), 1,
      anon_sym_STAR,
    ACTIONS(51), 1,
      anon_sym_SLASH,
    ACTIONS(53), 1,
      anon_sym_mod,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(55), 4,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_DASH,
  [80] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(59), 1,
      anon_sym_mod,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(57), 6,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_DASH,
      anon_sym_STAR,
      anon_sym_SLASH,
  [104] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(63), 1,
      anon_sym_mod,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(61), 6,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_DASH,
      anon_sym_STAR,
      anon_sym_SLASH,
  [128] = 10,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(49), 1,
      anon_sym_STAR,
    ACTIONS(51), 1,
      anon_sym_SLASH,
    ACTIONS(53), 1,
      anon_sym_mod,
    ACTIONS(67), 1,
      anon_sym_PLUS,
    ACTIONS(69), 1,
      anon_sym_DASH,
    STATE(18), 1,
      sym__simple_expression,
    ACTIONS(65), 2,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
  [160] = 10,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(49), 1,
      anon_sym_STAR,
    ACTIONS(51), 1,
      anon_sym_SLASH,
    ACTIONS(53), 1,
      anon_sym_mod,
    ACTIONS(67), 1,
      anon_sym_PLUS,
    ACTIONS(69), 1,
      anon_sym_DASH,
    ACTIONS(71), 1,
      anon_sym_RPAREN,
    STATE(18), 1,
      sym__simple_expression,
  [191] = 10,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(41), 1,
      sym_identifier,
    ACTIONS(43), 1,
      sym_number,
    ACTIONS(49), 1,
      anon_sym_STAR,
    ACTIONS(51), 1,
      anon_sym_SLASH,
    ACTIONS(53), 1,
      anon_sym_mod,
    ACTIONS(67), 1,
      anon_sym_PLUS,
    ACTIONS(69), 1,
      anon_sym_DASH,
    ACTIONS(73), 1,
      ts_builtin_sym_end,
    STATE(18), 1,
      sym__simple_expression,
  [222] = 2,
    ACTIONS(77), 2,
      sym_identifier,
      anon_sym_mod,
    ACTIONS(75), 8,
      ts_builtin_sym_end,
      anon_sym_LPAREN,
      anon_sym_RPAREN,
      sym_number,
      anon_sym_PLUS,
      anon_sym_DASH,
      anon_sym_STAR,
      anon_sym_SLASH,
  [237] = 2,
    ACTIONS(81), 2,
      sym_identifier,
      anon_sym_mod,
    ACTIONS(79), 8,
      ts_builtin_sym_end,
      anon_sym_LPAREN,
      anon_sym_RPAREN,
      sym_number,
      anon_sym_PLUS,
      anon_sym_DASH,
      anon_sym_STAR,
      anon_sym_SLASH,
  [252] = 3,
    ACTIONS(83), 1,
      sym_identifier,
    ACTIONS(85), 1,
      anon_sym_DASH_GT,
    STATE(21), 1,
      aux_sym_parameters_repeat1,
  [262] = 3,
    ACTIONS(87), 1,
      sym_identifier,
    STATE(19), 1,
      aux_sym_parameters_repeat1,
    STATE(22), 1,
      sym_parameters,
  [272] = 3,
    ACTIONS(89), 1,
      sym_identifier,
    ACTIONS(92), 1,
      anon_sym_DASH_GT,
    STATE(21), 1,
      aux_sym_parameters_repeat1,
  [282] = 1,
    ACTIONS(94), 1,
      anon_sym_DASH_GT,
  [286] = 1,
    ACTIONS(96), 1,
      ts_builtin_sym_end,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(9)] = 0,
  [SMALL_STATE(10)] = 24,
  [SMALL_STATE(11)] = 52,
  [SMALL_STATE(12)] = 80,
  [SMALL_STATE(13)] = 104,
  [SMALL_STATE(14)] = 128,
  [SMALL_STATE(15)] = 160,
  [SMALL_STATE(16)] = 191,
  [SMALL_STATE(17)] = 222,
  [SMALL_STATE(18)] = 237,
  [SMALL_STATE(19)] = 252,
  [SMALL_STATE(20)] = 262,
  [SMALL_STATE(21)] = 272,
  [SMALL_STATE(22)] = 282,
  [SMALL_STATE(23)] = 286,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = false}}, SHIFT(16),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [7] = {.entry = {.count = 1, .reusable = false}}, SHIFT(20),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(16),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(15),
  [13] = {.entry = {.count = 1, .reusable = true}}, SHIFT(15),
  [15] = {.entry = {.count = 1, .reusable = false}}, SHIFT(10),
  [17] = {.entry = {.count = 1, .reusable = true}}, SHIFT(10),
  [19] = {.entry = {.count = 1, .reusable = false}}, SHIFT(11),
  [21] = {.entry = {.count = 1, .reusable = true}}, SHIFT(11),
  [23] = {.entry = {.count = 1, .reusable = false}}, SHIFT(9),
  [25] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [27] = {.entry = {.count = 1, .reusable = false}}, SHIFT(12),
  [29] = {.entry = {.count = 1, .reusable = true}}, SHIFT(12),
  [31] = {.entry = {.count = 1, .reusable = false}}, SHIFT(13),
  [33] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [35] = {.entry = {.count = 1, .reusable = false}}, SHIFT(14),
  [37] = {.entry = {.count = 1, .reusable = true}}, SHIFT(14),
  [39] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_mult, 3, 0, 1),
  [41] = {.entry = {.count = 1, .reusable = false}}, SHIFT(18),
  [43] = {.entry = {.count = 1, .reusable = true}}, SHIFT(18),
  [45] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_mult, 3, 0, 1),
  [47] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_add, 3, 0, 1),
  [49] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
  [51] = {.entry = {.count = 1, .reusable = true}}, SHIFT(6),
  [53] = {.entry = {.count = 1, .reusable = false}}, SHIFT(7),
  [55] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_sub, 3, 0, 1),
  [57] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_div, 3, 0, 1),
  [59] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_div, 3, 0, 1),
  [61] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_mod, 3, 0, 1),
  [63] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_mod, 3, 0, 1),
  [65] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_lambda, 4, 0, 0),
  [67] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [69] = {.entry = {.count = 1, .reusable = true}}, SHIFT(4),
  [71] = {.entry = {.count = 1, .reusable = true}}, SHIFT(17),
  [73] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [75] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__simple_expression, 3, 0, 0),
  [77] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__simple_expression, 3, 0, 0),
  [79] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_application, 2, 0, 0),
  [81] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_application, 2, 0, 0),
  [83] = {.entry = {.count = 1, .reusable = true}}, SHIFT(21),
  [85] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameters, 1, 0, 0),
  [87] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [89] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0), SHIFT_REPEAT(21),
  [92] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0),
  [94] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [96] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef TREE_SITTER_HIDE_SYMBOLS
#define TS_PUBLIC
#elif defined(_WIN32)
#define TS_PUBLIC __declspec(dllexport)
#else
#define TS_PUBLIC __attribute__((visibility("default")))
#endif

TS_PUBLIC const TSLanguage *tree_sitter_lamgamma_parser(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .field_names = ts_field_names,
    .field_map_slices = ts_field_map_slices,
    .field_map_entries = ts_field_map_entries,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .keyword_lex_fn = ts_lex_keywords,
    .keyword_capture_token = sym_identifier,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
