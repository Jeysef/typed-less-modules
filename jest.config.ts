export default {
    clearMocks: true,
    testMatch: ["**/__tests__/**/*.test.ts"],
    testPathIgnorePatterns: [
        "<rootDir>/dist/",
        "<rootDir>/node_modules/",
        "(.*).d.ts",
    ],
    transformIgnorePatterns: [
        "[/\\\\]node_modules[/\\\\](?!bundle-require).+\\.js$",
    ],
    collectCoverage: true,
    coverageDirectory: "__coverage__",
    collectCoverageFrom: ["lib/**/*.(ts|tsx)", "!**/node_modules/**"],
    coverageReporters: ["json", "lcov", "text", "cobertura"]
};
