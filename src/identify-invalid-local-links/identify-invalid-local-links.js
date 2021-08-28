const { isEmpty, last } = require("lodash");
const findMissingLinksWithFileExtensions = require("./find-missing-links-with-file-extensions");
const findMissingLinksWithoutFileExtensions = require("./find-missing-links-without-file-extensions");

const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ fullPath, directory, links }) => {
      const localLinks = links
        .filter(isLocalLink)
        .map(appendRawFileName)
        .map(appendRelativePath);

      const missingLinksWithFileExtensions = findMissingLinksWithFileExtensions(
        localLinks.filter(doesIncludeFileExtension),
        directory
      );

      const missingLinksWithoutFileExtensions =
        findMissingLinksWithoutFileExtensions(
          localLinks.filter(doesNotIncludeFileExtension),
          directory
        );

      return {
        filePath: fullPath,
        missingLinks: [
          ...missingLinksWithoutFileExtensions,
          ...missingLinksWithFileExtensions,
        ],
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) ||
  IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

const doesLinkStartWithRelativePath = (link) =>
  link.startsWith("./") || link.startsWith("../");

// https://www.computerhope.com/jargon/f/fileext.htm
const FILE_EXTENSION_REGEX = /.*\.[\w\d]*$/;
const doesIncludeFileExtension = ({ link }) => FILE_EXTENSION_REGEX.test(link);
const doesNotIncludeFileExtension = (linkWithTag) =>
  !doesIncludeFileExtension(linkWithTag);

const appendRawFileName = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const appendRelativePath = (linkObject) => {
  return {
    ...linkObject,
    link: doesLinkStartWithRelativePath(linkObject.link)
      ? linkObject.link
      : `./${linkObject.link}`,
  };
};

module.exports = identifyInvalidLocalLinks;
