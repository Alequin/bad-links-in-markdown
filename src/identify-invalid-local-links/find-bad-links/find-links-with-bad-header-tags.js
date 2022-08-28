import { doesFileExist } from "../../utils/does-file-exist";
import { badLinkReasons } from "../../config/bad-link-reasons";
import { badHeaderTags } from "./utils/bad-header-tags";
import { reject } from "lodash";

export const findLinksWithBadHeaderTags = (linkObjects) => {
  const linksExcludingLineNumberTags = reject(linkObjects, isLineNumberTag);

  return [
    ...findCaseInsensitiveHeaderTags(linksExcludingLineNumberTags),
    ...findBrokenHeaderTags(linksExcludingLineNumberTags),
  ];
};

const LINE_NUMBER_TAG_REGEX = /l\d+/i;
const isLineNumberTag = ({ linkTag }) =>
  linkTag && LINE_NUMBER_TAG_REGEX.test(linkTag);

const findCaseInsensitiveHeaderTags = (linkObjects) => {
  return linkObjects
    .filter(({ linkTag }) => linkTag && linkTag !== linkTag.toLowerCase())
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
    }));
};

const findBrokenHeaderTags = (linkObjects) => {
  const workingLinks = linkObjects.filter((linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  return badHeaderTags(
    workingLinks.filter(
      ({ linkTag, linkFileExtension }) => linkTag && linkFileExtension === ".md"
    )
  ).map((linkObject) => ({
    ...linkObject,
    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
  }));
};
