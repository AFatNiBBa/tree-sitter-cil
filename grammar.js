
// @ts-check

/// <reference types="tree-sitter-cli/dsl" />

/** A single hexadecimal digit, case-insensitive, with optional underscores */
const REGEX_HEX_DIGIT = /[a-f\d]/i;

/** A decimal sequence of digits */
const REGEX_NUMBER = /\d+/;

/** The exponent of a floating point number */
const REGEX_EXPONENT = /e[+-]?\d+/i;

/**
 * Utility function that allows to define a repeating rule with a separator between each element
 * @param {RuleOrLiteral} sep The rule to use as separator
 * @param {RuleOrLiteral} rule The rule to repeat
 */
const join = (sep, rule) => seq(rule, repeat(seq(sep, rule)));

/**
 * Utility function that allows to define a possibly empty list of comma separated elements between two delimiters
 * @param {RuleOrLiteral} open The opening delimiter
 * @param {RuleOrLiteral} rule The rule to repeat
 * @param {RuleOrLiteral} close The closing delimiter
 */
const list = (open, rule, close) => seq(open, optional(join(",", rule)), close);

/**
 * Utility function that allows to define a group of instructions that share the same operands
 * @param {GrammarSymbols<string>} $ The grammar symbols
 * @param {string[]} names The names of the instructions
 * @param {RuleOrLiteral[]} operands The operands that follow the instruction
 */
const instruction = ($, names, ...operands) => seq(alias(names.length > 1 ? choice(...names) : names[0], $.instruction), ...operands);

// Grammar for .NET's Common Intermediate Language
export default grammar({
  name: "cil",
  extras: $ => [ /\s+/, $.comment ],
  conflicts: $ => [
    [ $.modifier, $.symbol ] // Modifiers are bare words, so when the body is optional only the following tokens tell if a word is the name or the label of the next statement
  ],

  rules: {
    file: $ => repeat($._decl),

    //#region PRIVATE

    _decl: $ => choice(
      ";",
      $.attribute, $.label, $.statement, $.body, $.block_try,
      $.def_namespace, $.def_assembly, $.def_resource, $.def_export, $.def_class, $.def_field, $.def_method, $.def_property, $.def_event, $.def_data, $.def_typedef,
      $.option_value, $.option_flag, $.option_module, $.option_vtfixup, $.option_export, $.option_interface, $.option_locals, $.option_param, $.option_override, $.option_accessor, $.option_security, $.option_source, $.option_typelist, $.option_preprocessor
    ),

    _index: $ => seq("[", $.integer, "]"),

    _param_attribute: $ => seq("[", choice($.modifier, $.integer), "]"), // Parameter attributes and local indexes

    _target: $ => choice($.id_label, $.integer), // Target of a branch

    //#endregion

    //#region UTIL

    blob: $ => seq("(", repeat($.byte), ")"),

    loose: $ => seq(
      "(",
      repeat(choice(
        $.intrinsic, $.modifier, $.string_single, $.integer, $.loose,
        "*", "&", "[", "]", "+", ","
      )),
      ")"
    ),

    nesting: $ => choice($.symbol, seq($.nesting, ".", $.symbol)),

    symbol: $ => choice($.word, $.quoted),

    modifier: $ => $.word,

    marshal: $ => seq(alias("marshal", $.keyword), $.loose),

    pinvokeimpl: $ => seq(alias("pinvokeimpl", $.keyword), $.loose),

    attribute: $ => seq(
      alias(".custom", $.keyword),
      optional(seq("(", choice($.ref_assembly, $.ref_token), ")")),
      $.ref_method,
      optional(seq("=", choice($.blob, $.string, seq("{", repeat(choice($.literal_custom, $.literal_named)), "}"))))
    ),

    //#endregion

    //#region LITERAL

    literal: $ => choice($.string, $.literal_bytes, $.literal_typed, alias("nullref", $.keyword)),

    literal_bool: () => choice("true", "false"),

    literal_bytes: $ => seq(alias("bytearray", $.intrinsic), $.blob),

    literal_typed: $ => seq($.intrinsic, "(", choice($.integer, $.float, $.quoted, $.literal_bool), ")"),

    literal_custom: $ => seq( // Value of a verbose custom attribute or of a security permission, like "int32[2](1 2)", "type(class X)" or "X(int32 : 5)"
      $.type_spec,
      "(",
      optional(choice(
        seq($.type_spec, optional(seq(":", $.integer))), // A single type, since more types separated by spaces would be ambiguous ("int32 [a]B")
        repeat1(choice(
          $.integer, $.float, $.literal_bool, $.literal_custom,
          prec(1, $.quoted), // A quoted text is a string, not the name of a class
          alias("nullref", $.keyword)
        ))
      )),
      ")"
    ),

    literal_named: $ => seq(
      alias(choice("property", "field"), $.modifier),
      optional(alias("enum", $.modifier)),
      $.type_spec,
      $.id_member,
      "=",
      choice(
        $.string, $.literal_bytes, $.literal_custom,
        alias("nullref", $.keyword)
      )
    ),

    literal_data: $ => choice(
      seq($.intrinsic, "*", "(", $.string, ")"),
      seq("&", "(", $.id_label, ")"),
      $.literal_bytes,
      seq(choice($.intrinsic, $.literal_typed), optional($._index))
    ),

    //#endregion

    //#region INSTRUCTION

    label: $ => seq($.id_label, ":"),

    statement: $ => choice(
      instruction($, [ "call", "callvirt", "newobj", "jmp", "ldftn", "ldvirtftn" ], $.ref_method),
      instruction($, [ "ldfld", "ldflda", "stfld", "ldsfld", "ldsflda", "stsfld" ], $.ref_member),
      instruction($, [ "ldc.i4", "ldc.i4.s", "ldc.i8", "unaligned.", "no." ], $.integer),
      instruction($, [ "ldc.r4", "ldc.r8" ], choice($.float, $.integer, $.blob, $.literal_typed)),
      instruction($, [ "calli" ], repeat($.modifier), $.type, $.args),
      instruction(
        $,
        [
          "ldarg", "ldarg.s", "ldarga", "ldarga.s", "starg", "starg.s",  // Arguments
          "ldloc", "ldloc.s", "ldloca", "ldloca.s", "stloc", "stloc.s"   // Locals
        ],
        choice($.integer, $.id_parameter)
      ),
      instruction(
        $,
        [
          "br", "br.s", "leave", "leave.s",                                            // Unconditional
          "brfalse", "brfalse.s", "brnull", "brnull.s", "brzero", "brzero.s",          // If false
          "brtrue", "brtrue.s", "brinst", "brinst.s",                                  // If true
          "beq", "beq.s", "bne.un", "bne.un.s",                                        // Equality
          "bge", "bge.s", "bge.un", "bge.un.s", "bgt", "bgt.s", "bgt.un", "bgt.un.s",  // Greater
          "ble", "ble.s", "ble.un", "ble.un.s", "blt", "blt.s", "blt.un", "blt.un.s"   // Less
        ],
        $._target
      ),
      instruction($, [ "switch" ], list("(", $._target, ")")),
      instruction(
        $,
        [
          "box", "unbox", "unbox.any", "castclass", "isinst",                   // Conversions and checks
          "initobj", "ldobj", "stobj", "cpobj", "sizeof",                       // Values
          "newarr", "ldelem", "ldelema", "stelem", "ldelem.any", "stelem.any",  // Arrays
          "mkrefany", "refanyval",                                              // Typed references
          "constrained."                                                        // Prefix
        ],
        $.type_spec // The type token can omit "class" and "valuetype"
      ),
      instruction($, [ "ldtoken" ], $.ref_token),
      instruction($, [ "ldstr" ], choice($.string, $.literal_bytes)),
      alias(
        token(choice( // Instructions without operands, they accept some combinations that don't exist
          /nop|break|ret|dup|pop|throw|rethrow|endfinally|endfault|endfilter|arglist|localloc|ldnull|ldlen|cpblk|initblk|refanytype|ckfinite/,  // Miscellaneous
          /(ld|st)(arg|loc)\.[0-3]/,                                                                                                            // Short forms of arguments and locals
          /ldc\.i4\.([0-8]|m1|M1)/,                                                                                                             // Short forms of constants
          /(add|sub|mul)(\.ovf)?(\.un)?|(div|rem|shr)(\.un)?|neg|and|or|xor|not|shl/,                                                           // Arithmetic and bitwise
          /c(eq|gt|lt)(\.un)?/,                                                                                                                 // Comparisons
          /conv(\.ovf)?\.([iu][1248]?|r[48]|r\.un)(\.un)?/,                                                                                     // Conversions
          /(ld|st)(ind|elem)\.([iu][1248]?|r[48]|ref)/,                                                                                         // Indirect and array access
          /(tail|volatile|readonly)\./                                                                                                          // Prefixes
        )),
        $.instruction
      )
    ),

    //#endregion

    //#region ARGS

    args: $ => list("(", choice($.args_item, "..."), ")"),

    args_item: $ => seq(
      repeat($._param_attribute),
      $.type,
      optional($.marshal),
      optional($.id_parameter)
    ),

    generics: $ => list("<", $.generics_item, ">"),

    generics_item: $ => seq(
      repeat(choice($.modifier, alias(".ctor", $.modifier), "+", "-")),
      optional(list("(", $.type_spec, ")")),
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
      $.intrinsic, $.type_custom, $.type_parameter, $.type_method,
      seq($.type, $.type_suffix)
    ),

    type_spec: $ => choice(
      $.ref_class, $.type,
      alias(choice(".this", ".base", ".nester"), $.keyword) // The current class, its base class and its enclosing class
    ),

    type_custom: $ => seq(alias(choice("class", "valuetype", seq("value", "class")), $.modifier), $.ref_class, optional($.type_args)),

    type_args: $ => list("<", $.type, ">"),

    type_method: $ => seq(alias("method", $.keyword), repeat($.modifier), $.type, "*", $.args),

    type_parameter: $ => choice(
      token(seq(choice("!", "!!"), REGEX_NUMBER)),
      seq(choice("!", "!!"), $.id_generic)
    ),

    type_suffix: $ => choice(
      $.type_indexer, "&", "*",
      alias("pinned", $.modifier),
      seq(alias(choice("modreq", "modopt"), $.modifier), "(", $.type_spec, ")")
    ),

    type_indexer: $ => seq("[", optional(join(",", optional(choice($.integer, $.type_indexer_range)))), "]"),

    type_indexer_range: $ => seq(optional($.integer), "...", optional($.integer)),

    //#endregion

    //#region REF

    ref_assembly: $ => seq("[", optional(alias(".module", $.keyword)), $.id_assembly, "]"),

    ref_class: $ => seq(optional($.ref_assembly), join("/", $.id_class)),

    ref_scope: $ => seq($.type_spec, "::"),

    ref_member: $ => seq($.type, optional($.ref_scope), $.id_member),

    ref_method: $ => seq(
      repeat($.modifier),
      $.type,
      optional($.ref_scope),
      $.id_method,
      optional(choice($.type_args, seq("<", $._index, ">"))), // Either the generic arguments or the generic arity
      $.args
    ),

    ref_token: $ => choice(
      $.type_spec,
      seq(alias("method", $.keyword), $.ref_method),
      seq(alias("field", $.keyword), $.ref_member)
    ),

    //#endregion

    //#region DEF

    def_namespace: $ => seq(alias(".namespace", $.keyword), $.id_namespace, $.body),

    def_assembly: $ => prec.right(seq( // The body is optional because it's missing when it's used inside of a ".mresource"
      alias(".assembly", $.keyword),
      repeat($.modifier),
      $.id_assembly,
      optional(seq(alias("as", $.modifier), $.id_assembly)),
      optional($.body)
    )),

    def_resource: $ => seq(alias(".mresource", $.keyword), repeat($.modifier), $.id_assembly, $.body),

    def_export: $ => prec.right(seq( // The body is optional because it's missing when it's used inside of another export
      alias(choice(seq(".class", "extern"), ".export"), $.keyword),
      repeat($.modifier),
      $.id_class,
      optional($.body)
    )),

    def_class: $ => seq(
      alias(".class", $.keyword),
      repeat($.modifier),
      $.id_class,
      optional($.generics),
      optional(seq(alias("extends", $.modifier), $.type_spec)),
      optional(seq(alias("implements", $.modifier), join(",", $.type_spec))),
      $.body
    ),

    def_field: $ => seq(
      alias(".field", $.keyword),
      optional($._index),
      repeat(choice($.modifier, $.marshal)),
      $.type,
      $.id_member,
      optional(seq(alias("at", $.modifier), $.id_label)),
      optional(seq("=", $.literal))
    ),

    def_method: $ => seq(
      alias(".method", $.keyword),
      repeat(choice($.modifier, $.pinvokeimpl, $._param_attribute)),
      $.type,
      optional($.marshal),
      $.id_method,
      optional($.generics),
      $.args,
      repeat($.modifier),
      $.body
    ),

    def_property: $ => seq(
      alias(".property", $.keyword),
      repeat($.modifier),
      $.type,
      $.id_member,
      $.args,
      optional(seq("=", $.literal)),
      $.body
    ),

    def_event: $ => seq(
      alias(".event", $.keyword),
      repeat(alias(choice("specialname", "rtspecialname"), $.modifier)), // Closed list, since with bare words a modifier couldn't be distinguished from a bare type
      optional($.type_spec),
      $.id_member,
      $.body
    ),

    def_data: $ => seq(
      alias(".data", $.keyword),
      optional($.modifier),
      optional(seq($.id_label, "=")),
      choice(list("{", $.literal_data, "}"), $.literal_data)
    ),

    def_typedef: $ => seq(alias(".typedef", $.keyword), choice($.ref_token, $.attribute), alias("as", $.modifier), $.id_class),

    //#endregion

    //#region BODY

    body: $ => seq("{", repeat($._decl), "}"),

    block_range: $ => seq($._target, alias("to", $.modifier), $._target),

    block_try: $ => seq(alias(".try", $.keyword), choice($.body, $.block_range), repeat1($.block_handler)),

    block_handler: $ => seq(
      choice(
        seq(alias("catch", $.keyword), $.type_spec),
        seq(alias("filter", $.keyword), choice($.body, $._target)),
        alias(choice("finally", "fault"), $.keyword)
      ),
      choice($.body, seq(alias("handler", $.modifier), $.block_range))
    ),

    //#endregion

    //#region OPTION

    option_value: $ => seq(
      alias(
        choice(
          ".maxstack", ".emitbyte", ".pack", ".size", ".imagebase", ".stackreserve", ".subsystem", ".corflags",  // Integer
          seq(".file", "alignment"),                                                                             // Integer
          seq(".hash", "algorithm"),                                                                             // Integer
          ".vtentry",                                                                                            // Two integers ("a : b")
          ".ver",                                                                                                // Four integers ("a : b : c : d")
          ".vtable", ".hash", ".publickey", ".publickeytoken",                                                   // Blob
          ".locale", ".culture"                                                                                  // Blob or string
        ),
        $.keyword
      ),
      optional("="),
      choice(join(":", $.integer), $.blob, $.string)
    ),

    option_flag: $ => alias(choice(".entrypoint", ".zeroinit", ".mscorlib"), $.keyword),

    option_module: $ => choice(
      prec.right(seq(alias(".module", $.keyword), alias(optional("extern"), $.modifier), optional($.id_assembly))), // A following word belongs to the directive, even if it could also be the label of the next statement
      seq(alias(".file", $.keyword), repeat($.modifier), $.id_assembly, optional(seq(alias("at", $.modifier), $.integer))),
      seq(alias(".class", $.keyword), $.integer)
    ),

    option_vtfixup: $ => seq(alias(".vtfixup", $.keyword), $._index, repeat(choice($.intrinsic, $.modifier)), alias("at", $.modifier), $.id_label),

    option_export: $ => seq(alias(".export", $.keyword), $._index, optional(seq(alias("as", $.modifier), $.id_method))),

    option_interface: $ => seq(alias(seq(".interfaceimpl", "type"), $.keyword), $.type_spec),

    option_locals: $ => seq(alias(choice(".locals", seq(".locals", "init")), $.keyword), $.args),

    option_param: $ => seq(
      alias(choice(".param", seq(".param", "type"), seq(".param", "constraint")), $.keyword),
      choice($._index, $.id_generic),
      optional(seq(",", $.type_spec)),
      optional(seq("=", $.literal))
    ),

    option_override: $ => seq(
      alias(choice(".override", seq(".override", "method")), $.keyword),
      choice(seq($.ref_scope, $.id_method), $.ref_method),
      optional(seq(alias("with", $.modifier), alias(optional("method"), $.keyword), $.ref_method))
    ),

    option_accessor: $ => seq(
      alias(
        choice(
          ".get", ".set", ".other",       // Property
          ".addon", ".removeon", ".fire"  // Event (".other" too)
        ),
        $.keyword
      ),
      $.ref_method
    ),

    option_security: $ => choice(
      seq(alias(".permission", $.keyword), $.modifier, $.type_spec, optional(list("(", $.security_value, ")"))),
      seq(alias(".permissionset", $.keyword), $.modifier, "=", choice($.blob, $.literal_bytes, list("{", $.security_attribute, "}")))
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

    option_typelist: $ => seq(alias(".typelist", $.keyword), "{", repeat(choice($.ref_class, ",")), "}"),

    option_preprocessor: $ => choice(
      prec.right(seq(alias("#define", $.keyword), $.modifier, optional($.string))), // A following string belongs to the directive
      seq(alias("#include", $.keyword), $.string),
      seq(alias(choice("#undef", "#ifdef", "#ifndef"), $.keyword), $.modifier),
      alias(choice("#else", "#endif"), $.keyword)
    ),

    //#endregion

    //#region SECURITY

    security_value: $ => seq($.string, "=", choice($.literal_bool, $.integer, $.string, $.literal_custom)),

    security_attribute: $ => seq($.type_spec, "=", "{", repeat($.literal_named), "}"),

    //#endregion

    //#region STRING

    string: $ => join("+", $.string_single),

    string_content: () => token.immediate(prec(1, /[^"\\\n]+/)), // "token.immediate()" only forbids skipping extras before the content, so its leading spaces can't be dropped (And get included in the token, since it allows them), but when they are followed by "//" the lexer still prefers to skip them and read a comment, unless the content has a higher precedence

    string_escape: () => token.immediate(/\\./),

    string_single: $ => seq(
      '"',
      repeat(choice($.string_content, $.string_escape)), // I don't wrap everything in a single token because I want to be able to highlight these two differently
      token.immediate('"')
    ),

    //#endregion

    //#region TOKEN

    byte: () => token(seq(REGEX_HEX_DIGIT, REGEX_HEX_DIGIT)),

    integer: () => token(seq(optional("-"), choice(REGEX_NUMBER, seq(/0x/i, repeat1(REGEX_HEX_DIGIT))))),

    float: () => token(seq(
      optional("-"),
      REGEX_NUMBER,
      choice(seq(".", optional(REGEX_NUMBER), optional(REGEX_EXPONENT)), REGEX_EXPONENT) // Either a dot or an exponent
    )),

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
