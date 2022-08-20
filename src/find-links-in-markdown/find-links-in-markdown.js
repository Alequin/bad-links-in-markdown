import { cleanMarkdownContents } from "../utils/clean-markdown-contents";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (markdown) => {
  const cleanedMarkdown = cleanMarkdownContents(markdown);

  return [
    ...findInlineMarkdownLinks(cleanedMarkdown),
    ...findReferenceMarkdownLinks(cleanedMarkdown),
  ];
};
