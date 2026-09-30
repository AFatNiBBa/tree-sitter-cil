
// @ts-check

/// <reference types="tree-sitter-cli/dsl" />

/** A single hexadecimal digit, case-insensitive, with optional underscores */
const REGEX_HEX_DIGIT = /[a-f\d]/i;

/** A decimal sequence of digits */
const REGEX_NUMBER = /\d+/;

/**
 * Utility function that allows to define a repeating rule with a separator between each element
 * @param {RuleOrLiteral} sep The rule to use as separator
 * @param {RuleOrLiteral} rule The rule to repeat
 */
const join = (sep, rule) => seq(rule, repeat(seq(sep, rule)));

// Grammar for .NET's Common Intermediate Language
export default grammar({
  name: "cil",
  extras: $ => [ /\s+/, $.comment ],

  rules: {
    file: $ => optional($.def_module),

    //#region UTIL

    blob: $ => seq("(", repeat($.byte), ")"),

    nesting: $ => choice($.symbol, seq($.nesting, ".", $.symbol)),

    symbol: $ => choice($.word, $.quoted),

    modifier: $ => $.word,

    //#endregion

    //#region COMMON

    attribute: $ => seq(
      alias(".custom", $.keyword),
      $.ref_method,
      "=",
      $.blob
    ),

    statement: $ => seq(
      repeat(seq($.id_label, ":")),
      choice(
        seq(alias("call", $.instruction), $.ref_method),
        seq(alias("ldc.i4.s", $.instruction), $.integer),
        seq(alias("br", $.instruction), $.id_label),
        seq(alias("ldstr", $.instruction), $.string),
        alias(
          choice(
            "ldarg.0",
            "stloc.0",
            "stloc.1",
            "ldloc.0",
            "ldloc.1",
            "ldc.i4.1",
            "add",
            "conv.u2",
            "ret",
            "nop",
            "pop"
          ),
          $.instruction
        )
      )
    ),

    //#endregion

    //#region ARGS

    args: $ => seq("(", optional(join(",", $.args_item)), ")"),

    args_item: $ => seq($.type, optional($.id_parameter)),

    //#endregion

    //#region IDENTIFIER

    id_assembly: $ => $.id,
 
    id_class: $ => $.id,

    id_member: $ => $.id,

    id_method: $ => choice($.id, alias(choice(".ctor", ".cctor"), $.keyword)),

    id_parameter: $ => $.symbol,

    id_label: $ => $.symbol,

    id: $ => seq(
      optional(seq(
        $.nesting,
        "."
      )),
      $.symbol
    ),

    //#endregion

    //#region TYPE

    type: $ => choice($.intrinsic, $.type_custom, seq($.type, $.type_indexer)),

    type_custom: $ => seq(alias(choice("class", "valuetype"), $.modifier), $.ref_class),

    type_indexer: $ => seq("[", optional(join(",", optional(choice($.integer, $.type_indexer_range)))), "]"),

    type_indexer_range: $ => seq(optional($.integer), "...", optional($.integer)),

    //#endregion

    //#region DEF

    def_module: $ => repeat1(choice(
      $.attribute,
      $.option_module,
      $.def_assembly,
      $.def_class,
      $.def_method,
      ";"
    )),

    def_assembly: $ => seq(
      alias(".assembly", $.keyword),
      alias(optional("extern"), $.modifier),
      $.id_assembly,
      "{",
      repeat(choice(
        $.attribute,
        $.option_assembly,
        ";"
      )),
      "}"
    ),

    def_class: $ => seq(
      alias(".class", $.keyword),
      repeat($.modifier),
      $.id_class,
      optional(seq(alias("extends", $.modifier), $.ref_class)),
      "{",
      repeat(choice(
        $.attribute,
        $.option_type,
        $.def_class,
        $.def_field,
        $.def_method,
        ";"
      )),
      "}"
    ),

    def_field: $ => seq(
      alias(".field", $.keyword),
      repeat($.modifier),
      $.type,
      $.id_member
    ),

    def_method: $ => seq(
      alias(".method", $.keyword),
      repeat($.modifier),
      $.type,
      $.id_method,
      $.args,
      repeat($.modifier),
      "{",
      repeat(choice(
        $.attribute,
        $.option_method,
        $.statement,
        ";"
      )),
      "}"
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", $.id_assembly, "]"),

    ref_class: $ => seq(optional($.ref_assembly), $.id_class),

    ref_member: $ => seq($.type, $.ref_class, "::", $.id_member),

    ref_method: $ => seq(
      alias(optional("instance"), $.modifier),
      $.type,
      optional(seq($.ref_class, "::")),
      $.id_method,
      $.args
    ),

    //#endregion

    //#region OPTION

    option_module: $ => choice(
      seq(alias(seq(".file", "alignment"), $.keyword), $.integer),
      seq(alias(".imagebase", $.keyword), $.integer),
      seq(alias(".stackreserve", $.keyword), $.integer),
      seq(alias(".subsystem", $.keyword), $.integer),
      seq(alias(".corflags", $.keyword), $.integer),
      seq(
        alias(".module", $.keyword),
        alias(optional("extern"), $.modifier),
        $.id_assembly
      ),
    ),

    option_assembly: $ => choice(
      seq(alias(seq(".hash", "algorithm"), $.keyword), $.integer),
      seq(alias(".publickeytoken", $.keyword), "=", $.blob),
      seq(alias(".ver", $.keyword), $.version)
    ),

    option_type: $ => choice(
      seq(alias(".pack", $.keyword), $.integer),
      seq(alias(".size", $.keyword), $.integer),
    ),

    option_method: $ => choice(
      seq(alias(seq(".locals", "init"), $.keyword), $.args),
      seq(alias(".maxstack", $.keyword), $.integer),
      alias(".entrypoint", $.keyword)
    ),

    //#endregion

    //#region STRING

    string_content: () => token.immediate(/[^"\\\n]+/),

    string_escape: () => token.immediate(/\\./),

    string: $ => seq(
      '"',
      repeat(choice($.string_content, $.string_escape)), // I don't wrap everything in a single token because I want to be able to highlight these two differently
      token.immediate('"')
    ),

    //#endregion

    //#region TOKEN

    byte: () => token(seq(REGEX_HEX_DIGIT, REGEX_HEX_DIGIT)),

    integer: () => token(choice(REGEX_NUMBER, seq("0x", repeat1(REGEX_HEX_DIGIT)))),

    version: () => token(seq(REGEX_NUMBER, ":", REGEX_NUMBER, ":", REGEX_NUMBER, ":", REGEX_NUMBER)),

    intrinsic: () => token(/void|refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/),

    word: () => token(/[a-z_][a-z0-9_]*/i),

    quoted: () => token(seq("'", repeat(/[^']|\\./), "'")),

    comment: () => token(choice(
      seq("//", /.*/),
      seq(
        "/*",
        repeat(choice(/[^*]*/, /\*+[^/]/)),
        "*/"
      )
    ))

    //#endregion
  }
});