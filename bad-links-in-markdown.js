import fs from "fs";
import { isEmpty } from "lodash";
import { findAllMarkdownFiles } from "./src/find-all-markdown-files";
import { identifyInvalidLocalLinks } from "./src/identify-invalid-local-links/identify-invalid-local-links";
import { match } from "./src/match";
import topLevelDirectoryFromConsoleArgs from "./src/top-level-directory-from-console-args";

export const badLinksInMarkdown = async (topLevelDirectory) => {
  const allMarkdownFiles = findAllMarkdownFiles(topLevelDirectory);

  const markdownFilesWithLinks = allMarkdownFiles.map((file) => {
    const markdown = fs.readFileSync(file.sourceFilePath).toString();

    return {
      ...file,
      topLevelDirectory,
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

// https://newbedev.com/regex-match-markdown-link
const MARKDOWN_INLINE_LINK_REGEX = /!?\[([^\[\]]*)\]\((.*?)\)/;
const INLINE_LINK_REGEX = /[(](.*)[)]/;
const findInlineMarkdownLinks = (markdown) => {
  const allLinks = extractInlineLinksFromMarkdown(markdown);

  return allLinks.map((inlineLink) => ({
    ...makeLinkObject(inlineLink, INLINE_LINK_REGEX),
    isImage: inlineLink.startsWith("!"),
  }));
};

const extractInlineLinksFromMarkdown = (markdown) =>
  recursivelyExtractInlineLinksFromMarkdown(markdown, []);

const recursivelyExtractInlineLinksFromMarkdown = (
  markdown,
  foundLinks = []
) => {
  const firstLink = match(markdown, MARKDOWN_INLINE_LINK_REGEX)[0];
  if (!firstLink) return foundLinks;

  const markdownWithoutLink = markdown.replace(firstLink, "");
  return recursivelyExtractInlineLinksFromMarkdown(markdownWithoutLink, [
    ...foundLinks,
    firstLink,
  ]);
};

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
const REFERENCE_LINK_USAGE_REGEX = /!?\[.*\]\[.*\]/g;
const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceUsages = match(markdown, REFERENCE_LINK_USAGE_REGEX);
  if (isEmpty(allReferenceUsages)) return [];

  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX).map((referenceLink) => {
    const referenceText = match(referenceLink, /\[.*\]/);
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

const makeLinkObject = (markdownLink, linkRegex) => {
  const linkWithTag = removeLinkAltText(match(markdownLink, linkRegex)[1]);
  const [link, tag] = linkWithTag.startsWith("#")
    ? [undefined, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");
  return { markdownLink, link, tag };
};

/**
 * Some tags include alt text which plays no role in the link to the file. This functions removes it
 * - e.g [link](./path/to/file/md "this is alt text describing the file")
 */
const removeLinkAltText = (string) => string.replace(/\s+[\"\'].*[\"\']/, "");

const removeHashCharsFromStart = (string) => string.replace(/^#*/, "");

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
