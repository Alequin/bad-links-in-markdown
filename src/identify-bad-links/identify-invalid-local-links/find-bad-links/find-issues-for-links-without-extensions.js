import { partition } from "lodash";
import { badLinkReasons } from "../../../constants";
import { isDirectory } from "../../../utils";
import { newReasonObject } from "../reason-object";

export const findIssuesForLinksWithoutExtensions = (
  linksWithoutFileExtensions
) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    removeDirectoryLinkObjects(linksWithoutFileExtensions),
    ({ matchedFiles }) => matchedFiles[0]
  );

  const linksWithMultiplePossibleFiles = linksWithMatchedFiles.filter(
    ({ matchedFiles }) => matchedFiles.length >= 2
  );

  return [
    ...linksWithoutFileExtensions.map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.MISSING_FILE_EXTENSION,
      ])
    ),
    ...badLinks.map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [badLinkReasons.FILE_NOT_FOUND])
    ),
    ...linksWithMultiplePossibleFiles.map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.MULTIPLE_MATCHING_FILES,
      ])
    ),
  ];
};

const removeDirectoryLinkObjects = (linkObjects) =>
  linkObjects.filter(({ fullPath }) => !isDirectory(fullPath));
