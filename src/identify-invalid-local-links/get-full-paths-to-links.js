const path = require("path");

const getFullPathsToLinks = (links, directory) =>
  links.map(({ link }) => path.resolve(directory, link));

module.exports = getFullPathsToLinks;
