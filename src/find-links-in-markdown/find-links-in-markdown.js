import { cleanMarkdownContents } from "../utils/clean-markdown-contents";
import { match } from "../utils/match";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (markdown) => {
  const cleanedMarkdown = cleanMarkdownContents(markdown);

  return removeLinksInsideBackticks(
    [
      ...findInlineMarkdownLinks(cleanedMarkdown),
      ...findReferenceMarkdownLinks(cleanedMarkdown),
    ],
    markdown
  );
};

const WRAPPED_IN_BACKTICKS_REGEX = /`.*`/g;
const removeLinksInsideBackticks = (links, markdown) => {
  const singleBacktickContents = match(markdown, WRAPPED_IN_BACKTICKS_REGEX);

  return links.filter((link) => {
    const isLinkWrappedInBackticks = singleBacktickContents.some((content) =>
      content.includes(link.markdownLink)
    );

    return !isLinkWrappedInBackticks;
  });
};
