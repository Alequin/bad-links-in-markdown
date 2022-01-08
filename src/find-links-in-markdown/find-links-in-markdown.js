import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (markdown) => [
  ...findInlineMarkdownLinks(markdown),
  ...findReferenceMarkdownLinks(markdown),
];
