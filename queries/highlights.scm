
[
  (byte)
  (integer)
  (float)
  (version)
] @number

(string_single
  [
    (string_escape) @string.escape
    [
      "\""
      (string_content)
    ] @string
  ])

[
  (option_source (quoted) @string)
  (constant (quoted) @string)
]

(comment) @comment

[
  (def_assembly (id_assembly) @regexp.declaration)
  (def_resource (id_assembly) @regexp.declaration)
  (option_module (id_assembly) @regexp.declaration)
  (option_manifest (id_assembly) @regexp)
  (ref_assembly (id_assembly) @regexp)
]

(def_namespace (id_namespace) @namespace.declaration)

[
  (def_class (id_class (id [ (symbol) @class.declaration (nesting) @namespace ])))
  (def_export (id_class (id [ (symbol) @class.declaration (nesting) @namespace ])))
  (option_manifest (id_class (id [ (symbol) @class (nesting) @namespace ])))
  (ref_class (id_class (id [ (symbol) @class (nesting) @namespace ])))
]

(keyword) @keyword

[
  (modifier)
  (intrinsic)
] @macro

[
  (def_method (id_method (id) @method.declaration))
  (ref_method (id_method (id) @method))
  (option_method (id_method (id) @method))
  (option_type (id_method (id) @method))
]

[
  (def_method (args (args_item (id_parameter) @parameter.declaration)))
  (def_property (args (args_item (id_parameter) @parameter.declaration)))
  (option_method (args (args_item (id_parameter) @variable.declaration)))
  (ref_method (args (args_item (id_parameter) @parameter)))
  (type_method (args (args_item (id_parameter) @parameter)))
  (statement (args (args_item (id_parameter) @parameter)))
]

((statement (instruction) @_instruction (id_parameter) @parameter)
  (#match? @_instruction "arg"))

((statement (instruction) @_instruction (id_parameter) @variable)
  (#match? @_instruction "loc"))

[
  (def_field (id_member) @property.declaration)
  (def_property (id_member) @property.declaration)
  (def_event (id_member) @event.declaration)
  (ref_member (id_member) @property)
  (named_arg (id_member) @property)
]

[
  (statement (id_label) @label.declaration . ":")
  (def_data (id_label) @label.declaration)
  (statement (instruction) (id_label) @label)
  (option_module (id_label) @label)
  (def_field (id_label) @label)
  (data_item (id_label) @label)
  (block_try (id_label) @label)
  (block_handler (id_label) @label)
]

[
  (generics_item (id_generic) @typeParameter.declaration)
  (option_param (id_generic) @typeParameter)
  (type_parameter) @typeParameter
]

(instruction) @function
