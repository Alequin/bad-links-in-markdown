import { readMarkdownFile } from "./read-markdown-file";

export const readMarkdownFileLines = (filePath) =>
  readMarkdownFile(filePath).split(/\n|\r\n/);
