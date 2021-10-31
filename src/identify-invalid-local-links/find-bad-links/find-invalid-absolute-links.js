import { badLinkReasons } from "./bad-link-reasons";

export const findInvalidAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ link }) => /^\w:/.test(link))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.BAD_ABSOLUTE_LINK],
    }));
