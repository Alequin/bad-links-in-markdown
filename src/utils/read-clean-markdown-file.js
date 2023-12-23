import { cleanMarkdownContents } from "./clean-markdown-contents";
import { readFileAsString } from "./read-file-as-string";

export const readCleanMarkdownFile = (filePath) => {
  return cleanMarkdownContents(readFileAsString(filePath));
};
