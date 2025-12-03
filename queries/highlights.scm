
; Evidenzia un identificatore come "variable"
(identifier) @variable

; Evidenzia i numeri come "number"
(number) @number

; Evidenzia l'operatore '=' come "operator"
("=") @operator

; Evidenzia un assegnamento come "assignment"
(assignment
  left: (identifier) @variable
  right: (_) @value)