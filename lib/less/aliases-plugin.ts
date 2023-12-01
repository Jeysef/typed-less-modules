// fork form https://github.com/dancon/less-plugin-aliases
/**
 * @fileoverview the plugin for less to support custom aliase
 * @author houquan | 870301137@qq.com
 * @version 1.0.0 | 2020-03-15 | houquan      // initial version
 */

import fs from "fs";
import { Aliases } from "./file-to-class-names";

interface Logger {
  log: (msg: string) => void;
  error: (error: Error) => void;
}

const checkExtList = [".less", ".css"];

function normalizePath(filename: string, currentDirectory: string) {
  if (/\.(?:less|css)$/i.test(filename)) {
    return fs.existsSync(currentDirectory + filename) ? filename : undefined;
  }

  for (let i = 0, len = checkExtList.length; i < len; i++) {
    const ext = checkExtList[i];
    if (fs.existsSync(`${currentDirectory}${filename}${ext}`)) {
      return `${filename}${ext}`;
    }
  }
}

interface Options {
  aliasPrefixes?: Aliases;
  aliases: Aliases;
  logger?: Logger;
  includePaths?: string[];
}

const defaultLogger = {
  log: console.log,
  error: console.error,
};

export default class LessAliasesPlugin {
  constructor(private options: Options) {}

  install(less: LessStatic, pluginManager: Less.PluginManager) {
    const {
      aliasPrefixes = {},
      aliases = {},
      logger = defaultLogger,
      includePaths = [],
    } = this.options;

    function resolve(
      filename: string,
      currentDirectory: string
    ): string | undefined {
      let resolvedPath: string | undefined;

      if (filename in aliases) {
        const resolvedAlias = aliases[filename];
        if (typeof resolvedAlias === "function") {
          const resolvedAliasString = resolvedAlias(filename);

          resolvedPath = normalizePath(resolvedAliasString, currentDirectory);

          if (!resolvedPath) {
            console.log(
              "🚀 ~ file: aliases-plugin.ts:75 ~ LessAliasesPlugin ~ includePaths.some ~ includePaths:",
              includePaths
            );
            includePaths.some((includePath) => {
              resolvedPath = normalizePath(
                resolvedAliasString,
                `${process.cwd()}/${includePath}/`
              );
              return !!resolvedPath;
            });
          }

          if (!resolvedPath) {
            throw new Error(
              `Invalid alias config for key: ${resolvedAliasString}`
            );
          }
        } else {
          resolvedPath = normalizePath(resolvedAlias, currentDirectory);

          if (!resolvedPath) {
            console.log(
              "🚀 ~ file: aliases-plugin.ts:91 ~ LessAliasesPlugin ~ includePaths.some ~ includePaths:",
              includePaths
            );
            includePaths.some((includePath) => {
              resolvedPath = normalizePath(
                resolvedAlias,
                `${process.cwd()}/${includePath}/`
              );
              return !!resolvedPath;
            });
          }

          if (!resolvedPath) {
            throw new Error(`Invalid alias config for key: ${resolvedAlias}`);
          }
        }

        return resolvedPath;
      }

      const prefixMatch = Object.keys(aliasPrefixes).find((prefix) =>
        filename.startsWith(prefix)
      );

      if (prefixMatch) {
        const resolvedAliasPrefix = aliasPrefixes[prefixMatch];
        if (typeof resolvedAliasPrefix === "function") {
          resolvedPath = normalizePath(
            resolvedAliasPrefix(filename),
            currentDirectory
          );
        } else {
          resolvedPath = normalizePath(
            resolvedAliasPrefix + filename.slice(prefixMatch.length),
            currentDirectory
          );
        }

        if (!resolvedPath) {
          throw new Error(`Invalid aliasPrefix config for key: ${prefixMatch}`);
        }

        return resolvedPath;
      }

      return filename;
    }

    function resolveFile(filename: string, currentDirectory: string) {
      let resolved;
      try {
        resolved = resolve(filename, currentDirectory);
      } catch (error) {
        logger.error(error);
      }
      if (!resolved) {
        const error = new Error(
          `[less-plugin-aliases]: '${filename}' not found.`
        );
        logger.error(error);
        throw error;
      }
      return resolved;
    }

    class AliasPlugin extends less.FileManager {
      supports(filename: string, currentDirectory: string) {
        const aliasNames = Object.keys(aliases);
        const aliasPrefixNames = Object.keys(aliasPrefixes);

        let supports = false;

        const containsSubstring = (substring: string) =>
          filename.indexOf(substring) !== -1 ||
          currentDirectory.indexOf(substring) !== -1;

        supports = aliasNames.some((key) => {
          return containsSubstring(key);
        });
        supports =
          supports ||
          aliasPrefixNames.some((prefix) => {
            return containsSubstring(prefix);
          });

        return supports;
      }

      supportsSync(filename: string, currentDirectory: string) {
        return this.supports(filename, currentDirectory);
      }
      loadFile(
        filename: string,
        currentDirectory: string,
        options: Record<string, unknown>,
        enviroment: Less.Environment
      ) {
        return super.loadFile(
          resolveFile(filename, currentDirectory),
          currentDirectory,
          options,
          enviroment
        );
      }

      loadFileSync(
        filename: string,
        currentDirectory: string,
        options: Record<string, unknown>,
        enviroment: Less.Environment
      ) {
        return super.loadFileSync(
          resolveFile(filename, currentDirectory),
          currentDirectory,
          options,
          enviroment
        );
      }
    }

    pluginManager.addFileManager(new AliasPlugin());
  }
} // fork form https://github.com/dancon/less-plugin-aliases
