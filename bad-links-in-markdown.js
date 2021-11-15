import fs from "fs";
import { isEmpty } from "lodash";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    const markdown = fs.readFileSync(file.sourceFilePath).toString();

    return {
      ...file,
      links: [
        ...findInlineMarkdownLinks(markdown),
        ...findReferenceMarkdownLinks(markdown),
      ],
    };
  });

  return {
    badLocalLinks: identifyInvalidLocalLinks(markdownFilesWithLinks),
  };
  // await identifyInvalidLinksToWebSites(markdownFilesWithLinks);
};

const MARKDOWN_INLINE_LINK_REGEX = /!?\[.*\]\(.*\)/g;
const INLINE_LINK_REGEX = /[(](.*)[)]/;
const findInlineMarkdownLinks = (markdown) => {
  return match(markdown, MARKDOWN_INLINE_LINK_REGEX).map((inlineLink) => ({
    ...makeLinkObject(inlineLink, INLINE_LINK_REGEX),
    isImage: inlineLink.startsWith("!"),
  }));
};

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
const REFERENCE_LINK_USAGE_REGEX = /!?\[.*\]\[.*\]/g;
const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceUsages = match(markdown, REFERENCE_LINK_USAGE_REGEX);
  if (isEmpty(allReferenceUsages)) return [];

  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX).map((referenceLink) => {
    const referenceText = referenceLink.match(/\[.*\]/)[0];
    const matchingReferenceUsages = allReferenceUsages.filter((usage) =>
      usage.includes(referenceText)
    );

    return {
      ...makeLinkObject(referenceLink, REFERENCE_LINK_REGEX),
      isImage: Boolean(
        matchingReferenceUsages?.some((usage) => usage.startsWith("!"))
      ),
    };
  });
};

const match = (markdown, regex) => markdown.match(regex) || [];

const makeLinkObject = (markdownLink, linkRegex) => {
  const linkWithTag = markdownLink.match(linkRegex)[1];
  const [link, tag] = linkWithTag.startsWith("#")
    ? [linkWithTag, undefined]
    : linkWithTag.split("#");
  return { markdownLink, link, tag };
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
