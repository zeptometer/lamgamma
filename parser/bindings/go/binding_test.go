package tree_sitter_lamgamma_parser_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_lamgamma_parser "github.com/zeptometer/lamgamma/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_lamgamma_parser.Language())
	if language == nil {
		t.Errorf("Error loading LamgammaParser grammar")
	}
}
