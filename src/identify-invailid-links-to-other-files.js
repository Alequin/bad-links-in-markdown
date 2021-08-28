const fs = require("fs");
const path = require("path");
const { isEmpty } = require("lodash");

const identifyInvalidLinksToOtherFiles = fileObjects =>
  fileObjects
    .map(({ fullPath, directory, links }) => {
      const localLinks = links.filter(
        ({ link }) => link.startsWith("./") || link.startsWith("../")
      );

      const missingLinksWithFileExtensions = findMissingLinksWithFileExtensions(
        localLinks.filter(doesIncludeFileExtension),
        directory
      );
      const missingLinksWithoutFileExtensions =
        findMissingLinksWithoutFileExtensions(
          localLinks.filter(doesNotIncludeFileExtension),
          directory
        );

      const missingLinks = [
        ...missingLinksWithoutFileExtensions,
        ...missingLinksWithFileExtensions
      ];

      if (isEmpty(missingLinks)) return null;

      return {
        filePath: fullPath,
        missingLinks
      };
    })
    .filter(Boolean);

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
  const linksWithFullPaths = getFullPathsToLinks(
    linksWithoutFileExtensions,
    directory
  );

  return [];
};

const getFullPathsToLinks = (links, directory) =>
  links.map(({ link }) => path.resolve(directory, link));

module.exports = identifyInvalidLinksToOtherFiles;
