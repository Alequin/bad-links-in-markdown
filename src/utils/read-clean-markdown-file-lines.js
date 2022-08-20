import { cleanMarkdownContents } from "./clean-markdown-contents";
import { readFile } from "./read-file";

export const readCleanMarkdownFileLines = (filePath) =>
  cleanMarkdownContents(readFile(filePath).toString()).split(/\n|\r\n/);
