import fs from "fs";
import { last } from "lodash";
import path from "path";
import { match } from "../utils/match";
import { isLocalLink } from "../utils/link-type-checks";
import { doesLinkStartWithRelativePath } from "../utils/does-link-start-with-relative-path";
import { doesFileExist } from "../utils/does-file-exist";

export const prepareLinkObjects = (fileObject) =>
  fileObject.links
    .filter(({ link, tag }) => isLocalLink(link, tag))
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
    isInternalFileLink: Boolean(!linkObject.link && linkObject.tag),
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
          ? path.resolve(linkObject.topLevelDirectory, `./${linkObject.link}`)
          : getFullPathFromRelativeLink(linkObject),
      };
};

const getFullPathFromRelativeLink = (linkObject) => {
  return path.resolve(
    linkObject.directory,
    doesLinkStartWithRelativePath(linkObject.link)
      ? linkObject.link
      : `./${linkObject.link}`
  );
};

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.fullPath.replace(/\\|\//g, " ").split(" ")),
  };
};

const addMatchingFilesInDirectoryToLinks = (linkObject) => {
  const directoryToCheckForMatchingFiles = linkObject.fullPath.replace(
    linkObject.name,
    ""
  );
  const filesInDirectory = doesFileExist(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return {
    ...linkObject,
    matchedFileCount:
      filesInDirectory?.filter(isMatchFile(linkObject))?.length || null,
    matchedFile: filesInDirectory?.find(isMatchFile(linkObject)) || null,
  };
};

const isMatchFile = (linkObject) => (fileInDirectory) => {
  return fileInDirectory.startsWith(linkObject.name);
};

const addFileExtension = (linkObject) => {
  const fileExtension =
    getFileExtension(linkObject.link) || getFileExtension(linkObject.fullPath);
  const fileExtensionToUse =
    fileExtension || getFileExtension(linkObject?.matchedFile);

  return {
    ...linkObject,
    rawLink: linkObject.link,
    link: fileExtension
      ? linkObject.link
      : `${linkObject.link}${fileExtensionToUse || ""}`,
    isLinkMissingFileExtension: !fileExtension,
    linkFileExtension: fileExtensionToUse,
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
