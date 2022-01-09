import fs from "fs";

/**
 * Determins if the given file path points at a file that exists.
 *
 * It will check:
 * - If the path as it is given exists
 * - If the path after it has been URI decoded exists
 *
 */
export const doesFileExist = (filePath) => {
  return fs.existsSync(filePath) || fs.existsSync(decodeURIComponent(filePath));
};
