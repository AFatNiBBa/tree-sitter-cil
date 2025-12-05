
(comment) @comment

[
  (byte)
  (integer)
  (version)
] @constant.numeric.integer

(string) @string

(string_escape) @constant.character.escape

(part_modifier) @keyword

(part_keyword) @keyword.control

; (part_keyword ".method") @keyword.function

; (part_keyword (".locals" "init")) @keyword.storage.type

(type_intrinsic) @type.builtin

; (args_item
;   name: (symbol) @variable.parameter)

(id_namespace) @namespace

(id_class
  (id
    (symbol) @type))

; (id_member) @variable.other.member

(id_method
  [
    (id) @function
    (part_keyword) @constructor
  ])

(id_label) @label

; (instruction
;   instruction: (
;     (_ @function)
;     _*
;   ))

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

[
  ";"
  "."
  ","
] @punctuation.delimiter

[
  "="
  ":"
  "::"
  "..."
] @operator