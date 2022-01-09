import fs from "fs";
import { isError } from "lodash";

/**
 * Reads the file at the given path
 *
 * It will attempt to read the file:
 * - with the path as it is given
 * - with the path after it has been URI decoded
 *
 */
export const readFile = (filePath) => {
  const standardReadResult = attemptToRead(filePath);
  if (!isError(standardReadResult)) return standardReadResult;

  const decodeReadResult = attemptToRead(decodeURIComponent(filePath));
  if (!isError(decodeReadResult)) return decodeReadResult;

  throw new Error(
    `The file ${filePath} cannot be found by any method\nStandard read error message: ${standardReadResult.message}\nDecode read error message: ${decodeReadResult.message}`
  );
};

const attemptToRead = (filePath) => {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    return error;
  }
};
