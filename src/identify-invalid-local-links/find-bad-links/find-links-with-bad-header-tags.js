import { doesFileExist } from "../../utils/does-file-exist";
import { badLinkReasons } from "../../config/bad-link-reasons";
import { badHeaderTags } from "./utils/bad-header-tags";

export const findLinksWithBadHeaderTags = (linkObjects) => {
  const workingLinks = linkObjects.filter((linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  return badHeaderTags(
    workingLinks.filter(
      ({ tag, linkFileExtension }) => tag && linkFileExtension === ".md"
    )
  ).map((linkObject) => ({
    ...linkObject,
    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
  }));
};
