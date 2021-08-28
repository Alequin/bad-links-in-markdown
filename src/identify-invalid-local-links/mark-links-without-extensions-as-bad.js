import fs from "fs";
import { partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";
import { identifyMarkdownLinksWithBadHeaderTags } from "./identify-markdown-links-with-bad-header-tags";

export const markLinksWithoutExtensionsAsBad = (
  linksWithoutFileExtensions,
  directory
) => {
  const [linksWithMatchedFiles, badLinks] = partition(
    addMatchingFilesInDirectoryToLinks(linksWithoutFileExtensions, directory),
    ({ matchedFile }) => matchedFile
  );

  const [markdownFilesWithMatchedFiles, otherFileTypesWithMatchedFiles] =
    partition(linksWithMatchedFiles, ({ matchedFile }) =>
      matchedFile.endsWith(".md")
    );

  const [taggedMarkdownFiles, untaggedMarkdownFiles] = partition(
    markdownFilesWithMatchedFiles,
    ({ tag }) => tag
  );

  const linksWhichAreOnlyMissingAFileExtension = [
    ...otherFileTypesWithMatchedFiles,
    ...untaggedMarkdownFiles,
  ];

  const markdownLinksWithBadHeaderTags =
    identifyMarkdownLinksWithBadHeaderTags(taggedMarkdownFiles);

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reasons: [
        badLinkReasons.FILE_NOT_FOUND,
        badLinkReasons.MISSING_FILE_EXTENSION,
      ],
    })),
    ...linksWhichAreOnlyMissingAFileExtension.map((linkObject) => ({
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
