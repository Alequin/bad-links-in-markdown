import { isEmpty, last } from "lodash";
import path from "path";
import { LINK_TYPE } from "../../../../constants";
import { isDirectory, isLocalLink, match } from "../../../../utils";
import { findMatchingFiles } from "../find-matching-files";
import { findGitRepoTopLevelDirectory } from "./find-git-repo-top-level-directory";

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

      // TODO update to also work with a single file
      const gitRepositoryDirectory =
        findGitRepoTopLevelDirectory(targetDirectory);

      const rawFullLinkPath = isTagOnlyLink
        ? sourceFilePath
        : getlinkRawFullPath({
            directory,
            isAbsoluteLink,
            gitRepositoryDirectory,
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
          gitRepositoryDirectory,
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
  gitRepositoryDirectory,
  linkPath,
  directory,
}) => {
  if (isAbsoluteLink && gitRepositoryDirectory) {
    return path.resolve(gitRepositoryDirectory, `./${linkPath}`);
  }

  if (isAbsoluteLink) return path.resolve(linkPath);

  return path.resolve(directory, `./${linkPath}`);
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
