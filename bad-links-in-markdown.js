const fs = require("fs");
const path = require("path");
const { isEmpty, flatMap } = require("lodash");
const fetch = require("node-fetch");
const topLevelDirectoryFromConsoleArgs = require("./src/top-level-directory-from-console-args");
const findAllMarkdownFiles = require("./src/find-all-markdown-files");
const identifyInvalidLocalLinks = require("./src/identify-invalid-local-links/identify-invalid-local-links");
const identifyInvalidLinksToWebSites = require("./src/identify-invalid-links-to-web-sites");

const MARKDOWN_LINK_REGEX = /\[.*?\]\(.*?\)/g;

const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    const markdown = fs.readFileSync(file.fullPath).toString();
    const fullLinks = markdown.match(MARKDOWN_LINK_REGEX) || [];

    const links = fullLinks.map((markdownLink) => {
      const linkWithTag = markdownLink.match(/[(](.*)[)]/)[1];
      const [link, tag] = linkWithTag.startsWith("#")
        ? [linkWithTag, undefined]
        : linkWithTag.split("#");
      return { link, tag };
    });

    return {
      ...file,
      links,
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
  };
  // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
};

module.exports = badLinksInMarkdown;

const linkWithTag = (link) => {};
