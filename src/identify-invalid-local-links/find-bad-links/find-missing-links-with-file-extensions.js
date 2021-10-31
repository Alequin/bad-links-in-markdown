import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithBadLineTags } from "./identify-links-with-bad-line-tags";

export const findMissingLinksWithFileExtensions = (linkObjects) => {
  const [badLinks, workingLinks] = partition(
    linkObjects,
    (linkObject) => !fs.existsSync(linkObject.fullPath)
  );

  const linkWithBadTargetLineNumbers = identifyLinksWithBadLineTags(
    workingLinks.filter(({ tag }) => tag?.startsWith("L"))
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reasons: [
        linkObject.isImage ? badLinkReasons.IMAGE_FILE_NOT_FOUND : badLinkReasons.FILE_NOT_FOUND,
      ],
    })),
    ...linkWithBadTargetLineNumbers.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
    })),
  ];
};
