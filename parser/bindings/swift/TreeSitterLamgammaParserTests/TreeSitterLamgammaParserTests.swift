import XCTest
import SwiftTreeSitter
import TreeSitterLamgammaParser

final class TreeSitterLamgammaParserTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_lamgamma_parser())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading LamgammaParser grammar")
    }
}
