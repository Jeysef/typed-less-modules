import fs from "fs";
import path from "path";
import slash from "slash";
import { alerts } from "../../lib/core/alerts";
import { removeLESSTypeDefinitionFile } from "../../lib/core/remove-file";
import { DEFAULT_OPTIONS } from "../../lib/load";

describe("removeFile", () => {
  const originalTestFile = slash(
    path.resolve(__dirname, "..", "removable.less")
  );
  const existingFile = slash(path.resolve(__dirname, "..", "style.less"));
  const existingTypes = slash(
    path.join(process.cwd(), "__tests__/removable.less.d.ts")
  );
  const outputFolderExistingTypes = slash(
    path.resolve(process.cwd(), "__generated__/__tests__/removable.less.d.ts")
  );

  let existsSpy: jest.SpyInstance;
  let unlinkSpy: jest.SpyInstance;
  let alertsSpy: jest.SpyInstance;

  beforeEach(() => {
    existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(
        (path) =>
          path === existingTypes ||
          path === existingFile ||
          path === outputFolderExistingTypes
      );

    unlinkSpy = jest.spyOn(fs, "unlinkSync").mockImplementation();

    alertsSpy = jest.spyOn(alerts, "success").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does nothing if types file doesn't exist", () => {
    const nonExistingFile = slash(
      path.resolve(__dirname, "..", "deleted.less")
    );
    const nonExistingTypes = slash(
      path.join(process.cwd(), "__tests__/deleted.less.d.ts")
    );

    removeLESSTypeDefinitionFile(nonExistingFile, DEFAULT_OPTIONS);

    // expect(existsSpy).toHaveBeenCalledWith(
    //   expect.stringMatching(nonExistingFile)
    // );
    expect(existsSpy).toHaveBeenCalledWith(
      expect.stringMatching(nonExistingTypes)
    );
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(alertsSpy).not.toHaveBeenCalled();
  });

  it("removes *.less.d.ts types file for *.less", () => {
    removeLESSTypeDefinitionFile(originalTestFile, DEFAULT_OPTIONS);

    expect(existsSpy).toHaveBeenCalledWith(
      expect.stringMatching(existingTypes)
    );
    expect(unlinkSpy).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalledWith(
      expect.stringMatching(existingTypes)
    );
    expect(alertsSpy).toHaveBeenCalled();
  });

  describe("when outputFolder is passed", () => {
    it("removes the correct files", () => {
      removeLESSTypeDefinitionFile(originalTestFile, {
        ...DEFAULT_OPTIONS,
        outputFolder: "__generated__",
      });

      expect(existsSpy).toHaveBeenCalledWith(
        expect.stringMatching(outputFolderExistingTypes)
      );
      expect(unlinkSpy).toHaveBeenCalled();
      expect(unlinkSpy).toHaveBeenCalledWith(
        expect.stringMatching(outputFolderExistingTypes)
      );
      expect(alertsSpy).toHaveBeenCalled();
    });
  });
});
