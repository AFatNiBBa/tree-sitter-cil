import XCTest
import SwiftTreeSitter
import TreeSitterCil

final class TreeSitterCilTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_cil())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Common Intermediate Language grammar")
    }
}
