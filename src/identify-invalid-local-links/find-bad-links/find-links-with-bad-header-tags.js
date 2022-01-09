import { flatten, flow, groupBy, mapValues } from "lodash";
import { doesFileExist } from "../../utils/does-file-exist";
import { readFileLines } from "../../utils/read-file-lines";
import { badLinkReasons } from "./bad-link-reasons";

export const findLinksWithBadHeaderTags = (linkObjects) => {
  const workingLinks = linkObjects.filter((linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  return identifyMarkdownLinksWithBadHeaderTags(
    workingLinks.filter(
      ({ tag, linkFileExtension }) => tag && linkFileExtension === ".md"
    )
  ).map((linkObject) => ({
    ...linkObject,
    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
  }));
};

const identifyMarkdownLinksWithBadHeaderTags = (links) => {
  return links.filter((linkObject) => {
    const linesInMarkdownFile = readFileLines(linkObject.fullPath);

    const headerTagsFromFile = getHeaderTagsFromFile(linesInMarkdownFile);
    return !headerTagsFromFile.includes(linkObject.tag);
  });
};

const getHeaderTagsFromFile = (linesInMarkdownFile) => {
  const linksToHeaders = linesInMarkdownFile
    .filter((line) => line.startsWith("#"))
    .map(markdownHeaderToTag);

  return differentiateDuplicateHeaders(linksToHeaders);
};

/**
 * In markdown when header appear multiple times to differentiate them in links
 * numbers are appended to the end of the tag.
 *
 * This function identifies duplicates and ensure the numbers are appended if required
 */
const differentiateDuplicateHeaders = (linksToHeaders) => {
  const groupedHeaders = groupBy(linksToHeaders, (header) => header);
  const uniquedHeadersByName = Object.values(
    mapValues(groupedHeaders, (repeatedHeaders) => {
      if (repeatedHeaders.length === 1) return repeatedHeaders; // Don't add number if there is only one
      return repeatedHeaders.map((header, index) => `${header}-${index + 1}`);
    })
  );

  return flatten(uniquedHeadersByName);
};

// https://stackoverflow.com/questions/51221730/markdown-link-to-header
const markdownHeaderToTag = flow(
  (header) => header.toLowerCase(), // lower case all chars
  (header) => header.replace(/[^\w-\s]/g, "").trim(), // remove chars which are not alpha-numeric or dashes
  (header) => header.replace(/\s/g, "-"), // replace spaces with hyphens
  (header) => header.replace(/-+/g, "-"), // replace occurrences of multiple hyphens with singular hyphens
  (header) => header.replace(/[^\w-]/g, "") // remove chars which are not alpha-numeric or dashes
);
