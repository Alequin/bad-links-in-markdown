import fs from "fs";

export const isDirectory = (filePath) =>
  fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
