const fs = require("fs");

const findMissingLinksWithFileExtensions = (linksWithFileExtensions) => {
  return linksWithFileExtensions.filter(
    (linkObject) => !fs.existsSync(linkObject.fullPath)
  );
};

module.exports = findMissingLinksWithFileExtensions;
