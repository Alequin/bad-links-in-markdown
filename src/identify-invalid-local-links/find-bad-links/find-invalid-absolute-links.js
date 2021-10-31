import { badLinkReasons } from "./bad-link-reasons";

export const absoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ link }) => /^\w:/.test(link))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.BAD_ABSOLUTE_LINK],
    }));

export const absoluteImageLinks = (linkObjects) =>
  linkObjects
    .filter(({ link, isImage }) => isImage && /^\/?\w:/.test(link))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
    }));
