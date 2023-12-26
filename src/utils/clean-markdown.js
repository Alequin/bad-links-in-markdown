import { flow } from "lodash";

/**
 * Removes contents from the given markdown which:
 * - Does not relate to links in any way
 * - Is commented out (so is not visible to users or links)
 * - could cause false positives
 */
export const removeCommentsFromMarkdown = (markdown) => {
  return markdown
    .replace(/<!--.*?-->/gs, "") // <!-- commented out -->
    .replace(/\<\?.*?\?\>/gs, "") // <? commented out ?>
    .replace(/\[\/\/\]\:\s*\#\s.*/g, "") // [//]: # commented out || [//]:# commented out
    .replace(/\n\n\s\s\s\s.*\n/g, "\n");
};

export const BACKTICKS_CODE_BLOCK_REGEX = /`.*?`/g;
export const TRIPLE_TICK_REGEX = /```.*?```/gs;
export const CODE_TAG_REGEX = /<code>.*?<\/code>/gs;
export const PRE_TAG_REGEX = /<pre>.*?<\/pre>/gs;

export const removeCodeBlocksFromMarkdown = (markdown) => {
  return markdown
    .replace(TRIPLE_TICK_REGEX, "")
    .replace(BACKTICKS_CODE_BLOCK_REGEX, "")
    .replace(CODE_TAG_REGEX, "")
    .replace(PRE_TAG_REGEX, "\n");
};

export const cleanMarkdown = flow(
  removeCommentsFromMarkdown,
  removeCodeBlocksFromMarkdown
);
