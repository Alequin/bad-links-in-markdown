const fs = require("fs");
const path = require("path");
const { isEmpty, last } = require("lodash");

const identifyInvalidLinksToOtherFiles = fileObjects => {
  return fileObjects
    .map(({ fullPath, directory, links }) => {
      const localLinks = links.filter(isLocalLink).map(appendRawFileName);

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
          ...missingLinksWithFileExtensions
        ]
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

const isLocalLink = ({ link }) =>
  link.startsWith("./") || link.startsWith("../");

const appendRawFileName = linkObject => {
  return {
    ...linkObject,
    name: last(linkObject.link.replace(/\\|\//g, " ").split(" "))
  };
};

// https://www.computerhope.com/jargon/f/fileext.htm
const FILE_EXTENSION_REGEX = /.*\.[\w\d]*$/;
const doesIncludeFileExtension = ({ link }) => FILE_EXTENSION_REGEX.test(link);
const doesNotIncludeFileExtension = linkWithTag =>
  !doesIncludeFileExtension(linkWithTag);

const findMissingLinksWithFileExtensions = (
  linksWithFileExtensions,
  directory
) => {
  return getFullPathsToLinks(linksWithFileExtensions, directory).filter(
    linkPath => !fs.existsSync(linkPath)
  );
};

const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  const badLinks = linksWithoutFileExtensions.filter(
    file =>
      !filesInDirectory.some(fileInDirectory =>
        fileInDirectory.includes(file.name)
      )
  );

  return getFullPathsToLinks(badLinks, directory);
};

const getFullPathsToLinks = (links, directory) =>
  links.map(({ link }) => path.resolve(directory, link));

module.exports = identifyInvalidLinksToOtherFiles;
