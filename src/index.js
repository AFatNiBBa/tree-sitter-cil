
//@ts-check

/// <reference types="tree-sitter-cli/dsl" />

const HEX_DIGIT = /[a-f\d_]/i, IDENTIFIER = /[a-z_][a-z0-9_]*/i;

module.exports = grammar({
  name: "cil",
  extras: $ => [ /\s/, $.comment ],

  rules: {
    file: $ => optional($.def_module),

    attribute: $ => seq(".custom", $.ref_method, "=", $.blob),

    type: $ => choice(
      /refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/,
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

    ref_assembly: $ => seq("[", $.namespace, "]"),

    ref_type: $ => seq($.ref_assembly, $.namespace),

    ref_method: $ => seq(
      optional("instance"),
      $.type,
      $.ref_type,
      "::",
      $.identifier,
      "(",
      optional(seq(
        $.type,
        repeat(seq(",", $.type))
      )),
      ")"
    ),

    //#endregion

    //#region OPTION

    option_module: $ => choice(
      $.attribute,
      seq(".file", "alignment", "=", $.integer),
      seq(".imagebase", "=", $.integer),
      seq(".stackreserve", "=", $.integer),
      seq(".subsystem", "=", $.integer),
      seq(".corflags", "=", $.integer),
    ),

    option_assembly: $ => choice(
      $.attribute,
      seq(".hash", "algorithm", "=", $.integer),
      seq(".publickeytoken", "=", $.blob),
      seq(".ver", "=", $.version),
    ),

    option_method: $ => choice(
      $.attribute,
      seq(".maxstack", $.integer),
      seq(".entrypoint"),
    ),

    //#endregion

    //#region TOKEN

    blob: () => token(seq("(", repeat(seq(HEX_DIGIT, HEX_DIGIT)), ")")),

    version: () => token(seq(/\d+/, ":", /\d+/, ":", /\d+/, ":", /\d+/)),

    integer: () => token(choice(/\d+/, seq("0x", repeat1(HEX_DIGIT)))),

    namespace: () => token(seq(IDENTIFIER, repeat(seq(".", IDENTIFIER)))),

    identifier: () => token(choice(
      seq(optional("."), IDENTIFIER),
      seq("'", repeat(/[^']|\\./), "'")
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