import fs from "fs";
import path from "path";
import { flatMap } from "lodash";
import { isDirectory } from "./utils/is-directory";

export const findAllMarkdownFiles = (directory) => {
  const itemsInCurrentDirectory = fs.readdirSync(directory).map((name) => ({
    name,
    directory,
    sourceFilePath: path.resolve(directory, `./${name}`),
  }));

  const markdownFiles = itemsInCurrentDirectory.filter(({ name }) =>
    name.endsWith(".md")
  );

  const otherDirectoriesToSearch = itemsInCurrentDirectory
    .filter(({ name }) => !name.startsWith(".")) // ignore private directories / files
    .filter(({ name }) => !name.includes("node_modules")) // ignore node_modules
    .filter(({ sourceFilePath }) => isDirectory(sourceFilePath)) // Only keep directories. Reject files
    .map(({ sourceFilePath }) => sourceFilePath);

  return [
    ...markdownFiles,
    ...flatMap(otherDirectoriesToSearch, findAllMarkdownFiles), // Find markdown files in all the other directories. If there are no others does nothing
  ];
};
