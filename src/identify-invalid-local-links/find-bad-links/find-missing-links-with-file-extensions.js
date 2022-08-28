import { partition } from "lodash";
import { doesFileExist } from "../../utils/does-file-exist";
import { badLinkReasons } from "../../config/bad-link-reasons";
import { badLineTags } from "./utils/bad-line-tags";

export const findMissingLinksWithFileExtensions = (linkObjects) => {
  const [badLinks, workingLinks] = partition(
    linkObjects,
    (linkObject) => !doesFileExist(linkObject.fullPath)
  );

  const linkWithBadTargetLineNumbers = badLineTags(
    workingLinks.filter(({ linkTag }) => linkTag?.startsWith("L"))
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
