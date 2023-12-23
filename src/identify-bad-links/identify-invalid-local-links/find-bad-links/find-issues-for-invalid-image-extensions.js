import { badLinkReasons, validImageExtensions } from "../../../constants";
import { newReasonObject } from "../reason-object";

export const findIssuesForInvalidImageExtensions = (linkObjects) => {
  return linkObjects

    .filter(
      ({ isImage, linkFileExtension }) =>
        isImage &&
        linkFileExtension &&
        !validImageExtensions.includes(linkFileExtension.toLowerCase())
    )
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.INVALID_IMAGE_EXTENSIONS,
      ])
    );
};
