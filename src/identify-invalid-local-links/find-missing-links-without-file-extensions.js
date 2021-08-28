import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyLinksWithBadHeaderTags } from "./identify-links-with-bad-header-tags";

export const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  const linksWithMatchedFile = linksWithoutFileExtensions.map((linkObject) => {
    const matchedFile = filesInDirectory.find((fileInDirectory) =>
      fileInDirectory.includes(linkObject.name)
    );

    return {
      ...linkObject,
      matchedFile,
      fullPath: `${directory}/${matchedFile}`,
    };
  });

  const [linkWithFiles, badLinks] = partition(
    linksWithMatchedFile,
    ({ matchedFile }) => matchedFile
  );

  const linksWithBadHeaderTags = identifyLinksWithBadHeaderTags(
    linkWithFiles.filter(({ tag }) => tag)
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    })),
    ...linksWithBadHeaderTags.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
    })),
  ];
};
