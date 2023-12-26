import { flatMap, uniqBy } from "lodash";
import {
  match,
  readFileAsString,
  splitByNewLineCharacters,
} from "../../../utils";
import {
  BACKTICKS_CODE_BLOCK_REGEX,
  CODE_TAG_REGEX,
  PRE_TAG_REGEX,
  TRIPLE_TICK_REGEX,
  removeCommentsFromMarkdown,
} from "../../../utils/clean-markdown";
import { findAnchorMarkdownLinks } from "./find-anchor-markdown-links";
import { findInlineMarkdownLinks } from "./find-inline-markdown-links";
import { findReferenceMarkdownLinks } from "./find-reference-markdown-links";

export const findLinksInMarkdown = (filePath) => {
  const markdown = readFileAsString(filePath);
  const commentlessMarkdown = removeCommentsFromMarkdown(markdown);
  const commentlessMarkdownLines =
    splitByNewLineCharacters(commentlessMarkdown);

  const uniqueLinks = uniqBy(
    [
      ...findInlineMarkdownLinks(commentlessMarkdown),
      ...findReferenceMarkdownLinks(
        commentlessMarkdown,
        commentlessMarkdownLines
      ),
      ...findAnchorMarkdownLinks(commentlessMarkdown),
    ],
    ({ markdownLink }) => markdownLink
  );

  return removeLinksInsideBlocks(uniqueLinks, commentlessMarkdown);
};

/**
 * These blocks can be used as part of links and the links will continue to work if they
 * are inside the display text part of the link only
 */
const BLOCK_WHICH_CAN_BE_USED_IN_LINKS = [
  BACKTICKS_CODE_BLOCK_REGEX,
  TRIPLE_TICK_REGEX,
  CODE_TAG_REGEX,
  PRE_TAG_REGEX,
];

const removeLinksInsideBlocks = (links, markdown) => {
  const markdownWrappedInBlocks = flatMap(
    BLOCK_WHICH_CAN_BE_USED_IN_LINKS,
    (pattern) => match(markdown, pattern)
  );

  return links.filter((link) => {
    return markdownWrappedInBlocks.every(
      (block) => !block.includes(link.markdownLink)
    );
  });
};
