// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterLamgammaParser",
    products: [
        .library(name: "TreeSitterLamgammaParser", targets: ["TreeSitterLamgammaParser"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterLamgammaParser",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterLamgammaParserTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterLamgammaParser",
            ],
            path: "bindings/swift/TreeSitterLamgammaParserTests"
        )
    ],
    cLanguageStandard: .c11
)
