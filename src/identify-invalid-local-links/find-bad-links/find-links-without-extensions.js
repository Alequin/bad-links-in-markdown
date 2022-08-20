import { partition } from "lodash";
import { doesFileExist } from "../../utils/does-file-exist";
import { isDirectory } from "../../utils/is-directory";
import { badLinkReasons } from "../../config/bad-link-reasons";

export const findLinksWithoutExtensions = (linksWithoutFileExtensions) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    removeDirectoryLinkObjects(linksWithoutFileExtensions),
    ({ matchedFile }) => matchedFile
  );

  const linksWithMultiplePossibleFiles = linksWithMatchedFiles.filter(
    ({ matchedFileCount }) => matchedFileCount >= 2
  );

  const extensionlessLinksWhichDontExist = linksWithoutFileExtensions.filter(
    ({ rawFullPath }) => !doesFileExist(rawFullPath)
  );

  return [
    ...extensionlessLinksWhichDontExist.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
    })),
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.FILE_NOT_FOUND],
    })),
    ...linksWithMultiplePossibleFiles.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.MULTIPLE_MATCHING_FILES],
    })),
  ];
};

const removeDirectoryLinkObjects = (linkObjects) =>
  linkObjects.filter(({ fullPath }) => !isDirectory(fullPath));
