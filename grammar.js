
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

/**
 * Calling convention of a method signature
 * @param {GrammarSymbols<string>} $ The grammar symbols
 */
const callConv = $ => repeat(alias(choice("instance", "explicit", "default", "vararg", "unmanaged", "cdecl", "stdcall", "thiscall", "fastcall"), $.modifier));

/**
 * Target of a branch, which can be either a label or an offset
 * @param {GrammarSymbols<string>} $ The grammar symbols
 */
const target = $ => choice($.id_label, $.integer);

/**
 * Elements that can appear at the top level of a module or inside of a namespace
 * @param {GrammarSymbols<string>} $ The grammar symbols
 */
const moduleDecls = $ => choice(
  $.attribute,
  $.option_module,
  $.option_security,
  $.option_source,
  $.def_assembly,
  $.def_resource,
  $.def_export,
  $.def_namespace,
  $.def_class,
  $.def_field,
  $.def_method,
  $.def_data,
  ";"
);

/**
 * Elements that can appear inside of the body of a method or of one of its blocks
 * @param {GrammarSymbols<string>} $ The grammar symbols
 */
const methodDecls = $ => choice(
  $.attribute,
  $.option_method,
  $.option_param,
  $.option_security,
  $.option_source,
  $.statement,
  $.block,
  $.block_try,
  $.def_data,
  ";"
);

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

    bytearray: $ => seq(alias("bytearray", $.intrinsic), $.blob),

    constant: $ => choice(
      $.string,
      $.bytearray,
      alias("nullref", $.keyword),
      seq($.intrinsic, "(", choice($.integer, $.float, $.quoted, alias(choice("true", "false"), $.keyword)), ")")
    ),

    marshal: $ => seq(
      alias("marshal", $.keyword),
      "(",
      repeat(choice($.intrinsic, $.modifier, $.string, $.integer, "*", "&", "[", "]", "+", ",", seq("(", repeat(choice($.string, ",")), ")"))), // The native type is kept loose on purpose
      ")"
    ),

    pinvokeimpl: $ => seq(
      alias("pinvokeimpl", $.keyword),
      "(",
      optional(seq($.string, optional(seq(alias("as", $.modifier), $.string)))),
      repeat($.modifier),
      ")"
    ),

    //#endregion

    //#region COMMON

    attribute: $ => seq(
      alias(".custom", $.keyword),
      optional(seq(
        "(",
        choice(
          $.ref_assembly,
          $.ref_class,
          $.type,
          seq(alias("method", $.keyword), $.ref_method),
          seq(alias("field", $.keyword), $.ref_member)
        ),
        ")"
      )),
      $.ref_method,
      optional(seq("=", choice($.blob, $.string)))
    ),

    statement: $ => seq(
      repeat(seq($.id_label, ":")),
      choice(
        seq(alias(choice("call", "callvirt", "newobj", "jmp", "ldftn", "ldvirtftn"), $.instruction), $.ref_method),
        seq(alias(choice("ldfld", "ldflda", "stfld", "ldsfld", "ldsflda", "stsfld"), $.instruction), $.ref_member),
        seq(alias(choice("ldc.i4", "ldc.i4.s", "ldc.i8", "unaligned.", "no."), $.instruction), $.integer),
        seq(alias(choice("ldc.r4", "ldc.r8"), $.instruction), choice($.float, $.integer, $.blob, seq($.intrinsic, "(", $.integer, ")"))),
        seq(alias("calli", $.instruction), callConv($), $.type, $.args),
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
          target($)
        ),
        seq(alias("switch", $.instruction), "(", optional(join(",", target($))), ")"),
        seq(
          alias(
            choice(
              "box", "unbox", "unbox.any", "castclass", "isinst", "newarr", "initobj", "ldobj", "stobj", "cpobj",
              "sizeof", "mkrefany", "refanyval", "ldelem", "ldelema", "stelem", "ldelem.any", "stelem.any", "constrained."
            ),
            $.instruction
          ),
          choice($.type, $.ref_class) // The type token can omit "class" and "valuetype"
        ),
        seq(
          alias("ldtoken", $.instruction),
          choice(
            $.type,
            $.ref_class,
            seq(alias("method", $.keyword), $.ref_method),
            seq(alias("field", $.keyword), $.ref_member)
          )
        ),
        seq(alias("ldstr", $.instruction), choice($.string, $.bytearray)),
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

    data_item: $ => choice(
      seq($.intrinsic, "*", "(", $.string, ")"),
      seq("&", "(", $.id_label, ")"),
      $.bytearray,
      seq($.intrinsic, optional(seq("(", choice($.integer, $.float), ")")), optional(seq("[", $.integer, "]")))
    ),

    named_value: $ => seq(
      $.string,
      "=",
      choice(
        alias(choice("true", "false"), $.keyword),
        $.integer,
        $.string,
        seq($.intrinsic, "(", $.integer, ")"),
        seq($.ref_class, "(", optional(seq($.intrinsic, ":")), $.integer, ")")
      )
    ),

    named_arg: $ => seq(
      alias(choice("property", "field"), $.modifier),
      optional(alias("enum", $.modifier)),
      choice($.type, $.ref_class),
      $.id_member,
      "=",
      $.constant
    ),

    //#endregion

    //#region ARGS

    args: $ => seq("(", optional(join(",", choice($.args_item, "..."))), ")"),

    args_item: $ => seq(
      repeat(seq("[", choice(alias(choice("in", "out", "opt"), $.modifier), $.integer), "]")), // Parameter attributes and local indexes
      $.type,
      optional($.marshal),
      optional($.id_parameter)
    ),

    generics: $ => seq("<", join(",", $.generics_item), ">"),

    generics_item: $ => seq(
      repeat(choice(alias(choice("class", "valuetype", ".ctor"), $.modifier), "+", "-")),
      optional(seq("(", join(",", choice($.type, $.ref_class)), ")")),
      $.id_generic
    ),

    //#endregion

    //#region IDENTIFIER

    id_assembly: $ => $.id,

    id_namespace: $ => $.id,

    id_class: $ => $.id,

    id_member: $ => $.id,

    id_method: $ => choice($.id, alias(choice(".ctor", ".cctor"), $.keyword)),

    id_parameter: $ => $.symbol,

    id_label: $ => $.symbol,

    id_generic: $ => $.symbol,

    id: $ => seq(
      optional(seq(
        $.nesting,
        "."
      )),
      $.symbol
    ),

    //#endregion

    //#region TYPE

    type: $ => choice(
      $.intrinsic,
      $.type_custom,
      $.type_parameter,
      $.type_method,
      seq($.type, $.type_indexer),
      seq($.type, choice("&", "*")),
      seq($.type, alias("pinned", $.modifier)),
      seq($.type, alias(choice("modreq", "modopt"), $.modifier), "(", choice($.ref_class, $.type), ")")
    ),

    type_custom: $ => seq(alias(choice("class", "valuetype", seq("value", "class")), $.modifier), $.ref_class, optional($.type_args)),

    type_args: $ => seq("<", join(",", $.type), ">"),

    type_method: $ => seq(alias("method", $.keyword), callConv($), $.type, "*", $.args),

    type_parameter: $ => choice(
      token(seq(choice("!", "!!"), REGEX_NUMBER)),
      seq(choice("!", "!!"), $.id_generic)
    ),

    type_indexer: $ => seq("[", optional(join(",", optional(choice($.integer, $.type_indexer_range)))), "]"),

    type_indexer_range: $ => seq(optional($.integer), "...", optional($.integer)),

    //#endregion

    //#region DEF

    def_module: $ => repeat1(moduleDecls($)),

    def_namespace: $ => seq(
      alias(".namespace", $.keyword),
      $.id_namespace,
      "{",
      repeat(moduleDecls($)),
      "}"
    ),

    def_assembly: $ => seq(
      alias(".assembly", $.keyword),
      repeat($.modifier),
      $.id_assembly,
      optional(seq(alias("as", $.modifier), $.id_assembly)),
      "{",
      repeat(choice(
        $.attribute,
        $.option_assembly,
        $.option_security,
        $.option_source,
        ";"
      )),
      "}"
    ),

    def_resource: $ => seq(
      alias(".mresource", $.keyword),
      repeat($.modifier),
      $.id_assembly,
      "{",
      repeat(choice(
        $.attribute,
        $.option_manifest,
        ";"
      )),
      "}"
    ),

    def_export: $ => seq(
      alias(choice(seq(".class", "extern"), ".export"), $.keyword),
      repeat($.modifier),
      $.id_class,
      "{",
      repeat(choice(
        $.attribute,
        $.option_manifest,
        ";"
      )),
      "}"
    ),

    def_class: $ => seq(
      alias(".class", $.keyword),
      repeat($.modifier),
      $.id_class,
      optional($.generics),
      optional(seq(alias("extends", $.modifier), choice($.ref_class, $.type))),
      optional(seq(alias("implements", $.modifier), join(",", choice($.ref_class, $.type)))),
      "{",
      repeat(choice(
        $.attribute,
        $.option_type,
        $.option_param,
        $.option_security,
        $.option_source,
        $.def_class,
        $.def_export,
        $.def_field,
        $.def_method,
        $.def_property,
        $.def_event,
        $.def_data,
        ";"
      )),
      "}"
    ),

    def_field: $ => seq(
      alias(".field", $.keyword),
      optional(seq("[", $.integer, "]")),
      repeat(choice($.modifier, $.marshal)),
      $.type,
      $.id_member,
      optional(seq(alias("at", $.modifier), $.id_label)),
      optional(seq("=", $.constant))
    ),

    def_method: $ => seq(
      alias(".method", $.keyword),
      repeat(choice($.modifier, $.pinvokeimpl)),
      $.type,
      optional($.marshal),
      $.id_method,
      optional($.generics),
      $.args,
      repeat($.modifier),
      "{",
      repeat(methodDecls($)),
      "}"
    ),

    def_property: $ => seq(
      alias(".property", $.keyword),
      repeat($.modifier),
      $.type,
      $.id_member,
      $.args,
      optional(seq("=", $.constant)),
      "{",
      repeat(choice(
        $.attribute,
        $.option_property,
        $.option_source,
        ";"
      )),
      "}"
    ),

    def_event: $ => seq(
      alias(".event", $.keyword),
      repeat(alias(choice("specialname", "rtspecialname"), $.modifier)),
      optional(choice($.ref_class, $.type)),
      $.id_member,
      "{",
      repeat(choice(
        $.attribute,
        $.option_event,
        $.option_source,
        ";"
      )),
      "}"
    ),

    def_data: $ => seq(
      alias(".data", $.keyword),
      optional(alias(choice("tls", "cil"), $.modifier)),
      optional(seq($.id_label, "=")),
      choice(
        seq("{", optional(join(",", $.data_item)), "}"),
        $.data_item
      )
    ),

    //#endregion

    //#region BLOCK

    block: $ => seq("{", repeat(methodDecls($)), "}"),

    block_try: $ => seq(
      alias(".try", $.keyword),
      choice($.block, seq(target($), alias("to", $.modifier), target($))),
      repeat1($.block_handler)
    ),

    block_handler: $ => seq(
      choice(
        seq(alias("catch", $.keyword), choice($.ref_class, $.type)),
        seq(alias("filter", $.keyword), choice($.block, target($))),
        alias(choice("finally", "fault"), $.keyword)
      ),
      choice($.block, seq(alias("handler", $.modifier), target($), alias("to", $.modifier), target($)))
    ),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", optional(alias(".module", $.keyword)), $.id_assembly, "]"),

    ref_class: $ => seq(optional($.ref_assembly), join("/", $.id_class)),

    ref_member: $ => seq($.type, choice($.ref_class, $.type), "::", $.id_member),

    ref_method: $ => seq(
      callConv($),
      $.type,
      optional(seq(choice($.ref_class, $.type), "::")),
      $.id_method,
      optional(choice($.type_args, seq("<", "[", $.integer, "]", ">"))), // Either the generic arguments or the generic arity
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
      seq(alias(".vtable", $.keyword), "=", $.blob),
      seq(alias(".vtfixup", $.keyword), "[", $.integer, "]", repeat(choice($.intrinsic, $.modifier)), alias("at", $.modifier), $.id_label),
      seq(
        alias(".file", $.keyword),
        repeat($.modifier),
        $.id_assembly,
        optional(seq(alias(".hash", $.keyword), "=", $.blob)),
        optional(alias(".entrypoint", $.keyword))
      ),
      seq(
        alias(".module", $.keyword),
        alias(optional("extern"), $.modifier),
        optional($.id_assembly)
      ),
    ),

    option_assembly: $ => choice(
      seq(alias(seq(".hash", "algorithm"), $.keyword), $.integer),
      seq(alias(choice(".hash", ".publickey", ".publickeytoken", ".locale"), $.keyword), "=", $.blob),
      seq(alias(choice(".culture", ".locale"), $.keyword), $.string),
      seq(alias(".ver", $.keyword), $.version)
    ),

    option_manifest: $ => choice(
      seq(alias(".file", $.keyword), $.id_assembly, optional(seq(alias("at", $.modifier), $.integer))),
      seq(alias(seq(".assembly", "extern"), $.keyword), $.id_assembly),
      seq(alias(seq(".class", "extern"), $.keyword), $.id_class),
      seq(alias(".class", $.keyword), $.integer)
    ),

    option_type: $ => choice(
      seq(alias(".pack", $.keyword), $.integer),
      seq(alias(".size", $.keyword), $.integer),
      seq(alias(seq(".interfaceimpl", "type"), $.keyword), choice($.ref_class, $.type)),
      seq(
        choice(
          seq(alias(".override", $.keyword), choice($.ref_class, $.type), "::", $.id_method),
          seq(alias(seq(".override", "method"), $.keyword), $.ref_method)
        ),
        alias("with", $.modifier),
        alias(optional("method"), $.keyword),
        $.ref_method
      )
    ),

    option_method: $ => choice(
      seq(alias(choice(".locals", seq(".locals", "init")), $.keyword), $.args),
      seq(alias(choice(".maxstack", ".emitbyte"), $.keyword), $.integer),
      seq(alias(".override", $.keyword), choice($.ref_class, $.type), "::", $.id_method),
      seq(alias(seq(".override", "method"), $.keyword), $.ref_method),
      seq(alias(".export", $.keyword), "[", $.integer, "]", optional(seq(alias("as", $.modifier), $.id_method))),
      seq(alias(".vtentry", $.keyword), $.integer, ":", $.integer),
      alias(choice(".entrypoint", ".zeroinit"), $.keyword)
    ),

    option_param: $ => choice(
      seq(alias(".param", $.keyword), "[", $.integer, "]", optional(seq("=", $.constant))),
      seq(alias(seq(".param", "type"), $.keyword), choice(seq("[", $.integer, "]"), $.id_generic)),
      seq(alias(seq(".param", "constraint"), $.keyword), choice(seq("[", $.integer, "]"), $.id_generic), ",", choice($.ref_class, $.type))
    ),

    option_property: $ => seq(alias(choice(".get", ".set", ".other"), $.keyword), $.ref_method),

    option_event: $ => seq(alias(choice(".addon", ".removeon", ".fire", ".other"), $.keyword), $.ref_method),

    option_security: $ => choice(
      seq(
        alias(".permission", $.keyword),
        $.modifier,
        choice($.ref_class, $.type),
        optional(seq("(", optional(join(",", $.named_value)), ")"))
      ),
      seq(
        alias(".permissionset", $.keyword),
        $.modifier,
        "=",
        choice(
          $.blob,
          $.bytearray,
          seq("{", optional(join(",", seq(choice($.ref_class, $.type), "=", "{", repeat($.named_arg), "}"))), "}")
        )
      )
    ),

    option_source: $ => choice(
      prec.right(seq( // A quoted file name after the position belongs to the directive, even if it could also be the label of the next statement
        alias(".line", $.keyword),
        $.integer,
        optional(seq(",", $.integer)),
        optional(seq(":", $.integer, optional(seq(",", $.integer)))),
        optional($.quoted)
      )),
      seq(alias("#line", $.keyword), $.integer, $.string),
      seq(alias(".language", $.keyword), join(",", $.quoted))
    ),

    //#endregion

    //#region STRING

    string: $ => prec.right(join("+", $.string_single)),

    string_content: () => token.immediate(prec(1, /[^"\\\n]+/)), // The precedence prevents a "//" inside of the string from being lexed as a comment

    string_escape: () => token.immediate(/\\./),

    string_single: $ => seq(
      '"',
      repeat(choice($.string_content, $.string_escape)), // I don't wrap everything in a single token because I want to be able to highlight these two differently
      token.immediate('"')
    ),

    //#endregion

    //#region TOKEN

    byte: () => token(seq(REGEX_HEX_DIGIT, REGEX_HEX_DIGIT)),

    integer: () => token(seq(optional("-"), choice(REGEX_NUMBER, seq("0x", repeat1(REGEX_HEX_DIGIT))))),

    float: () => token(seq(optional("-"), REGEX_NUMBER, ".", optional(REGEX_NUMBER), optional(seq(/e/i, optional(/[+-]/), REGEX_NUMBER)))),

    version: () => token(seq(REGEX_NUMBER, ":", REGEX_NUMBER, ":", REGEX_NUMBER, ":", REGEX_NUMBER)),

    intrinsic: () => token(choice(
      /void|refany|bool|char|float|float32|float64|int|int8|int16|int32|int64|uint8|uint16|uint32|uint64|object|wchar|string|typedref/,
      /native\s+(unsigned\s+)?int|native\s+float/,
      /unsigned\s+int(8|16|32|64)/
    )),

    word: () => token(/[a-z_$@`?][a-z0-9_$@`?]*/i),

    quoted: () => token(seq("'", repeat(/[^'\\]|\\./), "'")),

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
