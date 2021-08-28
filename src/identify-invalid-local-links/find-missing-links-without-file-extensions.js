import fs from "fs";
import { badLinkReasons } from "./bad-link-reasons";

export const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  return linksWithoutFileExtensions
    .filter(
      (linkObject) =>
        !filesInDirectory.some((fileInDirectory) =>
          fileInDirectory.includes(linkObject.name)
        )
    )
    .map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    }));
};
