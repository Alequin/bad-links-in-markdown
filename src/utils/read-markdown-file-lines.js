import { cleanMarkdownContents } from "./clean-markdown-contents";
import { readFileAsString } from "./read-file-as-string";
import { splitByNewLineCharacters } from "./split-by-new-line-characters";

/**
 * Reads the given markdown file and then returns an array of each line in the file
 *
 * @param {String} filePath
 * @returns {String[]}
 */
export const readMarkdownFileLines = (filePath) => {
  return splitByNewLineCharacters(readFileAsString(filePath));
};

/**
 * Reads the given markdown file, cleans the contents and then returns an array of each line in the file
 *
 * @param {String} filePath
 * @returns {String[]}
 */
export const readCleanMarkdownFileLines = (filePath) => {
  return splitByNewLineCharacters(
    cleanMarkdownContents(readFileAsString(filePath))
  );
};
