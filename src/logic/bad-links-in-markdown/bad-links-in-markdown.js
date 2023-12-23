import { chain, chunk } from "lodash";
import { findAllMarkdownFiles } from "../find-markdown/find-all-markdown-files";
import { findLinksInMarkdown } from "../find-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "../identify-bad-links/identify-invalid-local-links";
import { logProgress } from "../../utils";

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
