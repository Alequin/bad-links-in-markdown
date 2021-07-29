const fs = require("fs");
const path = require("path");
const { isEmpty } = require("lodash");

const identifyInvalidLinksToOtherFiles = fileObjects => {
  fileObjects.forEach(({ fullPath, directory, links }) => {
    const localLinks = links.filter(
      link => link.startsWith("./") || link.startsWith("../")
    );

    const fullPathsToLinks = localLinks.map(link =>
      path.resolve(directory, link)
    );

    const missingLinks = fullPathsToLinks.filter(
      linkPath => !fs.existsSync(linkPath)
    );

    if (!isEmpty(missingLinks)) {
      console.log("Found some broken local links in the file ", fullPath);
      console.log(missingLinks);
      console.log("-----------------------------------------");
    }
  });
};

module.exports = identifyInvalidLinksToOtherFiles;
