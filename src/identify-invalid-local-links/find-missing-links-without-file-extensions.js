const fs = require("fs");
const getFullPathsToLinks = require("./get-full-paths-to-links");

const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  const badLinks = linksWithoutFileExtensions.filter(
    (file) =>
      !filesInDirectory.some((fileInDirectory) =>
        fileInDirectory.includes(file.name)
      )
  );

  return getFullPathsToLinks(badLinks, directory);
};

module.exports = findMissingLinksWithoutFileExtensions;
