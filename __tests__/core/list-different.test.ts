import slash from "slash";
import { listDifferent } from "../../lib/core";

describe("listDifferent", () => {
  let exit: jest.SpyInstance;

  beforeEach(() => {
    console.log = jest.fn();
    exit = jest.spyOn(process, "exit").mockImplementation();
  });

  afterEach(() => {
    exit.mockRestore();
  });

  it("logs invalid type definitions and exits with 1", async () => {
    const pattern = slash(`${__dirname}/../**/*.less`);

    await listDifferent(pattern, {
      banner: "",
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      exportTypeName: "ClassNames",
      exportTypeInterface: "Styles",
      listDifferent: true,
      aliases: {
        "~fancy-import": "complex",
        "~another": "style",
      },
      aliasPrefixes: {
        "~": "nested-styles/",
      },
      ignore: [],
      quoteType: "single",
      updateStaleOnly: false,
      logLevel: "verbose",
      outputFolder: null,
    });

    expect(exit).toHaveBeenCalledWith(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`[INVALID TYPES] Check type definitions for`)
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`invalid.less`)
    );
  });

  it("logs nothing and does not exit when formatted using Prettier", async () => {
    const pattern = slash(`${__dirname}/list-different/formatted.less`);

    await listDifferent(pattern, {
      banner: "",
      watch: false,
      ignoreInitial: false,
      exportType: "default",
      exportTypeName: "ClassNames",
      exportTypeInterface: "Styles",
      listDifferent: true,
      ignore: [],
      quoteType: "single",
      updateStaleOnly: false,
      logLevel: "verbose",
      nameFormat: ["kebab"],
      outputFolder: null,
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`Only 1 file found for`)
    );
    expect(exit).not.toHaveBeenCalled();
  });

  it("logs nothing and does not exit if all files are valid", async () => {
    const pattern = slash(`${__dirname}/../dummy-styles/**/style.less`);

    await listDifferent(pattern, {
      banner: "",
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      exportTypeName: "ClassNames",
      exportTypeInterface: "Styles",
      listDifferent: true,
      ignore: [],
      quoteType: "single",
      updateStaleOnly: false,
      logLevel: "verbose",
      outputFolder: null,
    });

    expect(exit).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it("logs not generated type file and exits with 1", async () => {
    const pattern = slash(`${__dirname}/list-different/no-generated.less`);

    await listDifferent(pattern, {
      banner: "",
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      exportTypeName: "ClassNames",
      exportTypeInterface: "Styles",
      listDifferent: true,
      ignore: [],
      quoteType: "single",
      updateStaleOnly: false,
      logLevel: "verbose",
      outputFolder: null,
    });

    expect(exit).toHaveBeenCalledWith(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        `[INVALID TYPES] Type file needs to be generated for`
      )
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`no-generated.less`)
    );
  });

  it("ignores ignored files", async () => {
    const pattern = slash(`${__dirname}/list-different/no-generated.less`);

    await listDifferent(pattern, {
      banner: "",
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      exportTypeName: "ClassNames",
      exportTypeInterface: "Styles",
      listDifferent: true,
      ignore: ["**/no-generated.less"],
      quoteType: "single",
      updateStaleOnly: false,
      logLevel: "verbose",
      outputFolder: null,
    });

    expect(exit).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`No files found`)
    );
  });
});
