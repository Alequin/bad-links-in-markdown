import path from "path";
import program from "commander";

export const topLevelDirectoryFromConsoleArgs = () => {
  program.requiredOption(
    "--directory <file-path>",
    "the top level directory to start reviewing markdown files from (all child directories will also be checked)"
  );

  const { directory } = program.parse().opts();

  return path.resolve(directory);
};

export default topLevelDirectoryFromConsoleArgs;
