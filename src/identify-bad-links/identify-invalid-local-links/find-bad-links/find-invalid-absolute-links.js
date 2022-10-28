import fs from "fs";
import { badLinkReasons } from "../../../config/bad-link-reasons";

export const windowsAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ linkPath }) => /^\/?\w:/.test(linkPath))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK],
    }));

export const badRootAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter((linkObject) => linkObject.isAbsoluteLink)
    .filter((linkObject) => {
      const doesLinkStartWithAnyRootFileNames = fs
        .readdirSync(linkObject.topLevelDirectory)
        .some((fileName) => linkObject.linkPath.startsWith(`/${fileName}`));

      return !doesLinkStartWithAnyRootFileNames;
    })
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT],
    }));
