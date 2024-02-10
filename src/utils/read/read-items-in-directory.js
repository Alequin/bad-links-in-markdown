import fs from "fs";

export const readItemsInDirectory = (directory) => {
  return fs.readdirSync(directory);
};
