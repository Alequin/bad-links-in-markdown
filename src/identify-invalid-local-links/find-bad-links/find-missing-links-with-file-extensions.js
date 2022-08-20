import { partition } from "lodash";
import { doesFileExist } from "../../utils/does-file-exist";
import { badLinkReasons } from "../../config/bad-link-reasons";
import { identifyLinksWithBadLineTags } from "./utils/bad-line-tags";

export const findMissingLinksWithFileExtensions = (linkObjects) => {
  const [badLinks, workingLinks] = partition(
    linkObjects,
    (linkObject) => !doesFileExist(linkObject.fullPath)
  );

  const linkWithBadTargetLineNumbers = identifyLinksWithBadLineTags(
    workingLinks.filter(({ tag }) => tag?.startsWith("L"))
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.FILE_NOT_FOUND],
    })),
    ...linkWithBadTargetLineNumbers.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
    })),
  ];
};
