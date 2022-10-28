import fs from "fs";
import { first, last } from "lodash";
import path from "path";
import { LINK_TYPE } from "../../config/link-type";
import { doesFileExist } from "../../utils/does-file-exist";
import { doesLinkStartWithRelativePath } from "../../utils/does-link-start-with-relative-path";
import {
  isLocalLink,
  isLocalQuotedAnchorLink,
} from "../../utils/link-type-checks";
import { match } from "../../utils/match";

const ABSOLUTE_PATH_REGEX = /^\//;

/**
 * @returns {{
 * type: String
 * name: String
 * link: String
 * isImage: Boolean
 * linkPath: String | null
 * linkTag: String | null
 * markdownLink: String
 * directory: String
 * rawFullPath: String
 * sourceFilePath: String
 * isAbsoluteLink: Boolean
 * topLevelDirectory: String
 * isInternalFileLink: Boolean
 * linkFileExtension: String
 * rawLinkPath: String
 * isLinkMissingFileExtension: String
 * fullPath: String
 * matchedFileCount: number | null
 * matchedFile: String | null
 * matchedFileExtension: String | null
 * }}
 */
export const prepareLinkObjects = ({
  links,
  directory,
  topLevelDirectory,
  sourceFilePath,
}) => {
  return links
    .filter(({ type, linkPath, linkTag }) => {
      if (isLocalLink(linkPath, linkTag)) return true;

      return (
        type === LINK_TYPE.quotedAnchorLink &&
        isLocalQuotedAnchorLink(linkPath, linkTag)
      );
    })
    .map((baseObject) => {
      const isAbsoluteLink = ABSOLUTE_PATH_REGEX.test(baseObject.link);
      const isInternalFileLink = Boolean(
        !baseObject.linkPath && baseObject.linkTag
      );

      const rawFullPath = isInternalFileLink
        ? sourceFilePath
        : getRawFullPath({
            directory,
            isAbsoluteLink,
            topLevelDirectory,
            linkPath: baseObject.linkPath,
          });

      const name = last(rawFullPath.replace(/\\|\//g, " ").split(" "));
      const matchedFiles = getMatchingFiles({
        fullPath: rawFullPath,
        name,
        type: baseObject.type,
      });
      const fileExtension =
        getFileExtension(baseObject.linkPath) || getFileExtension(rawFullPath);

      return {
        ...baseObject,
        ...matchedFiles,
        name,
        directory,
        rawFullPath, // --
        isAbsoluteLink,
        sourceFilePath,
        isAbsoluteLink,
        topLevelDirectory,
        isInternalFileLink,
        linkPath: baseObject.linkPath,
        linkFileExtension: fileExtension,
        rawLinkPath: baseObject.linkPath, // --
        isLinkMissingFileExtension: !fileExtension,
        fullPath: fileExtension
          ? rawFullPath
          : `${rawFullPath}${matchedFiles.matchedFileExtension || ""}`,
      };
    });
};

const getRawFullPath = ({
  isAbsoluteLink,
  topLevelDirectory,
  linkPath,
  directory,
}) => {
  return isAbsoluteLink
    ? path.resolve(topLevelDirectory, `./${linkPath}`)
    : path.resolve(
        directory,
        doesLinkStartWithRelativePath(linkPath) ? linkPath : `./${linkPath}`
      );
};

const getMatchingFiles = ({ fullPath, name, type }) => {
  if (
    [LINK_TYPE.unquotedAnchorLink, LINK_TYPE.quotedAnchorLink].includes(type)
  ) {
    // Anchor tags must have exact links and so cannot have matching files
    return {
      matchedFileCount: 0,
      matchedFile: null,
    };
  }

  const matchedFiles = findMatchingFiles({ fullPath, name });
  const firstMatchedFile = first(matchedFiles) || null;
  return {
    matchedFileCount: matchedFiles?.length || 0,
    matchedFile: firstMatchedFile,
    matchedFileExtension: firstMatchedFile
      ? getFileExtension(firstMatchedFile)
      : null,
  };
};

const findMatchingFiles = ({ fullPath, name }) => {
  const directoryToCheckForMatchingFiles = fullPath.replace(name, "");
  const filesInDirectory = doesFileExist(directoryToCheckForMatchingFiles)
    ? fs.readdirSync(directoryToCheckForMatchingFiles)
    : null;

  return filesInDirectory?.filter((fileInDirectory) => {
    return fileInDirectory.startsWith(name);
  });
};

// https://www.computerhope.com/jargon/f/fileext.htm
const CAPTURE_FILE_EXTENSION_REGEX = /(\.*\.[\w\d]*$)/;
const getFileExtension = (link) =>
  match(link, CAPTURE_FILE_EXTENSION_REGEX)[1] || null;
