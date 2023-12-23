import fs from "fs";

export const isDirectory = (path) => {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};
