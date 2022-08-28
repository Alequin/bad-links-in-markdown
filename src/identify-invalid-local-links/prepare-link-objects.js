import fs from "fs";
import { first, last } from "lodash";
import path from "path";
import { match } from "../utils/match";
import { isLocalLink } from "../utils/link-type-checks";
import { doesLinkStartWithRelativePath } from "../utils/does-link-start-with-relative-path";
import { doesFileExist } from "../utils/does-file-exist";
import { LINK_TYPE } from "../config/link-type";

/**
 * @param {{
 * markdownLink: String
 * linkPath: String | undefined
 * linkTag: String | undefined
 * isImage: Boolean
 * }} fileObject
 * @returns {{
 * markdownLink: String
 * link: String
 * linkPath: String | null
 * linkTag: String | null
 * isImage: Boolean
 * directory: String
 * topLevelDirectory: String
 * sourceFilePath: String
 * isInternalFileLink: Boolean
 * isAbsoluteLink: Boolean
 * fullPath: String
 * name: String
 * matchedFileCount: number | null
 * matchedFile: String | null
 * rawLink: String
 * isLinkMissingFileExtension: Boolean
 * linkFileExtension: String
 * }}
 */
export const prepareLinkObjects = (fileObject) =>
  fileObject.links
    .filter(({ linkPath, linkTag }) => isLocalLink(linkPath, linkTag))
    .map((linkObject) => ({
      ...linkObject,
      directory: fileObject.directory,
      topLevelDirectory: fileObject.topLevelDirectory,
      sourceFilePath: fileObject.sourceFilePath,
    }))
    .map(addIsInternalFileLink)
    .map(addIsAbsoluteLink)
    .map(addFullPathToObject)
    .map(addRawFileNameToObject)
    .map(addMatchingFilesInDirectoryToLinks)
    .map(addFileExtension)
    .map(appendFileExtensionToFullPath)
    .map((object) => Object.freeze(object));

const addIsInternalFileLink = (linkObject) => {
  return {
    ...linkObject,
    isInternalFileLink: Boolean(!linkObject.linkPath && linkObject.linkTag),
  };
};

const ABSOLUTE_PATH_REGEX = /^\//;
const addIsAbsoluteLink = (linkObject) => {
  return {
    ...linkObject,
    isAbsoluteLink: ABSOLUTE_PATH_REGEX.test(linkObject.link),
  };
};

const addFullPathToObject = (linkObject) => {
  return linkObject.isInternalFileLink
    ? {
        ...linkObject,
        fullPath: linkObject.sourceFilePath,
      }
    : {
        ...linkObject,
        fullPath: linkObject.isAbsoluteLink
          ? path.resolve(
              linkObject.topLevelDirectory,
              `./${linkObject.linkPath}`
            )
          : getFullPathFromRelativeLink(linkObject),
      };
};

const getFullPathFromRelativeLink = (linkObject) => {
  return path.resolve(
    linkObject.directory,
    doesLinkStartWithRelativePath(linkObject.linkPath)
      ? linkObject.linkPath
      : `./${linkObject.linkPath}`
  );
};

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.fullPath.replace(/\\|\//g, " ").split(" ")),
  };
};

const addMatchingFilesInDirectoryToLinks = (linkObject) => {
  if (linkObject.type === LINK_TYPE.anchorLink) {
    // Anchor tags must have exact links and so cannot have matching files
    return {
      ...linkObject,
      matchedFileCount: 0,
      matchedFile: null,
    };
  }

  const matchedFiles = findMatchingFiles(linkObject);
  return {
    ...linkObject,
    matchedFileCount: matchedFiles?.length || 0,
    matchedFile: first(matchedFiles) || null,
  };
};

const findMatchingFiles = (linkObject) => {
  const directoryToCheckForMatchingFiles = linkObject.fullPath.replace(
    linkObject.name,
    ""
  );
  const filesInDirectory = doesFileExist(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return filesInDirectory?.filter(isMatchFile(linkObject));
};

const isMatchFile = (linkObject) => (fileInDirectory) => {
  return fileInDirectory.startsWith(linkObject.name);
};

const addFileExtension = (linkObject) => {
  const { linkPath, fullPath } = linkObject;

  const fileExtension =
    getFileExtension(linkPath) || getFileExtension(fullPath);
  const fileExtensionToUse =
    fileExtension || getFileExtension(linkObject?.matchedFile);

  return {
    ...linkObject,
    rawLinkPath: linkPath,
    linkPath: fileExtension
      ? linkPath
      : `${linkPath}${fileExtensionToUse || ""}`,
    isLinkMissingFileExtension: !fileExtension,
    linkFileExtension: fileExtensionToUse, // TODO make it clear why isLinkMissingFileExtension might be false and linkFileExtension might be a value
  };
};

// https://www.computerhope.com/jargon/f/fileext.htm
const CAPTURE_FILE_EXTENSION_REGEX = /(\.*\.[\w\d]*$)/;
const getFileExtension = (link) =>
  match(link, CAPTURE_FILE_EXTENSION_REGEX)[1] || null;

const appendFileExtensionToFullPath = (linkObject) => {
  if (!linkObject.isLinkMissingFileExtension) return linkObject;

  return {
    ...linkObject,
    rawFullPath: linkObject.fullPath,
    fullPath: `${linkObject.fullPath}${linkObject.linkFileExtension || ""}`,
  };
};
