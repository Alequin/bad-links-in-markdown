import { badLinkReasons } from "./bad-link-reasons";
import fs from "fs";

export const windowsAbsoluteLinks = (linkObjects) =>
  linkObjects
    .filter(({ link }) => /^\/?\w:/.test(link))
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
        .some((fileName) => linkObject.link.startsWith(`/${fileName}`));

      return !doesLinkStartWithAnyRootFileNames;
    })
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.INVALID_ABSOLUTE_LINK],
    }));
