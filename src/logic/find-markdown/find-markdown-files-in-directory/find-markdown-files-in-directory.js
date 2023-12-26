import { flatMap, partition } from "lodash";
import path from "path";
import {
  isDirectory,
  isIgnoredDirectoryName,
  readFilesInDirectory,
} from "../../../utils";

/**
 * @param {String} directory
 * @returns {{name: String, directory: String, sourceFilePath: String}[]}
 */
export const findMarkdownFilesInDirectory = (directory) => {
  const [markdownFiles, otherItems] = partition(
    itemsInDirectory(directory),
    ({ name }) => name.endsWith(".md")
  );

  const subDirectories = identifySubDirectoriesToSearch(otherItems);

  return [
    ...markdownFiles,
    ...flatMap(subDirectories, findMarkdownFilesInDirectory), // Find markdown files in all the other directories. If there are no others does nothing
  ];
};

const itemsInDirectory = (directory) => {
  return readFilesInDirectory(directory).map((name) => ({
    name,
    directory,
    sourceFilePath: path.resolve(directory, `./${name}`),
  }));
};

const identifySubDirectoriesToSearch = (items) => {
  return items
    .filter(({ name }) => !isIgnoredDirectoryName(name))
    .filter(({ sourceFilePath }) => isDirectory(sourceFilePath)) // Only keep directories. Reject files
    .map(({ sourceFilePath }) => sourceFilePath);
};
