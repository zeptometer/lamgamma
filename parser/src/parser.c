#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 62
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 24
#define ALIAS_COUNT 0
#define TOKEN_COUNT 12
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 8
#define PRODUCTION_ID_COUNT 1

enum ts_symbol_identifiers {
  anon_sym_let = 1,
  anon_sym_EQ = 2,
  anon_sym_SEMI = 3,
  anon_sym_function = 4,
  anon_sym_LPAREN = 5,
  anon_sym_RPAREN = 6,
  anon_sym_LBRACE = 7,
  anon_sym_RBRACE = 8,
  anon_sym_COMMA = 9,
  sym_identifier = 10,
  sym_number = 11,
  sym_source_file = 12,
  sym__statement = 13,
  sym_variable_declaration = 14,
  sym_function_declaration = 15,
  sym_expression_statement = 16,
  sym_expression = 17,
  sym_function_call = 18,
  sym_parameters = 19,
  sym_arguments = 20,
  aux_sym_source_file_repeat1 = 21,
  aux_sym_parameters_repeat1 = 22,
  aux_sym_arguments_repeat1 = 23,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [anon_sym_let] = "let",
  [anon_sym_EQ] = "=",
  [anon_sym_SEMI] = ";",
  [anon_sym_function] = "function",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_COMMA] = ",",
  [sym_identifier] = "identifier",
  [sym_number] = "number",
  [sym_source_file] = "source_file",
  [sym__statement] = "_statement",
  [sym_variable_declaration] = "variable_declaration",
  [sym_function_declaration] = "function_declaration",
  [sym_expression_statement] = "expression_statement",
  [sym_expression] = "expression",
  [sym_function_call] = "function_call",
  [sym_parameters] = "parameters",
  [sym_arguments] = "arguments",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
  [aux_sym_parameters_repeat1] = "parameters_repeat1",
  [aux_sym_arguments_repeat1] = "arguments_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [anon_sym_let] = anon_sym_let,
  [anon_sym_EQ] = anon_sym_EQ,
  [anon_sym_SEMI] = anon_sym_SEMI,
  [anon_sym_function] = anon_sym_function,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_COMMA] = anon_sym_COMMA,
  [sym_identifier] = sym_identifier,
  [sym_number] = sym_number,
  [sym_source_file] = sym_source_file,
  [sym__statement] = sym__statement,
  [sym_variable_declaration] = sym_variable_declaration,
  [sym_function_declaration] = sym_function_declaration,
  [sym_expression_statement] = sym_expression_statement,
  [sym_expression] = sym_expression,
  [sym_function_call] = sym_function_call,
  [sym_parameters] = sym_parameters,
  [sym_arguments] = sym_arguments,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
  [aux_sym_parameters_repeat1] = aux_sym_parameters_repeat1,
  [aux_sym_arguments_repeat1] = aux_sym_arguments_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [anon_sym_let] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SEMI] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_function] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COMMA] = {
    .visible = true,
    .named = false,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [sym_number] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__statement] = {
    .visible = false,
    .named = true,
  },
  [sym_variable_declaration] = {
    .visible = true,
    .named = true,
  },
  [sym_function_declaration] = {
    .visible = true,
    .named = true,
  },
  [sym_expression_statement] = {
    .visible = true,
    .named = true,
  },
  [sym_expression] = {
    .visible = true,
    .named = true,
  },
  [sym_function_call] = {
    .visible = true,
    .named = true,
  },
  [sym_parameters] = {
    .visible = true,
    .named = true,
  },
  [sym_arguments] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_source_file_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_parameters_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_arguments_repeat1] = {
    .visible = false,
    .named = false,
  },
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
  [7] = 2,
  [8] = 8,
  [9] = 5,
  [10] = 3,
  [11] = 6,
  [12] = 8,
  [13] = 13,
  [14] = 14,
  [15] = 15,
  [16] = 16,
  [17] = 17,
  [18] = 16,
  [19] = 19,
  [20] = 14,
  [21] = 15,
  [22] = 17,
  [23] = 19,
  [24] = 24,
  [25] = 25,
  [26] = 25,
  [27] = 27,
  [28] = 28,
  [29] = 29,
  [30] = 30,
  [31] = 31,
  [32] = 32,
  [33] = 33,
  [34] = 34,
  [35] = 35,
  [36] = 36,
  [37] = 37,
  [38] = 29,
  [39] = 39,
  [40] = 40,
  [41] = 41,
  [42] = 42,
  [43] = 43,
  [44] = 44,
  [45] = 45,
  [46] = 46,
  [47] = 47,
  [48] = 47,
  [49] = 49,
  [50] = 50,
  [51] = 51,
  [52] = 52,
  [53] = 53,
  [54] = 42,
  [55] = 43,
  [56] = 52,
  [57] = 49,
  [58] = 46,
  [59] = 50,
  [60] = 45,
  [61] = 44,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(2);
      ADVANCE_MAP(
        '(', 7,
        ')', 8,
        ',', 11,
        ';', 5,
        '=', 4,
        'f', 20,
        'l', 13,
        '{', 9,
        '}', 10,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(22);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 1:
      if (lookahead == ')') ADVANCE(8);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(22);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 2:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 3:
      ACCEPT_TOKEN(anon_sym_let);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 4:
      ACCEPT_TOKEN(anon_sym_EQ);
      END_STATE();
    case 5:
      ACCEPT_TOKEN(anon_sym_SEMI);
      END_STATE();
    case 6:
      ACCEPT_TOKEN(anon_sym_function);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 7:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 8:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 10:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 11:
      ACCEPT_TOKEN(anon_sym_COMMA);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'c') ADVANCE(19);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'e') ADVANCE(18);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'i') ADVANCE(17);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'n') ADVANCE(12);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'n') ADVANCE(6);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'o') ADVANCE(16);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 't') ADVANCE(3);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 't') ADVANCE(14);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == 'u') ADVANCE(15);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(sym_number);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(22);
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
  [13] = {.lex_state = 1},
  [14] = {.lex_state = 0},
  [15] = {.lex_state = 0},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
  [18] = {.lex_state = 0},
  [19] = {.lex_state = 0},
  [20] = {.lex_state = 0},
  [21] = {.lex_state = 0},
  [22] = {.lex_state = 0},
  [23] = {.lex_state = 0},
  [24] = {.lex_state = 0},
  [25] = {.lex_state = 1},
  [26] = {.lex_state = 1},
  [27] = {.lex_state = 1},
  [28] = {.lex_state = 0},
  [29] = {.lex_state = 1},
  [30] = {.lex_state = 0},
  [31] = {.lex_state = 0},
  [32] = {.lex_state = 0},
  [33] = {.lex_state = 0},
  [34] = {.lex_state = 0},
  [35] = {.lex_state = 0},
  [36] = {.lex_state = 0},
  [37] = {.lex_state = 0},
  [38] = {.lex_state = 1},
  [39] = {.lex_state = 0},
  [40] = {.lex_state = 0},
  [41] = {.lex_state = 1},
  [42] = {.lex_state = 0},
  [43] = {.lex_state = 0},
  [44] = {.lex_state = 1},
  [45] = {.lex_state = 0},
  [46] = {.lex_state = 0},
  [47] = {.lex_state = 0},
  [48] = {.lex_state = 0},
  [49] = {.lex_state = 0},
  [50] = {.lex_state = 1},
  [51] = {.lex_state = 0},
  [52] = {.lex_state = 0},
  [53] = {.lex_state = 0},
  [54] = {.lex_state = 0},
  [55] = {.lex_state = 0},
  [56] = {.lex_state = 0},
  [57] = {.lex_state = 0},
  [58] = {.lex_state = 0},
  [59] = {.lex_state = 1},
  [60] = {.lex_state = 0},
  [61] = {.lex_state = 1},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [anon_sym_let] = ACTIONS(1),
    [anon_sym_EQ] = ACTIONS(1),
    [anon_sym_SEMI] = ACTIONS(1),
    [anon_sym_function] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_COMMA] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [sym_number] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(51),
    [sym__statement] = STATE(4),
    [sym_variable_declaration] = STATE(4),
    [sym_function_declaration] = STATE(4),
    [sym_expression_statement] = STATE(4),
    [sym_expression] = STATE(47),
    [sym_function_call] = STATE(37),
    [aux_sym_source_file_repeat1] = STATE(4),
    [ts_builtin_sym_end] = ACTIONS(3),
    [anon_sym_let] = ACTIONS(5),
    [anon_sym_function] = ACTIONS(7),
    [sym_identifier] = ACTIONS(9),
    [sym_number] = ACTIONS(11),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(17), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(11), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [29] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(19), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(9), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [58] = 8,
    ACTIONS(5), 1,
      anon_sym_let,
    ACTIONS(7), 1,
      anon_sym_function,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(21), 1,
      ts_builtin_sym_end,
    STATE(37), 1,
      sym_function_call,
    STATE(47), 1,
      sym_expression,
    STATE(5), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [87] = 8,
    ACTIONS(23), 1,
      ts_builtin_sym_end,
    ACTIONS(25), 1,
      anon_sym_let,
    ACTIONS(28), 1,
      anon_sym_function,
    ACTIONS(31), 1,
      sym_identifier,
    ACTIONS(34), 1,
      sym_number,
    STATE(37), 1,
      sym_function_call,
    STATE(47), 1,
      sym_expression,
    STATE(5), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [116] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(37), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(9), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [145] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(39), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(6), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [174] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(37), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(10), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [203] = 8,
    ACTIONS(23), 1,
      anon_sym_RBRACE,
    ACTIONS(31), 1,
      sym_identifier,
    ACTIONS(34), 1,
      sym_number,
    ACTIONS(41), 1,
      anon_sym_let,
    ACTIONS(44), 1,
      anon_sym_function,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(9), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [232] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(47), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(9), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [261] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(49), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(9), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [290] = 8,
    ACTIONS(9), 1,
      sym_identifier,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(13), 1,
      anon_sym_let,
    ACTIONS(15), 1,
      anon_sym_function,
    ACTIONS(49), 1,
      anon_sym_RBRACE,
    STATE(37), 1,
      sym_function_call,
    STATE(48), 1,
      sym_expression,
    STATE(3), 5,
      sym__statement,
      sym_variable_declaration,
      sym_function_declaration,
      sym_expression_statement,
      aux_sym_source_file_repeat1,
  [319] = 6,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(51), 1,
      anon_sym_RPAREN,
    ACTIONS(53), 1,
      sym_identifier,
    STATE(33), 1,
      sym_expression,
    STATE(37), 1,
      sym_function_call,
    STATE(53), 1,
      sym_arguments,
  [338] = 2,
    ACTIONS(55), 2,
      ts_builtin_sym_end,
      sym_number,
    ACTIONS(57), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [348] = 2,
    ACTIONS(59), 2,
      ts_builtin_sym_end,
      sym_number,
    ACTIONS(61), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [358] = 2,
    ACTIONS(63), 2,
      ts_builtin_sym_end,
      sym_number,
    ACTIONS(65), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [368] = 2,
    ACTIONS(67), 2,
      ts_builtin_sym_end,
      sym_number,
    ACTIONS(69), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [378] = 2,
    ACTIONS(63), 2,
      anon_sym_RBRACE,
      sym_number,
    ACTIONS(65), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [388] = 2,
    ACTIONS(71), 2,
      ts_builtin_sym_end,
      sym_number,
    ACTIONS(73), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [398] = 2,
    ACTIONS(55), 2,
      anon_sym_RBRACE,
      sym_number,
    ACTIONS(57), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [408] = 2,
    ACTIONS(59), 2,
      anon_sym_RBRACE,
      sym_number,
    ACTIONS(61), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [418] = 2,
    ACTIONS(67), 2,
      anon_sym_RBRACE,
      sym_number,
    ACTIONS(69), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [428] = 2,
    ACTIONS(71), 2,
      anon_sym_RBRACE,
      sym_number,
    ACTIONS(73), 3,
      anon_sym_let,
      anon_sym_function,
      sym_identifier,
  [438] = 2,
    ACTIONS(77), 1,
      anon_sym_LPAREN,
    ACTIONS(75), 3,
      anon_sym_SEMI,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [447] = 4,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(53), 1,
      sym_identifier,
    STATE(37), 1,
      sym_function_call,
    STATE(49), 1,
      sym_expression,
  [460] = 4,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(53), 1,
      sym_identifier,
    STATE(37), 1,
      sym_function_call,
    STATE(57), 1,
      sym_expression,
  [473] = 4,
    ACTIONS(11), 1,
      sym_number,
    ACTIONS(53), 1,
      sym_identifier,
    STATE(37), 1,
      sym_function_call,
    STATE(39), 1,
      sym_expression,
  [486] = 1,
    ACTIONS(79), 3,
      anon_sym_SEMI,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [492] = 3,
    ACTIONS(81), 1,
      anon_sym_RPAREN,
    ACTIONS(83), 1,
      sym_identifier,
    STATE(46), 1,
      sym_parameters,
  [502] = 3,
    ACTIONS(85), 1,
      anon_sym_RPAREN,
    ACTIONS(87), 1,
      anon_sym_COMMA,
    STATE(31), 1,
      aux_sym_arguments_repeat1,
  [512] = 3,
    ACTIONS(89), 1,
      anon_sym_RPAREN,
    ACTIONS(91), 1,
      anon_sym_COMMA,
    STATE(31), 1,
      aux_sym_arguments_repeat1,
  [522] = 1,
    ACTIONS(94), 3,
      anon_sym_SEMI,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [528] = 3,
    ACTIONS(87), 1,
      anon_sym_COMMA,
    ACTIONS(96), 1,
      anon_sym_RPAREN,
    STATE(30), 1,
      aux_sym_arguments_repeat1,
  [538] = 3,
    ACTIONS(98), 1,
      anon_sym_RPAREN,
    ACTIONS(100), 1,
      anon_sym_COMMA,
    STATE(34), 1,
      aux_sym_parameters_repeat1,
  [548] = 3,
    ACTIONS(103), 1,
      anon_sym_RPAREN,
    ACTIONS(105), 1,
      anon_sym_COMMA,
    STATE(36), 1,
      aux_sym_parameters_repeat1,
  [558] = 3,
    ACTIONS(105), 1,
      anon_sym_COMMA,
    ACTIONS(107), 1,
      anon_sym_RPAREN,
    STATE(34), 1,
      aux_sym_parameters_repeat1,
  [568] = 1,
    ACTIONS(75), 3,
      anon_sym_SEMI,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [574] = 3,
    ACTIONS(83), 1,
      sym_identifier,
    ACTIONS(109), 1,
      anon_sym_RPAREN,
    STATE(58), 1,
      sym_parameters,
  [584] = 1,
    ACTIONS(89), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [589] = 1,
    ACTIONS(98), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [594] = 1,
    ACTIONS(111), 1,
      sym_identifier,
  [598] = 1,
    ACTIONS(113), 1,
      anon_sym_LBRACE,
  [602] = 1,
    ACTIONS(115), 1,
      anon_sym_LBRACE,
  [606] = 1,
    ACTIONS(117), 1,
      sym_identifier,
  [610] = 1,
    ACTIONS(119), 1,
      anon_sym_LPAREN,
  [614] = 1,
    ACTIONS(121), 1,
      anon_sym_RPAREN,
  [618] = 1,
    ACTIONS(123), 1,
      anon_sym_SEMI,
  [622] = 1,
    ACTIONS(125), 1,
      anon_sym_SEMI,
  [626] = 1,
    ACTIONS(127), 1,
      anon_sym_SEMI,
  [630] = 1,
    ACTIONS(129), 1,
      sym_identifier,
  [634] = 1,
    ACTIONS(131), 1,
      ts_builtin_sym_end,
  [638] = 1,
    ACTIONS(133), 1,
      anon_sym_EQ,
  [642] = 1,
    ACTIONS(135), 1,
      anon_sym_RPAREN,
  [646] = 1,
    ACTIONS(137), 1,
      anon_sym_LBRACE,
  [650] = 1,
    ACTIONS(139), 1,
      anon_sym_LBRACE,
  [654] = 1,
    ACTIONS(141), 1,
      anon_sym_EQ,
  [658] = 1,
    ACTIONS(143), 1,
      anon_sym_SEMI,
  [662] = 1,
    ACTIONS(145), 1,
      anon_sym_RPAREN,
  [666] = 1,
    ACTIONS(147), 1,
      sym_identifier,
  [670] = 1,
    ACTIONS(149), 1,
      anon_sym_LPAREN,
  [674] = 1,
    ACTIONS(151), 1,
      sym_identifier,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 29,
  [SMALL_STATE(4)] = 58,
  [SMALL_STATE(5)] = 87,
  [SMALL_STATE(6)] = 116,
  [SMALL_STATE(7)] = 145,
  [SMALL_STATE(8)] = 174,
  [SMALL_STATE(9)] = 203,
  [SMALL_STATE(10)] = 232,
  [SMALL_STATE(11)] = 261,
  [SMALL_STATE(12)] = 290,
  [SMALL_STATE(13)] = 319,
  [SMALL_STATE(14)] = 338,
  [SMALL_STATE(15)] = 348,
  [SMALL_STATE(16)] = 358,
  [SMALL_STATE(17)] = 368,
  [SMALL_STATE(18)] = 378,
  [SMALL_STATE(19)] = 388,
  [SMALL_STATE(20)] = 398,
  [SMALL_STATE(21)] = 408,
  [SMALL_STATE(22)] = 418,
  [SMALL_STATE(23)] = 428,
  [SMALL_STATE(24)] = 438,
  [SMALL_STATE(25)] = 447,
  [SMALL_STATE(26)] = 460,
  [SMALL_STATE(27)] = 473,
  [SMALL_STATE(28)] = 486,
  [SMALL_STATE(29)] = 492,
  [SMALL_STATE(30)] = 502,
  [SMALL_STATE(31)] = 512,
  [SMALL_STATE(32)] = 522,
  [SMALL_STATE(33)] = 528,
  [SMALL_STATE(34)] = 538,
  [SMALL_STATE(35)] = 548,
  [SMALL_STATE(36)] = 558,
  [SMALL_STATE(37)] = 568,
  [SMALL_STATE(38)] = 574,
  [SMALL_STATE(39)] = 584,
  [SMALL_STATE(40)] = 589,
  [SMALL_STATE(41)] = 594,
  [SMALL_STATE(42)] = 598,
  [SMALL_STATE(43)] = 602,
  [SMALL_STATE(44)] = 606,
  [SMALL_STATE(45)] = 610,
  [SMALL_STATE(46)] = 614,
  [SMALL_STATE(47)] = 618,
  [SMALL_STATE(48)] = 622,
  [SMALL_STATE(49)] = 626,
  [SMALL_STATE(50)] = 630,
  [SMALL_STATE(51)] = 634,
  [SMALL_STATE(52)] = 638,
  [SMALL_STATE(53)] = 642,
  [SMALL_STATE(54)] = 646,
  [SMALL_STATE(55)] = 650,
  [SMALL_STATE(56)] = 654,
  [SMALL_STATE(57)] = 658,
  [SMALL_STATE(58)] = 662,
  [SMALL_STATE(59)] = 666,
  [SMALL_STATE(60)] = 670,
  [SMALL_STATE(61)] = 674,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 0, 0, 0),
  [5] = {.entry = {.count = 1, .reusable = false}}, SHIFT(50),
  [7] = {.entry = {.count = 1, .reusable = false}}, SHIFT(44),
  [9] = {.entry = {.count = 1, .reusable = false}}, SHIFT(24),
  [11] = {.entry = {.count = 1, .reusable = true}}, SHIFT(37),
  [13] = {.entry = {.count = 1, .reusable = false}}, SHIFT(59),
  [15] = {.entry = {.count = 1, .reusable = false}}, SHIFT(61),
  [17] = {.entry = {.count = 1, .reusable = true}}, SHIFT(21),
  [19] = {.entry = {.count = 1, .reusable = true}}, SHIFT(23),
  [21] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [23] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0),
  [25] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(50),
  [28] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(44),
  [31] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(24),
  [34] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(37),
  [37] = {.entry = {.count = 1, .reusable = true}}, SHIFT(17),
  [39] = {.entry = {.count = 1, .reusable = true}}, SHIFT(15),
  [41] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(59),
  [44] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(61),
  [47] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [49] = {.entry = {.count = 1, .reusable = true}}, SHIFT(22),
  [51] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [53] = {.entry = {.count = 1, .reusable = true}}, SHIFT(24),
  [55] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_declaration, 5, 0, 0),
  [57] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_variable_declaration, 5, 0, 0),
  [59] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_declaration, 6, 0, 0),
  [61] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_function_declaration, 6, 0, 0),
  [63] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_expression_statement, 2, 0, 0),
  [65] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_expression_statement, 2, 0, 0),
  [67] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_declaration, 7, 0, 0),
  [69] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_function_declaration, 7, 0, 0),
  [71] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_declaration, 8, 0, 0),
  [73] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_function_declaration, 8, 0, 0),
  [75] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_expression, 1, 0, 0),
  [77] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [79] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_call, 4, 0, 0),
  [81] = {.entry = {.count = 1, .reusable = true}}, SHIFT(42),
  [83] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [85] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_arguments, 2, 0, 0),
  [87] = {.entry = {.count = 1, .reusable = true}}, SHIFT(27),
  [89] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_arguments_repeat1, 2, 0, 0),
  [91] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_arguments_repeat1, 2, 0, 0), SHIFT_REPEAT(27),
  [94] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_call, 3, 0, 0),
  [96] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_arguments, 1, 0, 0),
  [98] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0),
  [100] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_parameters_repeat1, 2, 0, 0), SHIFT_REPEAT(41),
  [103] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameters, 1, 0, 0),
  [105] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [107] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameters, 2, 0, 0),
  [109] = {.entry = {.count = 1, .reusable = true}}, SHIFT(54),
  [111] = {.entry = {.count = 1, .reusable = true}}, SHIFT(40),
  [113] = {.entry = {.count = 1, .reusable = true}}, SHIFT(7),
  [115] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [117] = {.entry = {.count = 1, .reusable = true}}, SHIFT(45),
  [119] = {.entry = {.count = 1, .reusable = true}}, SHIFT(29),
  [121] = {.entry = {.count = 1, .reusable = true}}, SHIFT(43),
  [123] = {.entry = {.count = 1, .reusable = true}}, SHIFT(16),
  [125] = {.entry = {.count = 1, .reusable = true}}, SHIFT(18),
  [127] = {.entry = {.count = 1, .reusable = true}}, SHIFT(20),
  [129] = {.entry = {.count = 1, .reusable = true}}, SHIFT(52),
  [131] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [133] = {.entry = {.count = 1, .reusable = true}}, SHIFT(26),
  [135] = {.entry = {.count = 1, .reusable = true}}, SHIFT(28),
  [137] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [139] = {.entry = {.count = 1, .reusable = true}}, SHIFT(12),
  [141] = {.entry = {.count = 1, .reusable = true}}, SHIFT(25),
  [143] = {.entry = {.count = 1, .reusable = true}}, SHIFT(14),
  [145] = {.entry = {.count = 1, .reusable = true}}, SHIFT(55),
  [147] = {.entry = {.count = 1, .reusable = true}}, SHIFT(56),
  [149] = {.entry = {.count = 1, .reusable = true}}, SHIFT(38),
  [151] = {.entry = {.count = 1, .reusable = true}}, SHIFT(60),
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
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
