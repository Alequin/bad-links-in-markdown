import { partition } from "lodash";
import { doesFileExist } from "../../utils/does-file-exist";
import { badLinkReasons } from "./bad-link-reasons";

export const findLinksWithoutExtensionsAsBad = (linksWithoutFileExtensions) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    linksWithoutFileExtensions,
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
