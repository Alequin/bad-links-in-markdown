const { isEmpty, last } = require("lodash");
const path = require("path");
const findMissingLinksWithFileExtensions = require("./find-missing-links-with-file-extensions");
const findMissingLinksWithoutFileExtensions = require("./find-missing-links-without-file-extensions");

const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ fullPath, directory, links }) => {
      const localLinks = links
        .filter(isLocalLink)
        .map(addRawFileNameToObject)
        .map(addRawLinkToObject)
        .map(addFullPathToObject(directory));

      const missingLinks = [
        ...findMissingLinksWithFileExtensions(
          localLinks.filter(doesIncludeFileExtension),
          directory
        ),
        ...findMissingLinksWithoutFileExtensions(
          localLinks.filter(doesNotIncludeFileExtension),
          directory
        ),
      ];

      return {
        filePath: fullPath,
        missingLinks: missingLinks.map(({ markdownLink, reason }) => ({
          link: markdownLink,
          reason,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLink = ({ link }) =>
  doesLinkStartWithRelativePath(link) ||
  IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);

// https://www.computerhope.com/jargon/f/fileext.htm
const FILE_EXTENSION_REGEX = /.*\.[\w\d]*$/;
const doesIncludeFileExtension = ({ link }) => FILE_EXTENSION_REGEX.test(link);
const doesNotIncludeFileExtension = (linkWithTag) =>
  !doesIncludeFileExtension(linkWithTag);

const addRawFileNameToObject = (linkObject) => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" ")),
  };
};

const addRawLinkToObject = (linkObject) => {
  return {
    ...linkObject,
    rawLink: linkObject.link,
  };
};

const addFullPathToObject = (directory) => (linkObject) => {
  const relativeLink = doesLinkStartWithRelativePath(linkObject.link)
    ? linkObject.link
    : `./${linkObject.link}`;

  return {
    ...linkObject,
    fullPath: path.resolve(directory, relativeLink),
  };
};

const doesLinkStartWithRelativePath = (link) =>
  link.startsWith("./") || link.startsWith("../");

module.exports = identifyInvalidLocalLinks;
