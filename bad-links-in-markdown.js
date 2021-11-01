import fs from "fs";
import { flatMap, partition } from "lodash";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    const markdown = fs.readFileSync(file.sourceFilePath).toString();

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

const MARKDOWN_INLINE_LINK_REGEX = /!?\[.*\]\(.*\)/g;
const INLINE_LINK_REGEX = /[(](.*)[)]/;
const findInlineMarkdownLinks = (markdown) => {
  return match(markdown, MARKDOWN_INLINE_LINK_REGEX).map((inlineLink) => ({
    ...makeLinkObject(inlineLink, INLINE_LINK_REGEX),
    isImage: inlineLink.startsWith("!"),
  }));
};

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
const REFERENCE_LINK_USAGE_REGEX = /!?\[.*\]\[.*\]/g;
const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceUsages = markdown.match(REFERENCE_LINK_USAGE_REGEX);

  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX).map((referenceLink) => {
    const referenceText = referenceLink.match(/\[.*\]/)[0];
    const matchingReferenceUsages = allReferenceUsages.filter((usage) =>
      usage.includes(referenceText)
    );

    return {
      ...makeLinkObject(referenceLink, REFERENCE_LINK_REGEX),
      isImage: matchingReferenceUsages.some((usage) => usage.startsWith("!")),
    };
  });
};

const match = (markdown, regex) => markdown.match(regex) || [];

const makeLinkObject = (markdownLink, linkRegex) => {
  const linkWithTag = markdownLink.match(linkRegex)[1];
  const [link, tag] = linkWithTag.startsWith("#")
    ? [linkWithTag, undefined]
    : linkWithTag.split("#");
  return { markdownLink, link, tag };
};

if (module === require.main) {
  console.log("hey");
}
