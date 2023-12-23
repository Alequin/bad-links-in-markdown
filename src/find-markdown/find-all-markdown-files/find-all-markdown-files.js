import fs from "fs";
import path from "path";
import { flatMap, partition } from "lodash";
import { isDirectory } from "../../utils";

/**
 *
 * @param {String} directory
 * @returns {{name: String, directory: String, sourceFilePath: String}[]}
 */
export const findAllMarkdownFiles = (directory) => {
  const [markdownFiles, otherItems] = partition(
    itemsInDirectory(directory),
    ({ name }) => name.endsWith(".md")
  );

  const subDirectories = identifySubDirectoriesToSearch(otherItems);

  return [
    ...markdownFiles,
    ...flatMap(subDirectories, findAllMarkdownFiles), // Find markdown files in all the other directories. If there are no others does nothing
  ];
};

const itemsInDirectory = (directory) => {
  return fs.readdirSync(directory).map((name) => ({
    name,
    directory,
    sourceFilePath: path.resolve(directory, `./${name}`),
  }));
};

const identifySubDirectoriesToSearch = (items) => {
  return items
    .filter(({ name }) => !name.startsWith(".")) // ignore private directories / files
    .filter(({ name }) => !name.includes("node_modules")) // ignore node_modules
    .filter(({ sourceFilePath }) => isDirectory(sourceFilePath)) // Only keep directories. Reject files
    .map(({ sourceFilePath }) => sourceFilePath);
};
