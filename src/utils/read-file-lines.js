import { readFile } from "./read-file";

export const readFileLines = (filePath) =>
  readFile(filePath)
    .toString()
    .split(/\n|\r\n/);
