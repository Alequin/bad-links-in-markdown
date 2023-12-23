import { partition } from "lodash";
import { badLinkReasons } from "../../../constants";
import { isDirectory } from "../../../utils";

export const findLinksWithoutExtensions = (linksWithoutFileExtensions) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    removeDirectoryLinkObjects(linksWithoutFileExtensions),
    ({ matchedFiles }) => matchedFiles[0]
  );

  const linksWithMultiplePossibleFiles = linksWithMatchedFiles.filter(
    ({ matchedFiles }) => matchedFiles.length >= 2
  );

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

const removeDirectoryLinkObjects = (linkObjects) =>
  linkObjects.filter(({ fullPath }) => !isDirectory(fullPath));
