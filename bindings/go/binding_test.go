package tree_sitter_cil_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_cil "github.com/afatnibba/tree-sitter-cil/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cil.Language())
	if language == nil {
		t.Errorf("Error loading Common Intermediate Language grammar")
	}
}
