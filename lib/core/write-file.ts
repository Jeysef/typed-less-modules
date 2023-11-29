import fs from "fs";
import path from "path";
import { fileToClassNames } from "../less";
import {
    classNamesToTypeDefinitions,
    getTypeDefinitionPath,
} from "../typescript";
import { alerts } from "./alerts";
import { removeLESSTypeDefinitionFile } from "./remove-file";
import { MainOptions } from "./types";

/**
 * Given a single file generate the proper types.
 *
 * @param file the LESS file to generate types for
 * @param options the CLI options
 */
export const writeFile = async (
    file: string,
    options: MainOptions
): Promise<void> => {
    try {
        const classNames = await fileToClassNames(file, options);
        const typeDefinition = await classNamesToTypeDefinitions({
            classNames,
            ...options,
        });

        const typesPath = getTypeDefinitionPath(file, options);
        const typesExist = fs.existsSync(typesPath);

        // Avoid outputting empty type definition files.
        // If the file exists and the type definition is now empty, remove the file.
        if (!typeDefinition) {
            if (typesExist) {
                removeLESSTypeDefinitionFile(file, options);
            } else {
                alerts.notice(`[NO GENERATED TYPES] ${file}`);
            }
            return;
        }

        // Avoid re-writing the file if it hasn't changed.
        // First by checking the file modification time, then
        // by comparing the file contents.
        if (options.updateStaleOnly && typesExist) {
            const fileModified = fs.statSync(file).mtime;
            const typeDefinitionModified = fs.statSync(typesPath).mtime;

            if (fileModified < typeDefinitionModified) {
                return;
            }

            const existingTypeDefinition = fs.readFileSync(typesPath, "utf8");
            if (existingTypeDefinition === typeDefinition) {
                return;
            }
        }

        // Files can be written to arbitrary directories and need to
        // be nested to match the project structure so it's possible
        // there are multiple directories that need to be created.
        const dirname = path.dirname(typesPath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }

        fs.writeFileSync(typesPath, typeDefinition);
        alerts.success(`[GENERATED TYPES] ${typesPath}`);
    } catch (error) {
        const { message, filename, line, column } = error as Less.RenderError;
        const location = filename ? `(${filename}[${line}:${column}])` : "";
        alerts.error(`${message} ${location}`);
    }
};
