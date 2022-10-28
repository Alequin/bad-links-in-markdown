import { orderBy, sumBy } from "lodash";
import { findAllMarkdownFiles } from "./src/find-markdown/find-all-markdown-files/find-all-markdown-files";
import { findLinksInMarkdown } from "./src/find-markdown/find-links-in-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "./src/identify-bad-links/identify-invalid-local-links/identify-invalid-local-links";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";
import { logger } from "./src/utils/logger";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    return {
      ...file,
      topLevelDirectory,
      links: findLinksInMarkdown(file.sourceFilePath),
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
      logger.info(
        JSON.stringify(
          orderBy(result.badLocalLinks, ({ filePath }) => filePath),
          null,
          2
        )
      );
      logger.info(
        `Total bad local links: ${sumBy(
          result.badLocalLinks,
          ({ missingLinks }) => missingLinks.length
        )}`
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
