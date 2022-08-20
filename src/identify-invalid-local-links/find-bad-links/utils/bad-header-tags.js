import { groupBy, mapValues } from "lodash";
import { findHeadersInFile } from "./find-headers-in-file";

export const badHeaderTags = (links) => {
  return links.filter((linkObject) => {
    const headerTagsFromFile = convertHeadersToLinkFormat(
      findHeadersInFile(linkObject.fullPath)
    );

    return !headerTagsFromFile.includes(linkObject.tag);
  });
};

const convertHeadersToLinkFormat = (headers) => {
  const headersAsTags = differentiateDuplicateHeaders(
    headers.map(markdownHeaderToTag)
  );

  return [
    ...headersAsTags,
    ...headersAsTags.map((header) => header.replaceAll("_", "")), // account for variation of links for snake case headers
  ];
};

/**
 * In markdown when headers appear multiple times numbers are appended to the end of the tag
 * to differentiate them
 *
 * This function identifies duplicates and ensure the numbers are appended if required
 */
const differentiateDuplicateHeaders = (linksToHeaders) => {
  const groupedHeaders = groupBy(linksToHeaders, (header) => header);

  return Object.values(
    mapValues(groupedHeaders, (repeatedHeaders) =>
      repeatedHeaders.map((header, index) =>
        index > 0
          ? `${header}-${index}` // Only append a number after the first header
          : header
      )
    )
  ).flat(Number.MAX_SAFE_INTEGER);
};

// https://stackoverflow.com/questions/51221730/markdown-link-to-header
const markdownHeaderToTag = (header) => {
  return header
    .toLowerCase() // lower case all chars
    .replace(/[^\w-\s]/g, "") // remove chars which are not alpha-numeric, dashes or spaces
    .trim() // remove trailing white space
    .replace(/\s/g, "-"); // replace spaces with hyphens
};
