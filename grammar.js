
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

    blob: $ => seq("(", repeat($.byte), ")"),

    attribute: $ => seq(".custom", field("ctor", $.ref_method), "=", field("data", $.blob)),

    instruction: $ => seq(
      repeat(seq(field("label", $.identifier), ":")),
      field(
        "instruction",
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
      )
    ),

    //#region ARGS

    args: $ => seq("(", optional(join(",", $.args_item)), ")"),

    args_item: $ => seq(field("type", $.type), optional(field("name", $.identifier))),

    //#endregion

    //#region TYPE

    type: $ => choice($.type_intrinsic, $.type_custom, seq($.type, $.type_indexer)),

    type_intrinsic: () => /void|refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/,

    type_custom: $ => seq(alias(choice("class", "valuetype"), $.modifier), $.ref_type),

    type_indexer: $ => seq("[", optional(join(",", optional($.type_indexer_range))), "]"),

    type_indexer_range: $ => choice(
      "...", // You can't put the upper bound alone, but you can put the dots without bounds
      seq($.integer, "...", optional($.integer))
    ),

    //#endregion

    //#region DEF

    def_module: $ => repeat1(choice(
      $.attribute,
      $.option_module,
      $.def_assembly,
      $.def_type
    )),

    def_assembly: $ => seq(
      ".assembly",
      alias(optional("extern"), $.modifier),
      field("name", $.identifier),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_assembly
        )),
        $.body
      ),
      "}"
    ),

    def_type: $ => seq(
      ".class",
      alias(
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
        $.modifier
      ),
      field("name", $.identifier),
      optional(seq("extends", field("base", $.ref_type))),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_type,
          $.def_type,
          $.def_method
        )),
        $.body
      ),
      "}"
    ),

    def_method: $ => seq(
      ".method",
      alias(
        repeat(choice(
          "hidebysig",
          "instance",
          "private",
          "public",
          "rtspecialname",
          "specialname",
          "static"
        )),
        $.modifier
      ),
      field("return", $.type),
      field("name", $.identifier),
      $.args,
      alias(
        repeat(choice(
          "cil",
          "managed"
        )),
        $.modifier
      ),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_method,
          $.instruction
        )),
        $.body
      ),
      "}"
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", field("name", $.identifier), "]"),

    ref_type: $ => seq(optional(field("assembly", $.ref_assembly)), field("name", $.identifier)),

    ref_member: $ => seq(
      field("return", $.type),
      field("parent", $.ref_type),
      "::",
      field("name", $.identifier)
    ),

    ref_method: $ => seq(
      alias(optional("instance"), $.modifier),
      $.ref_member,
      $.args
    ),

    //#endregion

    //#region OPTION

    option_module: $ => choice(
      seq(".module", alias(optional("extern"), $.modifier), $.identifier),
      seq(".file", "alignment", $.integer),
      seq(".imagebase", $.integer),
      seq(".stackreserve", $.integer),
      seq(".subsystem", $.integer),
      seq(".corflags", $.integer),
    ),

    option_assembly: $ => choice(
      seq(".hash", "algorithm", $.integer),
      seq(".publickeytoken", "=", $.blob),
      seq(".ver", $.version),
    ),

    option_type: $ => choice(
      seq(".pack", $.integer),
      seq(".size", $.integer),
    ),

    option_method: $ => choice(
      seq(".locals", "init", $.args),
      seq(".maxstack", $.integer),
      seq(".entrypoint"),
    ),

    //#endregion

    //#region TOKEN

    byte: () => token(seq(HEX_DIGIT, HEX_DIGIT)),

    integer: () => token(choice(/\d+/, seq("0x", repeat1(HEX_DIGIT)))),

    version: () => token(seq(/\d+/, ":", /\d+/, ":", /\d+/, ":", /\d+/)),

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