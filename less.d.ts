declare namespace Less {
  interface FileContent {
    filename: string;
    contents: string;
  }

  interface FileContentWithError {
    error: Error;
    filename: string;
    contents: string;
  }

  interface FileManager {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): FileManager;
    getPath?(filename: string): string;
    tryAppendLessExtension?(filename: string): string;
    alwaysMakePathsAbsolute?(): boolean;
    isPathAbsolute(path: string): boolean;
    join?(basePath: string, laterPath: string): string;
    pathDiff?(path: string, basePath: string): string;
    supportsSync?(
      filename: string,
      currentDirectory: string,
      options: Record<string, unknown>,
      environment: unknown
    ): boolean;
    supports?(
      filename: string,
      currentDirectory: string,
      options: Record<string, unknown>,
      environment: unknown
    ): boolean;
    loadFile(
      filename: string,
      currentDirectory: string,
      options: Record<string, unknown>,
      environment: unknown,
      // eslint-disable-next-line @typescript-eslint/ban-types
      callback: Function
    ): Promise<FileContent>;
    loadFileSync(
      filename: string,
      currentDirectory: string,
      options: Record<string, unknown>,
      environment: unknown,
      // eslint-disable-next-line @typescript-eslint/ban-types
      callback: Function
    ): FileContentWithError;
  }

  interface PluginManager {
    addFileManager(manager: Less.FileManager): void;
  }
}

interface LessStatic {
  FileManager: Less.FileManager;
}
