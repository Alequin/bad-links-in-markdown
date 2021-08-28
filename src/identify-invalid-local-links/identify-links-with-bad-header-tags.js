import fs from "fs";
import { flatten, flow, groupBy, mapValues } from "lodash";

export const identifyLinksWithBadHeaderTags = (workingLinks) => {
  return workingLinks.filter((linkObject) => {
    const linesInMarkdownFile = getLinesInMarkdownFile(linkObject.fullPath);
    const headerTagsFromFile = getHeaderTagsFromFile(linesInMarkdownFile);
    return !headerTagsFromFile.includes(linkObject.tag);
  });
};

const getLinesInMarkdownFile = (fullPath) => {
  const targetMarkdown = fs.readFileSync(fullPath).toString();
  return targetMarkdown.split(/\n|\r\n/);
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
