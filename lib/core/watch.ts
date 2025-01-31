import chokidar from "chokidar";
import { alerts } from "./alerts";
import { listFilesAndPerformSanityChecks } from "./list-files-and-perform-sanity-checks";
import { removeLESSTypeDefinitionFile } from "./remove-file";
import { MainOptions } from "./types";
import { writeFile } from "./write-file";

/**
 * Watch a file glob and generate the corresponding types.
 *
 * @param pattern the file pattern to watch for file changes or additions
 * @param options the CLI options
 */
export const watch = (pattern: string, options: MainOptions): void => {
  listFilesAndPerformSanityChecks(pattern, options);

  alerts.success("Watching files...");

  chokidar
    .watch(pattern, {
      ignoreInitial: options.ignoreInitial,
      ignored: options.ignore,
    })
    .on("change", (path) => {
      alerts.info(`[CHANGED] ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      writeFile(path, options);
    })
    .on("add", (path) => {
      alerts.info(`[ADDED] ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      writeFile(path, options);
    })
    .on("unlink", (path) => {
      alerts.info(`[REMOVED] ${path}`);
      removeLESSTypeDefinitionFile(path, options);
    });
};
