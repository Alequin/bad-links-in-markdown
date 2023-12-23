import {
  match,
  readCleanMarkdownFile,
  readCleanMarkdownFileLines,
} from "../../utils";
import { findAnchorMarkdownLinks } from "./find-anchor-markdown-links";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (filePath) => {
  const cleanedMarkdown = readCleanMarkdownFile(filePath);
  const cleanedMarkdownLines = readCleanMarkdownFileLines(filePath);

  return removeLinksInsideBackticks(
    [
      ...findInlineMarkdownLinks(cleanedMarkdown),
      ...findReferenceMarkdownLinks(cleanedMarkdown, cleanedMarkdownLines),
      ...findAnchorMarkdownLinks(cleanedMarkdown),
    ],
    cleanedMarkdown
  );
};

const WRAPPED_IN_BACKTICKS_REGEX = /`.*?`/g;
const WRAPPED_IN_CODE_BLOCK_REGEX = /<code>.*?<code\/>/g;
const removeLinksInsideBackticks = (links, markdown) => {
  const wrappedContents = [
    ...match(markdown, WRAPPED_IN_BACKTICKS_REGEX),
    ...match(markdown, WRAPPED_IN_CODE_BLOCK_REGEX),
  ];

  return links.filter((link) => {
    const isLinkWrappedInBackticks = wrappedContents.some((content) =>
      content.includes(link.markdownLink)
    );

    return !isLinkWrappedInBackticks;
  });
};
