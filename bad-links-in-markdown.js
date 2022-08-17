import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { findLinksInMarkdown } from "./src/find-links-in-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";
import { logger } from "./src/utils/logger";
import { readFile } from "./src/utils/read-file";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    return {
      ...file,
      topLevelDirectory,
      links: findLinksInMarkdown(readFile(file.sourceFilePath).toString()),
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
  };
  // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
};

if (module === require.main) {
  badLinksInMarkdown(topLevelDirectoryFromConsoleArgs())
    .then((result) => {
      logger.info(JSON.stringify(result, null, 2));
      logger.info(`Total bad local links: ${result.badLocalLinks.length}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
