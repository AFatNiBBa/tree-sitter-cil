
//@ts-check

/// <reference types="tree-sitter-cli/dsl" />

const HEX_DIGIT = /[a-f\d_]/i;

/**
 * Utility function that allows to define a repeating rule with a separator between each element
 * @param {RuleOrLiteral} sep The rule to use as separator
 * @param {RuleOrLiteral} rule The rule to repeat
 */
const join = (sep, rule) => seq(rule, repeat(seq(sep, rule)));

module.exports = grammar({
  name: "cil",
  extras: $ => [ /\s/, $.comment ],

  rules: {
    file: $ => optional($.def_module),

    blob: () => seq("(", repeat(token(seq(HEX_DIGIT, HEX_DIGIT))), ")"),

    attribute: $ => seq(".custom", $.ref_method, "=", $.blob),

    type: $ => choice(
      /void|refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/,
      seq(choice("class", "valuetype"), $.ref_type)
    ),

    //#region DEF

    def_module: $ => repeat1(choice(
      $.option_module,
      $.def_assembly
    )),

    def_assembly: $ => seq(
      ".assembly",
      optional("extern"),
      $.identifier,
      "{",
      repeat($.option_assembly),
      "}"
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", $.identifier, "]"),

    ref_type: $ => seq($.ref_assembly, $.identifier),

    ref_method: $ => seq(
      optional("instance"),
      $.type,
      $.ref_type,
      "::",
      $.identifier,
      "(",
      optional(join(",", $.type)),
      ")"
    ),

    //#endregion

    //#region OPTION

    option_module: $ => choice(
      $.attribute,
      seq(".module", optional("extern"), $.identifier),
      seq(".file", "alignment", $.integer),
      seq(".imagebase", $.integer),
      seq(".stackreserve", $.integer),
      seq(".subsystem", $.integer),
      seq(".corflags", $.integer),
    ),

    option_assembly: $ => choice(
      $.attribute,
      seq(".hash", "algorithm", $.integer),
      seq(".publickeytoken", "=", $.blob),
      seq(".ver", $.version),
    ),

    option_method: $ => choice(
      $.attribute,
      seq(".maxstack", $.integer),
      seq(".entrypoint"),
    ),

    //#endregion

    //#region TOKEN

    version: () => token(seq(/\d+/, ":", /\d+/, ":", /\d+/, ":", /\d+/)),

    integer: () => token(choice(/\d+/, seq("0x", repeat1(HEX_DIGIT)))),

    identifier: () => token(join(
      ".",
      choice(
        seq("'", repeat(/[^']|\\./), "'"),
        /[a-z_][a-z0-9_]*/i,
        ".cctor",
        ".ctor"
      )
    )),

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