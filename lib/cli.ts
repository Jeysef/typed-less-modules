#!/usr/bin/env node

import yargs from "yargs";
import { MainOptions } from "./core";
import { Aliases, NAME_FORMATS } from "./less";
import { main } from "./main";
import { EXPORT_TYPES, LOG_LEVELS, QUOTE_TYPES } from "./typescript";

const { _: patterns, ...rest } = yargs
  .usage(
    "Generate .less.d.ts from CSS module .less files.\nUsage: $0 <glob pattern> [options]"
  )
  .example("$0 src", "All .less files at any level in the src directory")
  .example(
    "$0 src/**/*.less",
    "All .less files at any level in the src directory"
  )
  .example(
    "$0 src/**/*.less --watch",
    "Watch all .less files at any level in the src directory that are added or changed"
  )
  .example(
    "$0 src/**/*.less --includePaths src/core src/variables",
    'Search the "core" and "variables" directory when resolving imports'
  )
  .example(
    "$0 src/**/*.less --aliases.~name variables",
    'Replace all imports for "~name" with "variables"'
  )
  .example(
    "$0 src/**/*.less --aliasPrefixes.~ ./node_modules/",
    'Replace the "~" prefix with "./node_modules/" for all imports beginning with "~"'
  )
  .example(
    "$0 src/**/*.less --ignore **/secret.less",
    'Ignore any file names "secret.less"'
  )
  .example(
    "$0 src/**/*.less -e default --quoteType double",
    "Use double quotes around class name definitions rather than single quotes."
  )
  .example("$0 src/**/*.less --logLevel error", "Output only errors")
  .demandCommand(1)
  .option("additionalData", {
    string: true,
    alias: "d",
    describe: "Prepends the LESS code before each file.",
  })
  .option("aliases", {
    coerce: (obj: Aliases): Aliases => obj,
    alias: "a",
    describe: "Alias any import to any other value.",
  })
  .option("aliasPrefixes", {
    coerce: (obj: Aliases): Aliases => obj,
    alias: "p",
    describe: "A prefix for any import to rewrite to another value.",
  })
  .option("nameFormat", {
    alias: "n",
    array: true,
    string: true,
    choices: NAME_FORMATS,
    describe: "The name format that should be used to transform class names.",
  })
  .option("exportType", {
    choices: EXPORT_TYPES,
    alias: "e",
    describe: "The type of export used for defining the type definitions.",
  })
  .option("exportTypeName", {
    string: true,
    describe:
      'Set a custom type name for styles when --exportType is "default."',
  })
  .option("exportTypeInterface", {
    string: true,
    describe:
      'Set a custom interface name for styles when --exportType is "default."',
  })
  .option("watch", {
    boolean: true,
    alias: "w",
    describe:
      "Watch for added or changed files and (re-)generate the type definitions.",
  })
  .option("ignoreInitial", {
    boolean: true,
    describe: "Skips the initial build when passing the watch flag.",
  })
  .option("listDifferent", {
    boolean: true,
    alias: "l",
    describe:
      "List any type definitions that are different than those that would be generated.",
  })
  .option("includePaths", {
    array: true,
    string: true,
    alias: "i",
    describe: "Additional paths to include when trying to resolve imports.",
  })
  .option("ignore", {
    string: true,
    array: true,
    describe: "Add a pattern or an array of glob patterns to exclude matches.",
  })
  .option("outputFolder", {
    string: true,
    alias: "o",
    describe:
      "Define a (relative) folder to output the generated type definitions. Note this requires adding the output folder to tsconfig.json `rootDirs`.",
  })
  .options("quoteType", {
    choices: QUOTE_TYPES,
    alias: "q",
    describe:
      "Specify the quote type so that generated files adhere to your TypeScript rules.",
  })
  .options("updateStaleOnly", {
    boolean: true,
    alias: "u",
    describe:
      "Overwrite generated files only if the source file has more recent changes.",
  })
  .option("logLevel", {
    choices: LOG_LEVELS,
    alias: "L",
    describe: "Verbosity level of console output",
  })
  .options("banner", {
    string: true,
    describe:
      "Inserts text at the top of every output file for documentation purposes.",
  })
  .parseSync();

main(patterns[0] as string, { ...rest } as Partial<MainOptions>);
