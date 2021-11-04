import fs from "fs";
import { isEmpty, last } from "lodash";
import path from "path";
import { isWindowsOs } from "../is-windows-os";
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
          localLinks.filter(({ isLinkMissingFileExtension }) => !isLinkMissingFileExtension)
        ),
        ...findLinksWithoutExtensionsAsBad(
          localLinks.filter(({ isLinkMissingFileExtension }) => isLinkMissingFileExtension)
        ),
        ...findLinksWithBadHeaderTags(localLinks),
      ]);

      const windowsSpecificMissingLinks = isWindowsOs()
        ? [
            ...findInvalidAbsoluteLinks.absoluteLinks(localLinks),
            ...findInvalidAbsoluteLinks.absoluteImageLinks(localLinks),
          ]
        : [];

      return {
        filePath: sourceFilePath,
        missingLinks: [...missingLinks, ...windowsSpecificMissingLinks].map(
          ({ markdownLink, reasons }) => ({
            link: markdownLink,
            reasons,
          })
        ),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

const prepareLinkObjects = (links, directory) =>
  links
    .filter(isLocalLink)
    .map(addDirectoryToObject(directory))
    .map(addFullPathToObject)
    .map(addRawFileNameToObject)
    .map(addMatchingFilesInDirectoryToLinks)
    .map(addFileExtension)
    .map(appendFileExtensionToFullPath);

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) || IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

const addDirectoryToObject = (directory) => (linkObject) => {
  return {
    ...linkObject,
    directory: directory,
  };
};

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const addMatchingFilesInDirectoryToLinks = (linkObject) => {
  const directoryToCheckForMatchingFiles = linkObject.fullPath.replace(linkObject.name, "");
  const filesInDirectory = fs.existsSync(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return {
    ...linkObject,
    matchedFileCount:
      filesInDirectory?.filter((fileInDirectory) => fileInDirectory.includes(linkObject.name))
        ?.length || null,
    matchedFile:
      filesInDirectory?.find((fileInDirectory) => fileInDirectory.includes(linkObject.name)) ||
      null,
  };
};

const addFileExtension = (linkObject) => {
  const fileExtension = getFileExtension(linkObject.link);
  const fileExtensionToUse = fileExtension || getFileExtension(linkObject?.matchedFile);

  return {
    ...linkObject,
    rawLink: linkObject.link,
    link: fileExtension ? linkObject.link : `${linkObject.link}${fileExtensionToUse || ""}`,
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
    fullPath: getFullPathFromAbsoluteLink(linkObject) || getFullPathFromRelativeLink(linkObject),
  };
};

const appendFileExtensionToFullPath = (linkObject) => {
  if (!linkObject.isLinkMissingFileExtension) return linkObject;

  return {
    ...linkObject,
    fullPath: `${linkObject.fullPath}${linkObject.linkFileExtension || ""}`,
  };
};

const WINDOWS_ABSOLUTE_PATH_REGEX = /^\/?\w:/;
const ABSOLUTE_PATH_REGEX = /^\//;
const getFullPathFromAbsoluteLink = (linkObject) => {
  if (isWindowsOs() && WINDOWS_ABSOLUTE_PATH_REGEX.test(link))
    return linkObject.link.startsWith("/") ? linkObject.link.slice(1) : linkObject.link;

  return ABSOLUTE_PATH_REGEX.test(linkObject.link) ? linkObject.link : null;
};

const getFullPathFromRelativeLink = (linkObject) => {
  const relativeLink = doesLinkStartWithRelativePath(linkObject.link)
    ? linkObject.link
    : `./${linkObject.link}`;
  return path.resolve(linkObject.directory, relativeLink);
};

const doesLinkStartWithRelativePath = (link) => link.startsWith("./") || link.startsWith("../");
