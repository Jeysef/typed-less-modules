import { Options } from "../less";
import { ExportType, LogLevel, QuoteType } from "../typescript";

export interface MainOptions extends Options {
  banner: string;
  pattern?: string;
  config?: string;
  lessRenderOptions?: Less.Options;
  ignore: string[];
  ignoreInitial: boolean;
  exportType: ExportType;
  exportTypeName: string;
  exportTypeInterface: string;
  listDifferent: boolean;
  quoteType: QuoteType;
  updateStaleOnly: boolean;
  watch: boolean;
  logLevel: LogLevel;
  outputFolder: string | null;
}