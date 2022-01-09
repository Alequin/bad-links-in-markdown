import fs from "fs";

export const readFileLines = (filePath) =>
  fs
    .readFileSync(filePath)
    .toString()
    .split(/\n|\r\n/);
