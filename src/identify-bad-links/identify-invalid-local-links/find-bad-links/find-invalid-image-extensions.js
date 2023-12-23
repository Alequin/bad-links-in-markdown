import { badLinkReasons, validImageExtensions } from "../../../constants";

export const findInvalidImageExtensions = (linkObjects) => {
  return linkObjects

    .filter(
      ({ isImage, linkFileExtension }) =>
        isImage &&
        linkFileExtension &&
        !validImageExtensions.includes(linkFileExtension.toLowerCase())
    )
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.INVALID_IMAGE_EXTENSIONS],
    }));
};
