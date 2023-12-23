import { chain, chunk, orderBy, sumBy } from "lodash";
import { findAllMarkdownFiles } from "./src/find-markdown/find-all-markdown-files";
import { findLinksInMarkdown } from "./src/find-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "./src/identify-bad-links/identify-invalid-local-links";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";
import { logProgress, logger } from "./src/utils";

const BATCH_SIZE = 10;

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFileBatches = chunk(allMarkdownFiles, BATCH_SIZE);
  const resultsForAllBatches = markdownFileBatches.map(
    (markdownFileBatch, index) => {
      logProgress({
        position: index + 1,
        total: markdownFileBatches.length,
        messagePrefix: "- Current batch",
      });
      return processBatchOfFiles(markdownFileBatch, topLevelDirectory);
    }
  );

  return {
    badLocalLinks: chain(resultsForAllBatches)
      .flatMap(({ badLocalLinks }) => badLocalLinks)
      .orderBy(({ filePath }) => filePath)
      .value(),
  };
};

const processBatchOfFiles = (markdownFileBatch, topLevelDirectory) => {
  const markdownFilesWithLinks = markdownFileBatch.map((file) => {
    return {
      ...file,
      topLevelDirectory,
      links: findLinksInMarkdown(file.sourceFilePath),
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
    // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
  };
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
          ({ foundIssues }) => foundIssues.length
        )}`
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
