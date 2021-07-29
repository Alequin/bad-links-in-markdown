const fs = require("fs");
const path = require("path");
const { isEmpty, flatMap } = require("lodash");
const fetch = require("node-fetch");
const program = require("commander");

const run = async () => {
  const allMarkdownFiles = findAllMarkdownFiles(
    topLevelDirectoryFromCommandArgs()
  );

  const markdownFilesWithLinks = allMarkdownFiles.map(file => {
    const fileContents = fs.readFileSync(file.fullPath).toString();
    const fullLinks = fileContents.match(/\[.*?\]\(.*?\)/g) || [];

    return {
      ...file,
      links: fullLinks.map(markdownLink => {
        const link = markdownLink.match(/[(](.*)[)]/)[1];
        return link.startsWith("#") ? link : link.replace(/#.*$/, "");
      })
    };
  });

  identifyInvalidLinksToOtherFiles(markdownFilesWithLinks);
  await identifyInvalidWebLinks(markdownFilesWithLinks);
};

const topLevelDirectoryFromCommandArgs = () => {
  program.requiredOption(
    "--directory <file-path>",
    "the top level directory to start reviewing markdown files from (all child directories will also be checked)"
  );

  const { directory } = program.parse().opts();

  return path.resolve(directory);
};

const findAllMarkdownFiles = directory => {
  const itemsInCurrentDirectory = fs.readdirSync(directory).map(name => ({
    name,
    directory,
    fullPath: path.resolve(directory, `./${name}`)
  }));

  const markdownFiles = itemsInCurrentDirectory.filter(({ name }) =>
    name.endsWith(".md")
  );

  const otherDirectoriesToSearch = itemsInCurrentDirectory
    .filter(({ name }) => !name.startsWith(".")) // ignore private directories / files
    .filter(({ name }) => !name.includes("node_modules")) // ignore node_modules
    .filter(({ fullPath }) => fs.lstatSync(fullPath).isDirectory()) // Only keep directories. Reject files
    .map(({ fullPath }) => fullPath);

  return [
    ...markdownFiles,
    ...flatMap(otherDirectoriesToSearch, findAllMarkdownFiles) // Find markdown files in all the other directories. If there are no others does nothing
  ];
};

const identifyInvalidLinksToOtherFiles = fileObjects => {
  fileObjects.forEach(({ fullPath, directory, links }) => {
    const localLinks = links.filter(
      link => link.startsWith("./") || link.startsWith("../")
    );

    const fullPathsToLinks = localLinks.map(link =>
      path.resolve(directory, link)
    );

    const missingLinks = fullPathsToLinks.filter(
      linkPath => !fs.existsSync(linkPath)
    );

    if (!isEmpty(missingLinks)) {
      console.log("Found some broken local links in the file ", fullPath);
      console.log(missingLinks);
      console.log("-----------------------------------------");
    }
  });
};

// TODO fix issue with github links: https://docs.github.com/en/enterprise-server@2.22/rest/reference/repos#get-repository-content
const identifyInvalidWebLinks = async fileObjects => {
  for (const { fullPath, links } of fileObjects) {
    const webLinks = links.filter(isStringAWebLink);

    for (const link of webLinks) {
      const statusCode = await linkResponseStatus(link);
      if (Number(statusCode) >= 400) {
        console.log(
          "A URL is not returning a healthy status code in the file ",
          fullPath
        );
        console.log(link, statusCode);
        console.log("-----------------------------------------");
      }
    }
  }
};

const URL_REGEX = /^(http(s)?:\/\/.).*|^(www\.).*/;
const isStringAWebLink = link => URL_REGEX.test(link);

const linkResponseStatus = async link => {
  const response = await fetch(link);
  return response.status;
};

const identifyInvalidLocalLinks = fileObjects => {};

run()
  .then(() => process.exit())
  .catch(() => process.exit());
