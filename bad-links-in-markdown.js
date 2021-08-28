const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const findAllMarkdownFiles = require("./src/find-all-markdown-files");
const identifyInvalidLocalLinks = require("./src/identify-invalid-local-links/identify-invalid-local-links");
const { mapValues, isEmpty } = require("lodash");

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
      return { markdownLink, link, tag };
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
