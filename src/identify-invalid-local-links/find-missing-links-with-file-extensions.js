const fs = require("fs");
const getFullPathsToLinks = require("./get-full-paths-to-links");

const findMissingLinksWithFileExtensions = (
  linksWithFileExtensions,
  directory
) => {
  return getFullPathsToLinks(linksWithFileExtensions, directory).filter(
    (linkPath) => !fs.existsSync(linkPath)
  );
};

module.exports = findMissingLinksWithFileExtensions;
