import fs from "fs";
import { last } from "lodash";
import path from "path";
import { match } from "../match";

export const prepareLinkObjects = (fileObject) =>
  fileObject.links
    .filter(isLocalLink)
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

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) => {
  return (
    (doesLinkStartWithRelativePath(link) ||
      IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link)) &&
    !link?.startsWith("http")
  );
};

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
  const filesInDirectory = fs.existsSync(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return {
    ...linkObject,
    matchedFileCount:
      filesInDirectory?.filter((fileInDirectory) =>
        fileInDirectory.includes(linkObject.name)
      )?.length || null,
    matchedFile:
      filesInDirectory?.find((fileInDirectory) =>
        fileInDirectory.includes(linkObject.name)
      ) || null,
  };
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

const IS_RELATIVE_LINK_REGEX = /^\.*/;
const doesLinkStartWithRelativePath = (link) =>
  IS_RELATIVE_LINK_REGEX.test(link);
