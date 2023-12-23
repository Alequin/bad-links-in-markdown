import { chain, chunk, orderBy, sumBy } from "lodash";
import { findAllMarkdownFiles } from "./src/find-markdown/find-all-markdown-files";
import { findLinksInMarkdown } from "./src/find-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "./src/identify-bad-links/identify-invalid-local-links";
import targetDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";
import { logProgress, logger } from "./src/utils";

const BATCH_SIZE = 10;

/**
 *
 * @param {object} options
 * @param {string} [options.targetDirectory] - All files contained in this directory will be reviewed, including subdirectories
 * @returns
 */
export const badLinksInMarkdown = async (options) => {
  const allMarkdownFiles = findAllMarkdownFiles(options.targetDirectory);

  const markdownFileBatches = chunk(allMarkdownFiles, BATCH_SIZE);
  const resultsForAllBatches = markdownFileBatches.map(
    (markdownFileBatch, index) => {
      logProgress({
        position: index + 1,
        total: markdownFileBatches.length,
        messagePrefix: "- Current batch",
      });
      return processBatchOfFiles(markdownFileBatch, options.targetDirectory);
    }
  );

  return {
    badLocalLinks: chain(resultsForAllBatches)
      .flatMap(({ badLocalLinks }) => badLocalLinks)
      .orderBy(({ filePath }) => filePath)
      .value(),
  };
};

const processBatchOfFiles = (markdownFileBatch, targetDirectory) => {
  const markdownFilesWithLinks = markdownFileBatch.map((file) => {
    return {
      ...file,
      targetDirectory,
      links: findLinksInMarkdown(file.sourceFilePath),
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
    // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
  };
};

if (module === require.main) {
  badLinksInMarkdown({ targetDirectory: targetDirectoryFromConsoleArgs() })
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
