import fs from "fs";
import { badLinkReasons } from "../../../constants";
import { newReasonObject } from "../reason-object";

export const findIssuesForWindowsAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ linkPath }) => /^\/?\w:/.test(linkPath))
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
      ])
    );

export const findIssuesForBadRootAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter((linkObject) => linkObject.isAbsoluteLink)
    .filter((linkObject) => {
      const doesLinkStartWithAnyRootFileNames = fs
        .readdirSync(linkObject.containingFile.topLevelDirectory)
        .some((fileName) => linkObject.linkPath.startsWith(`/${fileName}`));

      return !doesLinkStartWithAnyRootFileNames;
    })
    .map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
      ])
    );
