import path from "path";
import program from "commander";
import { doesFileExist } from "./utils";

// TODO test the logic to check if given directory is good
export const targetDirectoryFromConsoleArgs = () => {
  program.requiredOption(
    "--directory <file-path>",
    "the top level directory to start reviewing markdown files from (all child directories will also be checked)"
  );

  const { directory } = program.parse().opts();

  if (doesFileExist(directory)) return directory;

  const resolvedDirectory = path.resolve(directory);
  if (doesFileExist(resolvedDirectory)) return resolvedDirectory;

  throw new Error(
    `Given value for 'directory' is not valid. Consider wrapping the value in quotes / directory: ${directory} `
  );
};
