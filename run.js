import { orderBy, sumBy } from "lodash";
import { badLinksInMarkdown } from "./src/bad-links-in-markdown";
import { targetDirectoryFromConsoleArgs } from "./src/top-level-directory-from-console-args";
import { logger } from "./src/utils";

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
      logger.error(error);
      process.exit(1);
    });
}
