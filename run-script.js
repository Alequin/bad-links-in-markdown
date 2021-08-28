import badLinksInMarkdown from "./bad-links-in-markdown";

const run = async () => {
  const result = badLinksInMarkdown(topLevelDirectoryFromConsoleArgs());
};

badLinksInMarkdown()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
