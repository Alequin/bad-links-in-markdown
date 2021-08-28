const fs = require("fs");

const findMissingLinksWithoutFileExtensions = (
  linksWithoutFileExtensions,
  directory
) => {
  const filesInDirectory = fs.readdirSync(directory);

  return linksWithoutFileExtensions.filter(
    (linkObject) =>
      !filesInDirectory.some((fileInDirectory) =>
        fileInDirectory.includes(linkObject.name)
      )
  );
};

module.exports = findMissingLinksWithoutFileExtensions;
