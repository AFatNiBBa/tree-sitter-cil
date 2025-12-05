from unittest import TestCase

from tree_sitter import Language, Parser
import tree_sitter_cil


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            Parser(Language(tree_sitter_cil.language()))
        except Exception:
            self.fail("Error loading Common Intermediate Language grammar")
