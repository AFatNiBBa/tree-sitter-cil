
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

    attribute: $ => seq(
      alias(".custom", $.part_keyword),
      field("ctor", $.ref_method),
      "=",
      field("data", $.blob)
    ),

    instruction: $ => seq(
      repeat(seq(field("label", $.id_label), ":")),
      field(
        "instruction",
        choice(
          seq("call", $.ref_method),
          seq("ldc.i4.s", $.integer),
          seq("br", $.id_label),
          seq("ldstr", $.string),
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
        )
      )
    ),

    //#region ARGS

    args: $ => seq("(", optional(join(",", $.args_item)), ")"),

    args_item: $ => seq(field("type", $.type), optional(field("name", $.id_parameter))),

    //#endregion

    //#region IDENTIFIER
 
    id_namespace: $ => choice($.symbol, seq($.id_namespace, ".", $.symbol)),

    id_class: $ => $.id,

    id_member: $ => $.id,

    id_method: $ => choice($.id, alias(choice(".ctor", ".cctor"), $.part_keyword)),

    id_parameter: $ => $.symbol,

    id_label: $ => $.symbol,

    id: $ => seq(
      optional(seq(
        $.id_namespace,
        "."
      )),
      $.symbol
    ),

    //#endregion

    //#region TYPE

    type: $ => choice($.type_intrinsic, $.type_custom, seq($.type, $.type_indexer)),

    type_intrinsic: () => /void|refany|bool|bytearray|char|float|float32|float64|int|int16|int32|int64|object|int8|wchar|string|typedref/,

    type_custom: $ => seq(alias(choice("class", "valuetype"), $.part_modifier), $.ref_class),

    type_indexer: $ => seq("[", optional(join(",", optional($.type_indexer_range))), "]"),

    type_indexer_range: $ => choice(
      "...", // You can't put the upper bound alone, but you can put the dots without bounds
      seq($.integer, "...", optional($.integer))
    ),

    //#endregion

    //#region DEF

    def_module: $ => alias(
      repeat1(choice(
        $.attribute,
        $.option_module,
        $.def_assembly,
        $.def_class,
        $.def_method,
        ";"
      )),
      $.part_body
    ),

    def_assembly: $ => seq(
      alias(".assembly", $.part_keyword),
      alias(optional("extern"), $.part_modifier),
      field("name", $.id_namespace),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_assembly,
          ";"
        )),
        $.part_body
      ),
      "}"
    ),

    def_class: $ => seq(
      alias(".class", $.part_keyword),
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
        $.part_modifier
      ),
      field("name", $.id_class),
      optional(seq(alias("extends", $.part_modifier), field("base", $.ref_class))),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_type,
          $.def_class,
          $.def_method,
          ";"
        )),
        $.part_body
      ),
      "}"
    ),

    def_method: $ => seq(
      alias(".method", $.part_keyword),
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
        $.part_modifier
      ),
      field("return", $.type),
      field("name", $.id_method),
      $.args,
      alias(
        repeat(choice(
          "cil",
          "managed"
        )),
        $.part_modifier
      ),
      "{",
      alias(
        repeat(choice(
          $.attribute,
          $.option_method,
          $.instruction,
          ";"
        )),
        $.part_body
      ),
      "}"
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", field("name", $.id_namespace), "]"),

    ref_class: $ => seq(optional(field("assembly", $.ref_assembly)), field("name", $.id_class)),

    ref_member: $ => seq(
      field("return", $.type),
      field("parent", $.ref_class),
      "::",
      field("name", $.id_member)
    ),

    ref_method: $ => seq(
      alias(optional("instance"), $.part_modifier),
      field("return", $.type),
      optional(seq(
        field("parent", $.ref_class),
        "::"
      )),
      field("name", $.id_method),
      $.args
    ),

    //#endregion

    //#region OPTION

    option_module: $ => choice(
      seq(alias(seq(".file", "alignment"), $.part_keyword), $.integer),
      seq(alias(".imagebase", $.part_keyword), $.integer),
      seq(alias(".stackreserve", $.part_keyword), $.integer),
      seq(alias(".subsystem", $.part_keyword), $.integer),
      seq(alias(".corflags", $.part_keyword), $.integer),
      seq(
        alias(".module", $.part_keyword),
        alias(optional("extern"), $.part_modifier),
        $.id_namespace
      ),
    ),

    option_assembly: $ => choice(
      seq(alias(seq(".hash", "algorithm"), $.part_keyword), $.integer),
      seq(alias(".publickeytoken", $.part_keyword), "=", $.blob),
      seq(alias(".ver", $.part_keyword), $.version)
    ),

    option_type: $ => choice(
      seq(alias(".pack", $.part_keyword), $.integer),
      seq(alias(".size", $.part_keyword), $.integer)
    ),

    option_method: $ => choice(
      seq(alias(seq(".locals", "init"), $.part_keyword), $.args),
      seq(alias(".maxstack", $.part_keyword), $.integer),
      alias(".entrypoint", $.part_keyword)
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

    byte: () => token(seq(HEX_DIGIT, HEX_DIGIT)),

    integer: () => token(choice(/\d+/, seq("0x", repeat1(HEX_DIGIT)))),

    version: () => token(seq(/\d+/, ":", /\d+/, ":", /\d+/, ":", /\d+/)),

    symbol: () => token(choice(
      seq("'", repeat(/[^']|\\./), "'"),
      /[a-z_][a-z0-9_]*/i
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