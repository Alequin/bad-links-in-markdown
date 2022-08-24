import { flow } from "lodash";

const TRIPLE_TICK_REGEX = /```.*?```/gs;
const removeTripleBackTickContents = (markdown) => {
  return markdown.replace(TRIPLE_TICK_REGEX, "");
};

const removeCommentedOutMarkdown = (markdown) => {
  return markdown
    .replace(/<!--.*?-->/gs, "") // <!-- commented out -->
    .replace(/\<\?.*?\?\>/gs, "") // <? commented out ?>
    .replace(/\[\/\/\]\:\s*\#\s.*/g, ""); // [//]: # commented out || [//]:# commented out
};

const removeIndentedCodeBlocks = (markdown) => {
  return markdown.replace(/\n\n\s\s\s\s.*\n/, "\n");
};

/**
 * Removes contents from the given markdown which do not relate to links in any way and
 * could cause false positives
 */
export const cleanMarkdownContents = flow(
  removeTripleBackTickContents,
  removeCommentedOutMarkdown,
  removeIndentedCodeBlocks
);
