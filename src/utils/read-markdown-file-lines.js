import { readFile } from "./read-file";

export const readMarkdownFileLines = (filePath) =>
  readFile(filePath)
    .toString()
    .split(/\n|\r\n/);
