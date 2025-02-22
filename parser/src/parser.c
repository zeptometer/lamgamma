#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 18
#define LARGE_STATE_COUNT 6
#define SYMBOL_COUNT 18
#define ALIAS_COUNT 0
#define TOKEN_COUNT 9
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
  anon_sym_STAR = 8,
  sym_source_file = 9,
  sym__expression = 10,
  sym__simple_expression = 11,
  sym_lambda = 12,
  sym_application = 13,
  sym_parameters = 14,
  sym_add = 15,
  sym_mult = 16,
  aux_sym_parameters_repeat1 = 17,
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
  [anon_sym_STAR] = "*",
  [sym_source_file] = "source_file",
  [sym__expression] = "_expression",
  [sym__simple_expression] = "_simple_expression",
  [sym_lambda] = "lambda",
  [sym_application] = "application",
  [sym_parameters] = "parameters",
  [sym_add] = "add",
  [sym_mult] = "mult",
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
  [anon_sym_STAR] = anon_sym_STAR,
  [sym_source_file] = sym_source_file,
  [sym__expression] = sym__expression,
  [sym__simple_expression] = sym__simple_expression,
  [sym_lambda] = sym_lambda,
  [sym_application] = sym_application,
  [sym_parameters] = sym_parameters,
  [sym_add] = sym_add,
  [sym_mult] = sym_mult,
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
  [anon_sym_STAR] = {
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
  [sym_mult] = {
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
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(2);
      if (lookahead == '(') ADVANCE(3);
      if (lookahead == ')') ADVANCE(4);
      if (lookahead == '*') ADVANCE(9);
      if (lookahead == '+') ADVANCE(8);
      if (lookahead == '-') ADVANCE(1);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(7);
      if (lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(6);
      END_STATE();
    case 1:
      if (lookahead == '>') ADVANCE(5);
      END_STATE();
    case 2:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 3:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 4:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 5:
      ACCEPT_TOKEN(anon_sym_DASH_GT);
      END_STATE();
    case 6:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(6);
      END_STATE();
    case 7:
      ACCEPT_TOKEN(sym_number);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(7);
      END_STATE();
    case 8:
      ACCEPT_TOKEN(anon_sym_PLUS);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(anon_sym_STAR);
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
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      END_STATE();
    case 1:
      if (lookahead == 'n') ADVANCE(2);
      END_STATE();
    case 2:
      ACCEPT_TOKEN(anon_sym_fn);
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
  [9] = {.lex_state = 0},
  [10] = {.lex_state = 0},
  [11] = {.lex_state = 0},
  [12] = {.lex_state = 0},
  [13] = {.lex_state = 0},
  [14] = {.lex_state = 0},
  [15] = {.lex_state = 0},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
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
    [anon_sym_STAR] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(16),
    [sym__expression] = STATE(9),
    [sym__simple_expression] = STATE(9),
    [sym_lambda] = STATE(9),
    [sym_application] = STATE(9),
    [sym_add] = STATE(9),
    [sym_mult] = STATE(9),
    [sym_identifier] = ACTIONS(3),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(9),
  },
  [2] = {
    [sym__expression] = STATE(10),
    [sym__simple_expression] = STATE(10),
    [sym_lambda] = STATE(10),
    [sym_application] = STATE(10),
    [sym_add] = STATE(10),
    [sym_mult] = STATE(10),
    [sym_identifier] = ACTIONS(11),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(13),
  },
  [3] = {
    [sym__expression] = STATE(6),
    [sym__simple_expression] = STATE(6),
    [sym_lambda] = STATE(6),
    [sym_application] = STATE(6),
    [sym_add] = STATE(6),
    [sym_mult] = STATE(6),
    [sym_identifier] = ACTIONS(15),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(17),
  },
  [4] = {
    [sym__expression] = STATE(7),
    [sym__simple_expression] = STATE(7),
    [sym_lambda] = STATE(7),
    [sym_application] = STATE(7),
    [sym_add] = STATE(7),
    [sym_mult] = STATE(7),
    [sym_identifier] = ACTIONS(19),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(21),
  },
  [5] = {
    [sym__expression] = STATE(8),
    [sym__simple_expression] = STATE(8),
    [sym_lambda] = STATE(8),
    [sym_application] = STATE(8),
    [sym_add] = STATE(8),
    [sym_mult] = STATE(8),
    [sym_identifier] = ACTIONS(23),
    [anon_sym_LPAREN] = ACTIONS(5),
    [anon_sym_fn] = ACTIONS(7),
    [sym_number] = ACTIONS(25),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 5,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(31), 1,
      anon_sym_STAR,
    STATE(11), 1,
      sym__simple_expression,
    ACTIONS(29), 2,
      sym_identifier,
      sym_number,
    ACTIONS(27), 3,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
  [19] = 4,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    STATE(11), 1,
      sym__simple_expression,
    ACTIONS(29), 2,
      sym_identifier,
      sym_number,
    ACTIONS(33), 4,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
      anon_sym_PLUS,
      anon_sym_STAR,
  [36] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(31), 1,
      anon_sym_STAR,
    ACTIONS(37), 1,
      anon_sym_PLUS,
    STATE(11), 1,
      sym__simple_expression,
    ACTIONS(29), 2,
      sym_identifier,
      sym_number,
    ACTIONS(35), 2,
      ts_builtin_sym_end,
      anon_sym_RPAREN,
  [57] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(31), 1,
      anon_sym_STAR,
    ACTIONS(37), 1,
      anon_sym_PLUS,
    ACTIONS(39), 1,
      ts_builtin_sym_end,
    STATE(11), 1,
      sym__simple_expression,
    ACTIONS(29), 2,
      sym_identifier,
      sym_number,
  [77] = 6,
    ACTIONS(5), 1,
      anon_sym_LPAREN,
    ACTIONS(31), 1,
      anon_sym_STAR,
    ACTIONS(37), 1,
      anon_sym_PLUS,
    ACTIONS(41), 1,
      anon_sym_RPAREN,
    STATE(11), 1,
      sym__simple_expression,
    ACTIONS(29), 2,
      sym_identifier,
      sym_number,
  [97] = 1,
    ACTIONS(43), 7,
      ts_builtin_sym_end,
      anon_sym_LPAREN,
      anon_sym_RPAREN,
      sym_identifier,
      sym_number,
      anon_sym_PLUS,
      anon_sym_STAR,
  [107] = 1,
    ACTIONS(45), 7,
      ts_builtin_sym_end,
      anon_sym_LPAREN,
      anon_sym_RPAREN,
      sym_identifier,
      sym_number,
      anon_sym_PLUS,
      anon_sym_STAR,
  [117] = 3,
    ACTIONS(47), 1,
      sym_identifier,
    STATE(14), 1,
      aux_sym_parameters_repeat1,
    STATE(17), 1,
      sym_parameters,
  [127] = 3,
    ACTIONS(49), 1,
      sym_identifier,
    ACTIONS(51), 1,
      anon_sym_DASH_GT,
    STATE(15), 1,
      aux_sym_parameters_repeat1,
  [137] = 3,
    ACTIONS(53), 1,
      sym_identifier,
    ACTIONS(56), 1,
      anon_sym_DASH_GT,
    STATE(15), 1,
      aux_sym_parameters_repeat1,
  [147] = 1,
    ACTIONS(58), 1,
      ts_builtin_sym_end,
  [151] = 1,
    ACTIONS(60), 1,
      anon_sym_DASH_GT,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(6)] = 0,
  [SMALL_STATE(7)] = 19,
  [SMALL_STATE(8)] = 36,
  [SMALL_STATE(9)] = 57,
  [SMALL_STATE(10)] = 77,
  [SMALL_STATE(11)] = 97,
  [SMALL_STATE(12)] = 107,
  [SMALL_STATE(13)] = 117,
  [SMALL_STATE(14)] = 127,
  [SMALL_STATE(15)] = 137,
  [SMALL_STATE(16)] = 147,
  [SMALL_STATE(17)] = 151,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = false}}, SHIFT(9),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [7] = {.entry = {.count = 1, .reusable = false}}, SHIFT(13),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(10),
  [13] = {.entry = {.count = 1, .reusable = true}}, SHIFT(10),
  [15] = {.entry = {.count = 1, .reusable = false}}, SHIFT(6),
  [17] = {.entry = {.count = 1, .reusable = true}}, SHIFT(6),
  [19] = {.entry = {.count = 1, .reusable = false}}, SHIFT(7),
  [21] = {.entry = {.count = 1, .reusable = true}}, SHIFT(7),
  [23] = {.entry = {.count = 1, .reusable = false}}, SHIFT(8),
  [25] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [27] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_add, 3, 0, 1),
  [29] = {.entry = {.count = 1, .reusable = true}}, SHIFT(11),
  [31] = {.entry = {.count = 1, .reusable = true}}, SHIFT(4),
  [33] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_mult, 3, 0, 1),
  [35] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_lambda, 4, 0, 0),
  [37] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [39] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [41] = {.entry = {.count = 1, .reusable = true}}, SHIFT(12),
  [43] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_application, 2, 0, 0),
  [45] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__simple_expression, 3, 0, 0),
  [47] = {.entry = {.count = 1, .reusable = true}}, SHIFT(14),
  [49] = {.entry = {.count = 1, .reusable = true}}, SHIFT(15),
  [51] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameters, 1, 0, 0),
  [53] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0), SHIFT_REPEAT(15),
  [56] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0),
  [58] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [60] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
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
