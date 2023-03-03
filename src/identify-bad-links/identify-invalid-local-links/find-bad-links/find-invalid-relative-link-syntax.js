import { badLinkReasons } from "../../../config/bad-link-reasons";

const MULTIPLE_DOTS_AT_START_REGEX = /^\.\.\.+/;
export const findInvalidRelativeLinkSyntax = (linkObjects) => {
  return linkObjects
    .filter(({ linkPath }) => MULTIPLE_DOTS_AT_START_REGEX.test(linkPath))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.BAD_RELATIVE_LINK_SYNTAX],
    }));
};
