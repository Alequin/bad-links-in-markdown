import { match } from "../utils/match";
import { readCleanMarkdownFile } from "../utils/read-clean-markdown-file";
import { readCleanMarkdownFileLines } from "../utils/read-clean-markdown-file-lines";
import { findAnchorMarkdownLinks } from "./find-anchor-markdown-links";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (filePath) => {
  const cleanedMarkdownLines = readCleanMarkdownFileLines(filePath);
  const cleanedMarkdown = readCleanMarkdownFile(filePath);

  return removeLinksInsideBackticks(
    [
      ...findInlineMarkdownLinks(cleanedMarkdown),
      ...findReferenceMarkdownLinks(cleanedMarkdown, cleanedMarkdownLines),
      ...findAnchorMarkdownLinks(cleanedMarkdown),
    ],
    cleanedMarkdown
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
