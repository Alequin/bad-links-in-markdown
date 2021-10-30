import fs from "fs";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    const markdown = fs.readFileSync(file.fullPath).toString();

    return {
      ...file,
      links: [...findInlineMarkdownLinks(markdown), ...findReferenceMarkdownLinks(markdown)],
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
  };
  // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
};

const MARKDOWN_INLINE_LINK_REGEX = /\[.*?\]\(.*?\)/g;
const findInlineMarkdownLinks = (markdown) => {
  const allInlineLinks = markdown.match(MARKDOWN_INLINE_LINK_REGEX) || [];
  return allInlineLinks.map((inlineLink) => ({
    markdownLink: inlineLink,
    ...makeLinkObject(inlineLink.match(/[(](.*)[)]/)[1]),
  }));
};

const MARKDOWN_REFERENCE_LINK_REGEX = /\[.*?\]:.*/g;
const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceLinks = markdown.match(MARKDOWN_REFERENCE_LINK_REGEX) || [];
  return allReferenceLinks.map((referenceLink) => ({
    markdownLink: referenceLink,
    ...makeLinkObject(referenceLink.match(/\[.*?\]:\s?(.*)$/)[1]),
  }));
};

const makeLinkObject = (linkWithTag) => {
  const [link, tag] = linkWithTag.startsWith("#")
    ? [linkWithTag, undefined]
    : linkWithTag.split("#");
  return { link, tag };
};

if (module === require.main) {
  console.log("hey");
}
