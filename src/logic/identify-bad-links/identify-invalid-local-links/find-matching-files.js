import fs from "fs";
import { doesFileExist } from "../../../utils";

export const findMatchingFiles = ({ fullPath, name }) => {
  const directoryToCheckForMatchingFiles = fullPath.replace(name, "");
  const filesInDirectory = doesFileExist(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return filesInDirectory?.filter((fileInDirectory) => {
    return fileInDirectory.startsWith(name);
  });
};
