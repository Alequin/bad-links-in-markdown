import { readFile } from "./read-file";
import { removeCommentedOutMarkdown } from "./remove-commented-out-markdown";

export const readMarkdownFile = (filePath) => {
  return removeCommentedOutMarkdown(readFile(filePath).toString());
};
