import { cleanMarkdownContents } from "./clean-markdown-contents";
import { readFile } from "./read-file";

export const readCleanMarkdownFile = (filePath) => {
  return cleanMarkdownContents(readFile(filePath).toString());
};
