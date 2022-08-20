import { flow } from "lodash";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (markdown) => {
  const preparedMarkdown = removeNonLinkRelatedMarkdown(markdown);

  return [
    ...findInlineMarkdownLinks(preparedMarkdown),
    ...findReferenceMarkdownLinks(preparedMarkdown),
  ];
};

const TRIPLE_TICK_REGEX = /```.*```/s;
const removeTripleBackTickContents = (markdown) => {
  return markdown.replace(TRIPLE_TICK_REGEX, "");
};

const removeNonLinkRelatedMarkdown = flow(removeTripleBackTickContents);
