import { first, last } from "lodash";
import path from "path";
import { LINK_TYPE } from "../../config/link-type";
import { doesLinkStartWithRelativePath } from "../../utils/does-link-start-with-relative-path";
import { isDirectory } from "../../utils/is-directory";
import { isLocalLink } from "../../utils/link-type-checks";
import { match } from "../../utils/match";
import { findMatchingFiles } from "./find-matching-files";

const ABSOLUTE_PATH_REGEX = /^\//;

export const prepareLocalLinkObjects = ({
  links,
  directory,
  topLevelDirectory,
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
            topLevelDirectory,
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
        ...matchedFiles,
        containingFile: {
          directory,
          topLevelDirectory,
        },
        name,
        isTagOnlyLink,
        isAbsoluteLink,
        linkFileExtension: fileExtension,
        isExistingDirectory: isDirectory(rawFullLinkPath),
        fullPath: fileExtension
          ? rawFullLinkPath
          : `${rawFullLinkPath}${matchedFiles.matchedFileExtension || ""}`,
      };
    });
};

const getlinkRawFullPath = ({
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
      matchedFileExtension: null,
    };
  }

  const matchedFiles = findMatchingFiles({ fullPath, name });
  const firstMatchedFile = first(matchedFiles);
  return {
    matchedFileCount: matchedFiles?.length || 0,
    matchedFile: firstMatchedFile || null,
    matchedFileExtension: firstMatchedFile
      ? getFileExtension(firstMatchedFile)
      : null,
  };
};

// https://www.computerhope.com/jargon/f/fileext.htm
const CAPTURE_FILE_EXTENSION_REGEX = /(\.*\.[\w\d]*$)/;
const getFileExtension = (link) =>
  match(link, CAPTURE_FILE_EXTENSION_REGEX)[1] || null;
