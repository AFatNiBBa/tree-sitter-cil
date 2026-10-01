
[
  (byte)
  (integer)
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

(comment) @comment

(id_assembly) @regexp

(id_class
  (id
    [
      (symbol) @class
      (nesting) @namespace
    ]))

(keyword) @keyword

[
  (modifier)
  (intrinsic)
] @macro

(id_method
  (id) @method)

(id_parameter) @parameter

(id_member) @property

(id_label) @label

(instruction) @function