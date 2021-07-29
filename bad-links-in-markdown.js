const fs = require("fs");
const path = require("path");
const { isEmpty, flatMap } = require("lodash");
const fetch = require("node-fetch");
const topLevelDirectoryFromConsoleArgs = require("./src/top-level-directory-from-console-args");
const findAllMarkdownFiles = require("./src/find-all-markdown-files");
const identifyInvalidLinksToOtherFiles = require("./src/identify-invailid-links-to-other-files");
const identifyInvalidLinksToWebSites = require("./src/identify-invalid-links-to-web-sites");

const run = async () => {
  const topLevelDirectory = topLevelDirectoryFromConsoleArgs();

  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map(file => {
    const fileContents = fs.readFileSync(file.fullPath).toString();
    const fullLinks = fileContents.match(/\[.*?\]\(.*?\)/g) || [];

    return {
      ...file,
      links: fullLinks.map(markdownLink => {
        const link = markdownLink.match(/[(](.*)[)]/)[1];
        return link.startsWith("#") ? link : link.replace(/#.*$/, "");
      })
    };
  });

  identifyInvalidLinksToOtherFiles(markdownFilesWithLinks);
  await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
};

run()
  .then(() => process.exit())
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
