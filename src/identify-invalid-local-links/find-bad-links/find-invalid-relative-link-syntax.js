import { badLinkReasons } from "./bad-link-reasons";

const MULTIPLE_DOTS_AT_START_REGEX = /^\.\.\.+/;
export const findInvalidRelativeLinkSyntax = (linkObjects) => {
  return linkObjects
    .filter(({ rawLink }) => MULTIPLE_DOTS_AT_START_REGEX.test(rawLink))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.BAD_RELATIVE_LINK_SYNTAX],
    }));
};
