import { badLinkReasons } from "../../../constants";
import { newReasonObject } from "../reason-object";

const MULTIPLE_DOTS_AT_START_REGEX = /^\.\.\.+/;
export const findIssuesForInvalidRelativeLinkSyntax = (linkObjects) => {
  return linkObjects
    .filter(({ linkPath }) => MULTIPLE_DOTS_AT_START_REGEX.test(linkPath))
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.BAD_RELATIVE_LINK_SYNTAX,
      ])
    );
};
