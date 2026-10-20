
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
        seq(alias(choice("call", "callvirt", "newobj", "jmp", "ldftn", "ldvirtftn"), $.instruction), $.ref_method),
        seq(alias(choice("ldfld", "ldflda", "stfld", "ldsfld", "ldsflda", "stsfld"), $.instruction), $.ref_member),
        seq(alias(choice("ldc.i4", "ldc.i4.s", "ldc.i8", "unaligned.", "no."), $.instruction), $.integer),
        seq(
          alias(
            choice(
              "ldarg", "ldarg.s", "ldarga", "ldarga.s", "starg", "starg.s",
              "ldloc", "ldloc.s", "ldloca", "ldloca.s", "stloc", "stloc.s"
            ),
            $.instruction
          ),
          choice($.integer, $.id_parameter)
        ),
        seq(
          alias(
            choice(
              "br", "br.s", "brfalse", "brfalse.s", "brnull", "brnull.s", "brzero", "brzero.s",
              "brtrue", "brtrue.s", "brinst", "brinst.s", "beq", "beq.s", "bne.un", "bne.un.s",
              "bge", "bge.s", "bge.un", "bge.un.s", "bgt", "bgt.s", "bgt.un", "bgt.un.s",
              "ble", "ble.s", "ble.un", "ble.un.s", "blt", "blt.s", "blt.un", "blt.un.s",
              "leave", "leave.s"
            ),
            $.instruction
          ),
          $.id_label
        ),
        seq(alias("switch", $.instruction), "(", optional(join(",", $.id_label)), ")"),
        seq(
          alias(
            choice(
              "box", "unbox", "unbox.any", "castclass", "isinst", "newarr", "initobj", "ldobj", "stobj", "cpobj",
              "sizeof", "mkrefany", "refanyval", "ldelem", "ldelema", "stelem", "constrained."
            ),
            $.instruction
          ),
          choice($.type, $.ref_class) // The type token can omit "class" and "valuetype"
        ),
        seq(alias("ldstr", $.instruction), $.string),
        alias(
          choice(
            "nop", "break", "ret", "dup", "pop", "throw", "rethrow", "endfinally", "endfault", "endfilter", "arglist", "localloc",
            "ldarg.0", "ldarg.1", "ldarg.2", "ldarg.3",
            "ldloc.0", "ldloc.1", "ldloc.2", "ldloc.3",
            "stloc.0", "stloc.1", "stloc.2", "stloc.3",
            "ldnull", "ldc.i4.m1", "ldc.i4.M1", "ldc.i4.0", "ldc.i4.1", "ldc.i4.2", "ldc.i4.3", "ldc.i4.4", "ldc.i4.5", "ldc.i4.6", "ldc.i4.7", "ldc.i4.8",
            "add", "add.ovf", "add.ovf.un", "sub", "sub.ovf", "sub.ovf.un", "mul", "mul.ovf", "mul.ovf.un",
            "div", "div.un", "rem", "rem.un", "neg", "and", "or", "xor", "not", "shl", "shr", "shr.un",
            "ceq", "cgt", "cgt.un", "clt", "clt.un", "ckfinite",
            "conv.i", "conv.i1", "conv.i2", "conv.i4", "conv.i8", "conv.u", "conv.u1", "conv.u2", "conv.u4", "conv.u8", "conv.r4", "conv.r8", "conv.r.un",
            "conv.ovf.i", "conv.ovf.i1", "conv.ovf.i2", "conv.ovf.i4", "conv.ovf.i8", "conv.ovf.u", "conv.ovf.u1", "conv.ovf.u2", "conv.ovf.u4", "conv.ovf.u8",
            "conv.ovf.i.un", "conv.ovf.i1.un", "conv.ovf.i2.un", "conv.ovf.i4.un", "conv.ovf.i8.un", "conv.ovf.u.un", "conv.ovf.u1.un", "conv.ovf.u2.un", "conv.ovf.u4.un", "conv.ovf.u8.un",
            "ldind.i", "ldind.i1", "ldind.i2", "ldind.i4", "ldind.i8", "ldind.u1", "ldind.u2", "ldind.u4", "ldind.u8", "ldind.r4", "ldind.r8", "ldind.ref",
            "stind.i", "stind.i1", "stind.i2", "stind.i4", "stind.i8", "stind.r4", "stind.r8", "stind.ref",
            "ldelem.i", "ldelem.i1", "ldelem.i2", "ldelem.i4", "ldelem.i8", "ldelem.u1", "ldelem.u2", "ldelem.u4", "ldelem.u8", "ldelem.r4", "ldelem.r8", "ldelem.ref",
            "stelem.i", "stelem.i1", "stelem.i2", "stelem.i4", "stelem.i8", "stelem.r4", "stelem.r8", "stelem.ref",
            "ldlen", "cpblk", "initblk", "refanytype",
            "tail.", "volatile.", "readonly."
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

    ref_class: $ => seq(optional($.ref_assembly), join("/", $.id_class)),

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
      seq(alias(choice(".hash", ".publickey", ".publickeytoken"), $.keyword), "=", $.blob),
      seq(alias(choice(".culture", ".locale"), $.keyword), $.string),
      seq(alias(".ver", $.keyword), $.version)
    ),

    option_type: $ => choice(
      seq(alias(".pack", $.keyword), $.integer),
      seq(alias(".size", $.keyword), $.integer),
    ),

    option_method: $ => choice(
      seq(alias(choice(".locals", seq(".locals", "init")), $.keyword), $.args),
      seq(alias(choice(".maxstack", ".emitbyte"), $.keyword), $.integer),
      alias(".entrypoint", $.keyword)
    ),

    //#endregion

    //#region STRING

    string: $ => join("+", $.string_single),

    string_content: () => token.immediate(/[^"\\\n]+/),

    string_escape: () => token.immediate(/\\./),

    string_single: $ => seq(
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