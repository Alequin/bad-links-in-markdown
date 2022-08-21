import { flow } from "lodash";

const TRIPLE_TICK_REGEX = /```.*?```/gs;
const removeTripleBackTickContents = (markdown) => {
  return markdown.replace(TRIPLE_TICK_REGEX, "");
};

const removeCommentedOutMarkdown = (markdown) => {
  return markdown
    .replace(/<!--.*-->/s, "") // <!-- commented out -->
    .replace(/\<\?.*\?\>/s, "") // <? commented out ?>
    .replace(/\[\/\/\]\:\s*\#\s.*/g, ""); // [//]: # commented out
};

/**
 * Removes contents from the given markdown which do not relate to links in any way and
 * could cause false positives
 */
export const cleanMarkdownContents = flow(
  removeTripleBackTickContents,
  removeCommentedOutMarkdown
);
