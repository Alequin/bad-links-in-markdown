import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithMultiplePossibleMatchingFiles } from "./identify-links-with-multiple-possible-matching-files";

export const findLinksWithoutExtensionsAsBad = (linksWithoutFileExtensions) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    linksWithoutFileExtensions,
    ({ matchedFile }) => matchedFile
  );

  const linksWithMultiplePossibleFiles =
    identifyLinksWithMultiplePossibleMatchingFiles(linksWithMatchedFiles);

  return [
    ...linksWithoutFileExtensions.map((linkObject) => ({
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
