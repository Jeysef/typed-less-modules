import os from "os";
import { classNamesToTypeDefinitions, ExportType } from "../../lib/typescript";

jest.mock("../../lib/prettier/can-resolve", () => ({
  canResolvePrettier: () => false,
}));

describe("classNamesToTypeDefinitions (without Prettier)", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  describe("named", () => {
    it("converts an array of class name strings to type definitions", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "named",
      });

      expect(definition).toEqual(
        `export declare const myClass: string;${os.EOL}export declare const yourClass: string;${os.EOL}`
      );
    });

    it("returns null if there are no class names", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: [],
        exportType: "named",
      });

      expect(definition).toBeNull();
    });

    it("prints a warning if a classname is a reserved keyword and does not include it in the type definitions", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "if"],
        exportType: "named",
      });

      expect(definition).toEqual(
        `export declare const myClass: string;${os.EOL}`
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[SKIPPING] 'if' is a reserved keyword")
      );
    });

    it("prints a warning if a classname is invalid and does not include it in the type definitions", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "invalid-variable"],
        exportType: "named",
      });

      expect(definition).toEqual(
        `export declare const myClass: string;${os.EOL}`
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[SKIPPING] 'invalid-variable' contains dashes")
      );
    });
  });

  describe("default", () => {
    it("converts an array of class name strings to type definitions", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "default",
      });

      expect(definition).toEqual(
        `export type Styles = {${os.EOL}  'myClass': string;${os.EOL}  'yourClass': string;${os.EOL}};${os.EOL}${os.EOL}export type ClassNames = keyof Styles;${os.EOL}${os.EOL}declare const styles: Styles;${os.EOL}${os.EOL}export default styles;${os.EOL}`
      );
    });

    it("returns null if there are no class names", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: [],
        exportType: "default",
      });

      expect(definition).toBeNull();
    });
  });

  describe("invalid export type", () => {
    it("returns null", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass"],
        exportType: "invalid" as ExportType,
      });

      expect(definition).toBeNull();
    });
  });

  describe("quoteType", () => {
    it("uses double quotes for default exports when specified", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "default",
        quoteType: "double",
      });

      expect(definition).toEqual(
        `export type Styles = {${os.EOL}  "myClass": string;${os.EOL}  "yourClass": string;${os.EOL}};${os.EOL}${os.EOL}export type ClassNames = keyof Styles;${os.EOL}${os.EOL}declare const styles: Styles;${os.EOL}${os.EOL}export default styles;${os.EOL}`
      );
    });

    it("does not affect named exports", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "named",
        quoteType: "double",
      });

      expect(definition).toEqual(
        `export declare const myClass: string;${os.EOL}export declare const yourClass: string;${os.EOL}`
      );
    });
  });

  describe("exportType name and type attributes", () => {
    it("uses custom value for ClassNames type name", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "default",
        exportTypeName: "Classes",
      });

      expect(definition).toEqual(
        `export type Styles = {${os.EOL}  'myClass': string;${os.EOL}  'yourClass': string;${os.EOL}};${os.EOL}${os.EOL}export type Classes = keyof Styles;${os.EOL}${os.EOL}declare const styles: Styles;${os.EOL}${os.EOL}export default styles;${os.EOL}`
      );
    });

    it("uses custom value for Styles type name", async () => {
      const definition = await classNamesToTypeDefinitions({
        banner: "",
        classNames: ["myClass", "yourClass"],
        exportType: "default",
        exportTypeInterface: "IStyles",
      });

      expect(definition).toEqual(
        `export type IStyles = {${os.EOL}  'myClass': string;${os.EOL}  'yourClass': string;${os.EOL}};${os.EOL}${os.EOL}export type ClassNames = keyof IStyles;${os.EOL}${os.EOL}declare const styles: IStyles;${os.EOL}${os.EOL}export default styles;${os.EOL}`
      );
    });
  });

  describe("Banner support", () => {
    const firstLine = (str: string): string => str.split(os.EOL)[0];

    it("appends the banner to the top of the output file: default", async () => {
      const banner = "// Example banner";
      const definition = await classNamesToTypeDefinitions({
        banner,
        classNames: ["myClass", "yourClass"],
        exportType: "default",
      });

      expect(firstLine(definition!)).toBe(banner);
    });

    it("appends the banner to the top of the output file: named", async () => {
      const banner = "// Example banner";
      const definition = await classNamesToTypeDefinitions({
        banner,
        classNames: ["myClass", "yourClass"],
        exportType: "named",
      });

      expect(firstLine(definition!)).toBe(banner);
    });
  });
});
