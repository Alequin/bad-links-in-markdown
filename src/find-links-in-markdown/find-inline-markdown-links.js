import { match } from "../match";
import { makeLinkObject } from "./make-link-object";

// https://newbedev.com/regex-match-markdown-link
const MARKDOWN_INLINE_LINK_REGEX = /!?\[([^\[\]]*)\]\((.*?)\)/;
const INLINE_LINK_REGEX = /[(](.*)[)]/;
export const findInlineMarkdownLinks = (markdown) => {
  const allLinks = extractInlineLinksFromMarkdown(markdown);

  return allLinks.map((inlineLink) => ({
    ...makeLinkObject(inlineLink, INLINE_LINK_REGEX),
    isImage: inlineLink.startsWith("!"),
  }));
};

const extractInlineLinksFromMarkdown = (markdown) =>
  recursivelyExtractInlineLinksFromMarkdown(markdown, []);

const recursivelyExtractInlineLinksFromMarkdown = (
  markdown,
  foundLinks = []
) => {
  const firstLink = match(markdown, MARKDOWN_INLINE_LINK_REGEX)[0];
  if (!firstLink) return foundLinks;

  const markdownWithoutLink = markdown.replace(firstLink, "");
  return recursivelyExtractInlineLinksFromMarkdown(markdownWithoutLink, [
    ...foundLinks,
    firstLink,
  ]);
};
