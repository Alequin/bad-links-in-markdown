import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithBadHeaderTags } from "./identify-links-with-bad-header-tags";

export const findMissingLinksWithFileExtensions = (linksWithFileExtensions) => {
  const [badLinks, workingLinks] = partition(
    linksWithFileExtensions,
    (linkObject) => !fs.existsSync(linkObject.fullPath)
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    })),
    ...identifyLinksWithBadHeaderTags(
      workingLinks.filter(({ tag }) => tag)
    ).map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
    })),
  ];
};
