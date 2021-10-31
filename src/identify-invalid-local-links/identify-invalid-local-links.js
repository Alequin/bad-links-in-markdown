import fs from "fs";
import { isEmpty, last } from "lodash";
import path from "path";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-invalid-absolute-links";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findLinksWithoutExtensionsAsBad } from "./find-bad-links/find-links-without-extensions-as-bad";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ directory, links, sourceFilePath }) => {
      const localLinks = prepareLinkObjects(links, directory);

      const missingLinks = groupMatchingLinkObjectWithIssues([
        ...findMissingLinksWithFileExtensions(
          localLinks.filter(({ isLinkMissingFileExtension }) => !isLinkMissingFileExtension),
          directory
        ),
        ...findLinksWithoutExtensionsAsBad(
          localLinks.filter(({ isLinkMissingFileExtension }) => isLinkMissingFileExtension),
          directory
        ),
        ...findLinksWithBadHeaderTags(localLinks),
        ...findInvalidAbsoluteLinks.absoluteLinks(localLinks),
        ...findInvalidAbsoluteLinks.absoluteImageLinks(localLinks),
      ]);

      return {
        filePath: sourceFilePath,
        missingLinks: missingLinks.map(({ markdownLink, reasons }) => ({
          link: markdownLink,
          reasons,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

const prepareLinkObjects = (links, directory) =>
  links
    .filter(isLocalLink)
    .map(addDirectoryToObject(directory))
    .map(addRawFileNameToObject)
    .map(addMatchingFilesInDirectoryToLinks)
    .map(addFileExtension)
    .map(addFullPathToObject);

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) || IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

const addDirectoryToObject = (directory) => (linkObject) => {
  return {
    ...linkObject,
    directory,
  };
};

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const addMatchingFilesInDirectoryToLinks = (linkObject) => {
  const filesInDirectory = fs.readdirSync(linkObject.directory);

  const matchedFile = filesInDirectory.find((fileInDirectory) =>
    fileInDirectory.includes(linkObject.name)
  );

  return {
    ...linkObject,
    matchedFile,
  };
};

const addFileExtension = (linkObject) => {
  const fileExtension = getFileExtension(linkObject.link);
  const fileExtensionToUse = fileExtension || getFileExtension(linkObject?.matchedFile);

  return {
    ...linkObject,
    rawLink: linkObject.link,
    link: fileExtension ? linkObject.link : `${linkObject.link}${fileExtensionToUse}`,
    isLinkMissingFileExtension: !fileExtension,
    linkFileExtension: fileExtensionToUse,
  };
};

// https://www.computerhope.com/jargon/f/fileext.htm
const CAPTURE_FILE_EXTENSION_REGEX = /(\.*\.[\w\d]*$)/;
const getFileExtension = (link) => link?.match(CAPTURE_FILE_EXTENSION_REGEX)?.[1] || null;

const addFullPathToObject = (linkObject) => {
  return {
    ...linkObject,
    fullPath: getLinkFullPath(linkObject),
  };
};

const getLinkFullPath = (linkObject) => {
  if (isAbsoluteLink(linkObject.link)) {
    if (/^\w:/.test(linkObject.link)) return linkObject.link;
    return linkObject.link.slice(1);
  }

  const relativeLink = doesLinkStartWithRelativePath(linkObject.link)
    ? linkObject.link
    : `./${linkObject.link}`;
  return path.resolve(linkObject.directory, relativeLink);
};

const isAbsoluteLink = (link) => /^\/?\w:/.test(link);
const doesLinkStartWithRelativePath = (link) => link.startsWith("./") || link.startsWith("../");
