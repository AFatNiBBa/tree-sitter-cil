
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
  extras: $ => [ /\s+/, $.comment ],

  rules: {
    file: $ => optional($.def_module),

    blob: () => seq("(", repeat(token(seq(HEX_DIGIT, HEX_DIGIT))), ")"),

    attribute: $ => seq(".custom", $.ref_method, "=", $.blob),

    type: $ => choice(
      /void|refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/,
      seq(choice("class", "valuetype"), $.ref_type),
      seq(
        $.type,
        "[",
        optional(join(
          ",",
          optional(choice(
            "...", // You can't put the upper bound alone, but you can put the dots without bounds
            seq(
              $.integer,
              "...",
              optional($.integer)
            )
          ))
        )),
        "]"
      )
    ),

    instruction: $ => seq(
      repeat(seq($.identifier, ":")),
      choice(
        seq("call", $.ref_method),
        seq("ldc.i4.s", $.integer),
        seq("br", $.identifier),
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
      )
    ),

    //#region ARGS

    args_item: $ => seq($.type, optional($.identifier)),

    args_list: $ => seq(
      "(",
      optional(join(",", $.args_item)),
      ")"
    ),

    //#endregion

    //#region DEF

    def_module: $ => repeat1(choice(
      $.option_module,
      $.def_assembly,
      $.def_type
    )),

    def_assembly: $ => seq(
      ".assembly",
      optional("extern"),
      $.identifier,
      "{",
      repeat($.option_assembly),
      "}"
    ),

    def_type: $ => seq(
      ".class",
      repeat(choice(
        "abstract",
        "ansi",
        "assembly",
        "auto",
        "beforefieldinit",
        "interface",
        "nested",
        "private",
        "public",
        "sealed",
        "sequential"
      )),
      $.identifier,
      optional(seq("extends", $.ref_type)),
      "{",
      repeat(choice(
        $.option_type,
        $.def_type,
        $.def_method
      )),
      "}"
    ),

    def_method: $ => seq(
      ".method",
      repeat(choice(
        "hidebysig",
        "instance",
        "private",
        "public",
        "rtspecialname",
        "specialname",
        "static"
      )),
      $.type,
      $.identifier,
      $.args_list,
      repeat(choice(
        "cil",
        "managed"
      )),
      "{",
      repeat(choice(
        $.option_method,
        $.instruction
      )),
      "}"
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", $.identifier, "]"),

    ref_type: $ => seq(optional($.ref_assembly), $.identifier),

    ref_member: $ => seq(
      $.type,
      $.ref_type,
      "::",
      $.identifier
    ),

    ref_method: $ => seq(
      optional("instance"),
      $.ref_member,
      $.args_list
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

    option_type: $ => choice(
      $.attribute,
      seq(".pack", $.integer),
      seq(".size", $.integer),
    ),

    option_method: $ => choice(
      $.attribute,
      seq(".locals", "init", $.args_list),
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