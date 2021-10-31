import { isEmpty, last } from "lodash";
import path from "path";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { findLinksWithoutExtensionsAsBad } from "./find-bad-links/find-links-without-extensions-as-bad";
import { findInvalidAbsoluteLinks } from "./find-bad-links/find-invalid-absolute-links";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ directory, links, sourceFilePath }) => {
      const localLinks = prepareLinkObjects(links, directory);

      const missingLinks = groupMatchingLinkObjectWithIssues([
        ...findMissingLinksWithFileExtensions(
          localLinks.filter(doesIncludeFileExtension),
          directory
        ),
        ...findLinksWithoutExtensionsAsBad(
          localLinks.filter(doesNotIncludeFileExtension),
          directory
        ),
        ...findInvalidAbsoluteLinks(localLinks),
      ]);

      return {
        filePath: sourceFilePath,
        missingLinks: missingLinks.map(({ markdownLink, reasons }) => ({
          link: markdownLink,
          reasons,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

const prepareLinkObjects = (links, directory) =>
  links
    .filter(isLocalLink)
    .map(addDirectoryToObject(directory))
    .map(addRawFileNameToObject)
    .map(addFullPathToObject);

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) || IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

// https://www.computerhope.com/jargon/f/fileext.htm
const FILE_EXTENSION_REGEX = /.*\.[\w\d]*$/;
const doesIncludeFileExtension = ({ link }) => FILE_EXTENSION_REGEX.test(link);
const doesNotIncludeFileExtension = (linkWithTag) => !doesIncludeFileExtension(linkWithTag);

const addDirectoryToObject = (directory) => (linkObject) => {
  return {
    ...linkObject,
    directory,
  };
};

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const addFullPathToObject = (linkObject) => {
  return {
    ...linkObject,
    fullPath: getLinkFullPath(linkObject),
  };
};

const getLinkFullPath = (linkObject) => {
  if (isAbsoluteLink(linkObject.link)) {
    if (/^\w:/.test(linkObject.link)) return linkObject.link;
    return linkObject.link.slice(1);
  }

  const relativeLink = doesLinkStartWithRelativePath(linkObject.link)
    ? linkObject.link
    : `./${linkObject.link}`;
  return path.resolve(linkObject.directory, relativeLink);
};

const isAbsoluteLink = (link) => /^\/?\w:/.test(link);
const doesLinkStartWithRelativePath = (link) => link.startsWith("./") || link.startsWith("../");
