const fs = require("fs");
const badLinkReasons = require("./bad-link-reasons");

const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  return linksWithoutFileExtensions
    .filter(
      (linkObject) =>
        !filesInDirectory.some((fileInDirectory) =>
          fileInDirectory.includes(linkObject.name)
        )
    )
    .map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    }));
};

module.exports = findMissingLinksWithoutFileExtensions;
