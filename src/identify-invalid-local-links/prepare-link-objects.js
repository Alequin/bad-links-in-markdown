import fs from "fs";
import { last } from "lodash";
import path from "path";

export const prepareLinkObjects = (links, directory, sourceFilePath) =>
  links
    .filter(isLocalLink)
    .map((linkObject) => ({ ...linkObject, directory, sourceFilePath }))
    .map(addIsInternalFileLink)
    .map(addFullPathToObject)
    .map(addRawFileNameToObject)
    .map(addMatchingFilesInDirectoryToLinks)
    .map(addFileExtension)
    .map(appendFileExtensionToFullPath);

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  (doesLinkStartWithRelativePath(link) ||
    IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link)) &&
  !link?.startsWith("http");

const addIsInternalFileLink = (linkObject) => {
  return {
    ...linkObject,
    isInternalFileLink: Boolean(!linkObject.link && linkObject.tag),
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
        fullPath:
          getFullPathFromAbsoluteLink(linkObject) ||
          getFullPathFromRelativeLink(linkObject),
      };
};

const ABSOLUTE_PATH_REGEX = /^\//;
const getFullPathFromAbsoluteLink = (linkObject) => {
  return ABSOLUTE_PATH_REGEX.test(linkObject.link) ? linkObject.link : null;
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
  link?.match(CAPTURE_FILE_EXTENSION_REGEX)?.[1] || null;

const appendFileExtensionToFullPath = (linkObject) => {
  if (!linkObject.isLinkMissingFileExtension) return linkObject;

  return {
    ...linkObject,
    fullPath: `${linkObject.fullPath}${linkObject.linkFileExtension || ""}`,
  };
};

const IS_RELATIVE_LINK_REGEX = /^\.*/;
const doesLinkStartWithRelativePath = (link) =>
  IS_RELATIVE_LINK_REGEX.test(link);
