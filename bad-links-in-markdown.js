import fs from "fs";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { findLinksInMarkdown } from "./src/find-links-in-markdown/find-links-in-markdown";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    return {
      ...file,
      topLevelDirectory,
      links: findLinksInMarkdown(
        fs.readFileSync(file.sourceFilePath).toString()
      ),
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
      console.log(JSON.stringify(result, null, 2));
      console.log(`Total bad local links: ${result.badLocalLinks.length}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
