import { execSync } from "child_process";

describe.only("cli", () => {
  it("should run when no files are found", () => {
    const result = execSync("npm run typed-less-modules src").toString();

    expect(result).toContain("No files found.");
  });

  describe("examples", () => {
    it("should run the basic example without errors", () => {
      const result = execSync(
        `npm run typed-less-modules "examples/basic/**/*.less" -- --includePaths examples/basic/core --aliases.~alias examples/basic/core/variables`
      ).toString();

      expect(result).toContain("Found 3 files. Generating type definitions...");
    });

    it("should run the default-export example without errors", () => {
      const result = execSync(
        `npm run typed-less-modules "examples/default-export/**/*.less" -- --exportType default --nameFormat kebab`
      ).toString();

      expect(result).toContain("Found 1 file. Generating type definitions...");
    });
  });
});
