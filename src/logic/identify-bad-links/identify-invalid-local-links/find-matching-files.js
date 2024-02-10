import { doesFileExist, readItemsInDirectory } from "../../../utils";

export const findMatchingFiles = ({ fullPath, name }) => {
  const directoryToCheckForMatchingFiles = fullPath.replace(name, "");
  const filesInDirectory = doesFileExist(directoryToCheckForMatchingFiles)
    ? readItemsInDirectory(directoryToCheckForMatchingFiles)
    : null;

  return filesInDirectory?.filter((fileInDirectory) => {
    return fileInDirectory.startsWith(name);
  });
};
