import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithBadLineTags } from "./identify-links-with-bad-line-tags";
import { identifyMarkdownLinksWithBadHeaderTags } from "./identify-markdown-links-with-bad-header-tags";

export const findMissingLinksWithFileExtensions = (linksWithFileExtensions) => {
  const [badLinks, workingLinks] = partition(
    linksWithFileExtensions,
    (linkObject) => !fs.existsSync(linkObject.fullPath)
  );

  const markdownLinksWithBadTags = identifyMarkdownLinksWithBadHeaderTags(
    workingLinks.filter(({ tag, link }) => tag && link.endsWith(".md"))
  );

  const linkWithBadTargetLineNumbers = identifyLinksWithBadLineTags(
    workingLinks.filter(({ tag }) => tag?.startsWith("L"))
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    })),
    ...markdownLinksWithBadTags.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
    })),
    ...linkWithBadTargetLineNumbers.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.INVALID_TARGET_LINE_NUMBER,
    })),
  ];
};
