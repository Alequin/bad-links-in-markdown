import { badLinkReasons } from "./bad-link-reasons";
import { validImageExtensions } from "../../config/valid-image-extensions";

export const findInvalidImageExtensions = (linkObjects) => {
  return linkObjects

    .filter(
      ({ isImage, isLinkMissingFileExtension, linkFileExtension }) =>
        isImage &&
        !isLinkMissingFileExtension &&
        !validImageExtensions.includes(linkFileExtension.toLowerCase())
    )
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.INVALID_IMAGE_EXTENSIONS],
    }));
};
