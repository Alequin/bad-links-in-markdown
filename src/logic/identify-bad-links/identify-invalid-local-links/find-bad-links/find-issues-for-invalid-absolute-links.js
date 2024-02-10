import { badLinkReasons } from "../../../../constants";
import { readItemsInDirectory } from "../../../../utils";
import { newReasonObject } from "../reason-object";

export const findIssuesForWindowsAbsoluteLinks = (linkObjects) => {
  return linkObjects
    .filter(({ linkPath }) => /^\/?\w:/.test(linkPath))
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
      ])
    );
};

export const findIssuesForBadRootAbsoluteLinks = (linkObjects) => {
  return linkObjects
    .filter(({ isAbsoluteLink }) => isAbsoluteLink)
    .filter(({ containingFile }) => containingFile.gitRepositoryDirectory)
    .filter((linkObject) => {
      const doesLinkStartFromGitRepoDirectory = readItemsInDirectory(
        linkObject.containingFile.gitRepositoryDirectory
      ).some((fileName) => linkObject.linkPath.startsWith(`/${fileName}`));

      return !doesLinkStartFromGitRepoDirectory;
    })
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
      ])
    );
};
