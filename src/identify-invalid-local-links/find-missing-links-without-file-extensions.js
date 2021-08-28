import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyMarkdownLinksWithBadHeaderTags } from "./identify-markdown-links-with-bad-header-tags";

export const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const linksWithMatchedFile = addMatchingFilesInDirectoryToLinks(
    linksWithoutFileExtensions,
    directory
  );

  const [linksWithMatchedFiles, badLinks] = partition(
    linksWithMatchedFile,
    ({ matchedFile }) => matchedFile
  );

  const [markdownFilesWithMatchedFiles, otherFileTypesWithMatchedFiles] =
    partition(linksWithMatchedFiles, ({ matchedFile }) =>
      matchedFile.endsWith(".md")
    );

  const markdownLinksWithBadHeaderTags = identifyMarkdownLinksWithBadHeaderTags(
    markdownFilesWithMatchedFiles.filter(({ tag }) => tag)
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reasons: [
        badLinkReasons.FILE_NOT_FOUND,
        badLinkReasons.MISSING_FILE_EXTENSION,
      ],
    })),
    ...otherFileTypesWithMatchedFiles.map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
    })),
    ...markdownLinksWithBadHeaderTags.map((linkObject) => ({
      ...linkObject,
      reasons: [
        badLinkReasons.HEADER_TAG_NOT_FOUND,
        badLinkReasons.MISSING_FILE_EXTENSION,
      ],
    })),
  ];
};

const addMatchingFilesInDirectoryToLinks = (links, directory) => {
  const filesInDirectory = fs.readdirSync(directory);

  return links.map((linkObject) => {
    const matchedFile = filesInDirectory.find((fileInDirectory) =>
      fileInDirectory.includes(linkObject.name)
    );

    return {
      ...linkObject,
      matchedFile,
      fullPath: `${directory}/${matchedFile}`,
    };
  });
};
