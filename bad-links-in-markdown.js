import fs from "fs";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";

const MARKDOWN_LINK_REGEX = /\[.*?\]\(.*?\)/g;

export const badLinksInMarkdown = async (topLevelDirectory) => {
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

if (module === require.main) {
  console.log("hey");
}
