import fs from "fs";
import path from "path";
import { flatMap } from "lodash";

export const findAllMarkdownFiles = (directory) => {
  const itemsInCurrentDirectory = fs.readdirSync(directory).map((name) => ({
    name,
    directory,
    fullPath: path.resolve(directory, `./${name}`),
  }));

  const markdownFiles = itemsInCurrentDirectory.filter(({ name }) =>
    name.endsWith(".md")
  );

  const otherDirectoriesToSearch = itemsInCurrentDirectory
    .filter(({ name }) => !name.startsWith(".")) // ignore private directories / files
    .filter(({ name }) => !name.includes("node_modules")) // ignore node_modules
    .filter(({ fullPath }) => fs.lstatSync(fullPath).isDirectory()) // Only keep directories. Reject files
    .map(({ fullPath }) => fullPath);

  return [
    ...markdownFiles,
    ...flatMap(otherDirectoriesToSearch, findAllMarkdownFiles), // Find markdown files in all the other directories. If there are no others does nothing
  ];
};
