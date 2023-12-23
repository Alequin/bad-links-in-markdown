import { isEmpty, last } from "lodash";
import path from "path";
import { LINK_TYPE } from "../../constants";
import {
  doesLinkStartWithRelativePath,
  isDirectory,
  isLocalLink,
  match,
} from "../../utils";
import { findMatchingFiles } from "./find-matching-files";

const ABSOLUTE_PATH_REGEX = /^\//;

export const prepareLocalLinkObjects = ({
  links,
  directory,
  targetDirectory,
  sourceFilePath,
}) => {
  return links
    .filter(({ type, linkPath, linkTag }) =>
      isLocalLink(linkPath, linkTag, type)
    )
    .map((baseObject) => {
      const isAbsoluteLink = ABSOLUTE_PATH_REGEX.test(baseObject.link);
      const isTagOnlyLink = Boolean(!baseObject.linkPath && baseObject.linkTag);

      const rawFullLinkPath = isTagOnlyLink
        ? sourceFilePath
        : getlinkRawFullPath({
            directory,
            isAbsoluteLink,
            targetDirectory,
            linkPath: baseObject.linkPath,
          });

      const name = last(rawFullLinkPath.replace(/\\|\//g, " ").split(" "));
      const matchedFiles = getMatchingFiles({
        fullPath: rawFullLinkPath,
        name,
        type: baseObject.type,
      });

      const fileExtension =
        getFileExtension(baseObject.linkPath) ||
        getFileExtension(rawFullLinkPath);

      return {
        ...baseObject,
        matchedFiles,
        containingFile: {
          directory,
          targetDirectory,
        },
        name,
        isTagOnlyLink,
        isAbsoluteLink,
        linkFileExtension: fileExtension,
        isExistingDirectory: isDirectory(rawFullLinkPath),
        fullPath: fileExtension
          ? rawFullLinkPath
          : `${rawFullLinkPath}${matchedFiles[0]?.extension || ""}`,
      };
    });
};

const getlinkRawFullPath = ({
  isAbsoluteLink,
  targetDirectory,
  linkPath,
  directory,
}) => {
  return isAbsoluteLink
    ? path.resolve(targetDirectory, `./${linkPath}`)
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
    return [];
  }

  const matchedFiles = findMatchingFiles({ fullPath, name });
  if (isEmpty(matchedFiles)) return [];

  return matchedFiles.map((fileName) => ({
    name: fileName,
    extension: getFileExtension(fileName),
  }));
};

// https://www.computerhope.com/jargon/f/fileext.htm
const CAPTURE_FILE_EXTENSION_REGEX = /(\.*\.[\w\d]*$)/;
const getFileExtension = (link) =>
  match(link, CAPTURE_FILE_EXTENSION_REGEX)[1] || null;
