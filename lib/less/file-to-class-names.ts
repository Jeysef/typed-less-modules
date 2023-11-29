import {
  camelCase,
  camelCaseTransformMerge,
  paramCase,
  snakeCase,
} from "change-case";
import fs from "fs";
import { render } from "less";
import { MainOptions } from "lib/core";
import path from "path";
import slash from "slash";
import LessAliasesPlugin from "./aliases-plugin";
import { sourceToClassNames } from "./source-to-class-names";

export type ClassName = string;

type AliasesFunc = (filePath: string) => string;
export type Aliases = Record<string, string | AliasesFunc>;

interface Transformer {
  (className: ClassName): string;
}

const transformersMap = {
  camel: (className: ClassName) =>
    camelCase(className, { transform: camelCaseTransformMerge }),
  dashes: (className: ClassName) =>
    /-/.test(className) ? camelCase(className) : className,
  kebab: (className: ClassName) => transformersMap.param(className),
  none: (className: ClassName) => className,
  param: (className: ClassName) => paramCase(className),
  snake: (className: ClassName) => snakeCase(className),
} as const;

type NameFormatWithTransformer = keyof typeof transformersMap;
const NAME_FORMATS_WITH_TRANSFORMER = Object.keys(
  transformersMap
) as NameFormatWithTransformer[];

export const NAME_FORMATS = [...NAME_FORMATS_WITH_TRANSFORMER, "all"] as const;
export type NameFormat = (typeof NAME_FORMATS)[number];

export interface LESSOptions {
  includePaths?: string[];
  aliases?: Aliases;
  aliasPrefixes?: Aliases;
  nameFormat?: NameFormat | NameFormat[];
}
export const nameFormatDefault: NameFormatWithTransformer = "camel";
export const configFilePathDefault: string = "tlm.config.js";
export const fileToClassNames = async (
  file: string,
  options: LESSOptions = {} as MainOptions
) => {
  const aliases = options.aliases || {};
  const includePaths = options.includePaths || [];
  const lessRenderOptions = (options as MainOptions).lessRenderOptions || {};

  const nameFormat = (
    typeof options.nameFormat === "string"
      ? [options.nameFormat]
      : options.nameFormat
  ) as NameFormat[];

  const nameFormats: NameFormatWithTransformer[] = nameFormat
    ? nameFormat.includes("all")
      ? NAME_FORMATS_WITH_TRANSFORMER
      : (nameFormat as NameFormatWithTransformer[])
    : [nameFormatDefault];

  const fileContent = fs.readFileSync(file).toString();
  const result = await render(fileContent, {
    filename: slash(path.resolve(file)),
    paths: includePaths,
    syncImport: true,
    plugins: [
      new LessAliasesPlugin({
        aliasPrefixes: options.aliasPrefixes,
        aliases,
      }),
    ],
    ...lessRenderOptions,
  });

  const classNames = await sourceToClassNames(result.css, file);
  const transformers = nameFormats.map((item) => transformersMap[item]);
  const transformedClassNames = new Set<ClassName>([]);
  classNames.forEach((className: ClassName) => {
    transformers.forEach((transformer: Transformer) => {
      transformedClassNames.add(transformer(className));
    });
  });

  return Array.from(transformedClassNames).sort((a, b) => a.localeCompare(b));
};
