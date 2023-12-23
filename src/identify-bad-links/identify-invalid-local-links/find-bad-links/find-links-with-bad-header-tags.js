import { reject } from "lodash";
import { badLinkReasons } from "../../../constants";
import { doesFileExist, match } from "../../../utils";
import { badHeaderTags } from "./utils/bad-header-tags";

export const findLinksWithBadHeaderTags = (linkObjects) => {
  const linksExcludingLineNumberTags = reject(linkObjects, isLineNumberTag);

  return [
    ...findMissingHeaderTags(linksExcludingLineNumberTags),
    ...findCaseInsensitiveHeaderTags(linksExcludingLineNumberTags),
    ...findHeaderLinksWithTooManyHashCharacters(linksExcludingLineNumberTags),
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

const findMissingHeaderTags = (linkObjects) => {
  const workingLinks = linkObjects.filter((linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  return badHeaderTags(
    workingLinks.filter(
      ({ linkTag, linkFileExtension, matchedFiles }) =>
        linkTag &&
        [linkFileExtension, matchedFiles[0]?.extension].includes(".md")
    )
  ).map((linkObject) => ({
    ...linkObject,
    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
  }));
};

const findHeaderLinksWithTooManyHashCharacters = (linkObjects) => {
  const workingLinks = linkObjects.filter((linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  return workingLinks
    .filter(({ link }) => match(link, /#/g).length >= 2)
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.TOO_MANY_HASH_CHARACTERS],
    }));
};
