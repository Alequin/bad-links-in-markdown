import fs from "fs";
import { first, last } from "lodash";
import path from "path";
import { LINK_TYPE } from "../config/link-type";
import { doesFileExist } from "../utils/does-file-exist";
import { doesLinkStartWithRelativePath } from "../utils/does-link-start-with-relative-path";
import {
  isLocalLink,
  isLocalQuotedAnchorLink,
} from "../utils/link-type-checks";
import { match } from "../utils/match";

/**
 * @param {{
 * markdownLink: String
 * linkPath: String | undefined
 * linkTag: String | undefined
 * isImage: Boolean
 * type: String
 * }} fileObject
 * @returns {{
 * type: String
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
 * matchedFileExtension: String | null
 * rawLink: String
 * isLinkMissingFileExtension: Boolean
 * linkFileExtension: String
 * }}
 */
export const prepareLinkObjects = (fileObject) =>
  fileObject.links
    .filter(({ type, linkPath, linkTag }) => {
      if (isLocalLink(linkPath, linkTag)) return true;

      return (
        type === LINK_TYPE.quotedAnchorLink &&
        isLocalQuotedAnchorLink(linkPath, linkTag)
      );
    })
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
  if (
    [LINK_TYPE.unquotedAnchorLink, LINK_TYPE.quotedAnchorLink].includes(
      linkObject.type
    )
  ) {
    // Anchor tags must have exact links and so cannot have matching files
    return {
      ...linkObject,
      matchedFileCount: 0,
      matchedFile: null,
    };
  }

  const matchedFiles = findMatchingFiles(linkObject);
  const firstMatchedFile = first(matchedFiles) || null;
  return {
    ...linkObject,
    matchedFileCount: matchedFiles?.length || 0,
    matchedFile: firstMatchedFile,
    matchedFileExtension: firstMatchedFile
      ? getFileExtension(firstMatchedFile)
      : null,
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
  const { linkPath, fullPath, matchedFileExtension } = linkObject;

  const fileExtension =
    getFileExtension(linkPath) || getFileExtension(fullPath);

  return {
    ...linkObject,
    rawLinkPath: linkPath,
    linkPath: fileExtension
      ? linkPath
      : `${linkPath}${matchedFileExtension || ""}`,
    isLinkMissingFileExtension: !fileExtension,
    linkFileExtension: fileExtension,
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
    fullPath: `${linkObject.fullPath}${
      linkObject.linkFileExtension || linkObject.matchedFileExtension || ""
    }`,
  };
};
