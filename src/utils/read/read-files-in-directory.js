import fs from "fs";

export const readFilesInDirectory = (directory) => {
  return fs.readdirSync(directory);
};
