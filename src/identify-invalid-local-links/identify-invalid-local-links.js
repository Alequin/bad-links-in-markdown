import { isEmpty, last } from "lodash";
import path from "path";
import { findMissingLinksWithFileExtensions } from "./find-missing-links-with-file-extensions";
import { markLinksWithoutExtensionsAsBad } from "./mark-links-without-extensions-as-bad";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ fullPath, directory, links }) => {
      const localLinks = links
        .filter(isLocalLink)
        .map(addRawFileNameToObject)
        .map(addFullPathToObject(directory));

      const missingLinks = [
        ...findMissingLinksWithFileExtensions(
          localLinks.filter(doesIncludeFileExtension),
          directory
        ),
        ...markLinksWithoutExtensionsAsBad(
          localLinks.filter(doesNotIncludeFileExtension),
          directory
        ),
      ];

      return {
        filePath: fullPath,
        missingLinks: missingLinks.map(({ markdownLink, reasons }) => ({
          link: markdownLink,
          reasons,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) || IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

// https://www.computerhope.com/jargon/f/fileext.htm
const FILE_EXTENSION_REGEX = /.*\.[\w\d]*$/;
const doesIncludeFileExtension = ({ link }) => FILE_EXTENSION_REGEX.test(link);
const doesNotIncludeFileExtension = (linkWithTag) => !doesIncludeFileExtension(linkWithTag);

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const addFullPathToObject = (directory) => (linkObject) => {
  const relativeLink = doesLinkStartWithRelativePath(linkObject.link)
    ? linkObject.link
    : `./${linkObject.link}`;

  return {
    ...linkObject,
    directory,
    fullPath: path.resolve(directory, relativeLink),
  };
};

const doesLinkStartWithRelativePath = (link) => link.startsWith("./") || link.startsWith("../");
