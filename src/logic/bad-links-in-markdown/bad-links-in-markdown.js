import { chain, chunk } from "lodash";
import Path from "path";
import { logProgress } from "../../utils";
import { findLinksInMarkdown } from "../find-markdown/find-links-in-markdown";
import { findMarkdownFilesInDirectory } from "../find-markdown/find-markdown-files-in-directory";
import { identifyInvalidLocalLinks } from "../identify-bad-links/identify-invalid-local-links";

const BATCH_SIZE = 10;

/**
 * @param {object} options
 * @param {string} [options.targetDirectory] - All files contained in this directory will be reviewed, including subdirectories
 * @returns
 */
export const badLinksInMarkdown = async (options) => {
  const allMarkdownFiles = findMarkdownFilesInDirectory(
    Path.resolve(options.targetDirectory)
  ).filter(({ name }) => name); // TODO add regex logic in some form to filter by file name

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
    badLocalLinks: mergeBatchesResultsByKey(
      resultsForAllBatches,
      "badLocalLinks"
    ),
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

const mergeBatchesResultsByKey = (resultsInBatches, keyToMerge) => {
  return chain(resultsInBatches)
    .flatMap((batch) => batch[keyToMerge])
    .orderBy(({ filePath }) => filePath)
    .value();
};
