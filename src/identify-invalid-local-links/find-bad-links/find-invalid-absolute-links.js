import { badLinkReasons } from "./bad-link-reasons";

export const windowsAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ link }) => /^\/?\w:/.test(link))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK],
    }));
