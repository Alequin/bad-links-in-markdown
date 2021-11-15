import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithMultiplePossibleMatchingFiles } from "./identify-links-with-multiple-possible-matching-files";

export const findLinksWithoutExtensionsAsBad = (linksWithoutFileExtensions) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    linksWithoutFileExtensions,
    ({ matchedFile }) => matchedFile
  );

  const linksWithMultiplePossibleFiles = linksWithMatchedFiles.filter(
    ({ matchedFileCount }) => matchedFileCount >= 2
  );

  const extensionlessLinksWhichDontExist = linksWithoutFileExtensions.filter(
    ({ rawFullPath }) => !fs.existsSync(rawFullPath)
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
