import { groupBy, mapValues, uniq } from "lodash";
import { findHeadersInFile } from "./find-headers-in-file";
import { markdownHeadersToTags } from "./markdown-headers-to-tags";

export const badHeaderTags = (links) => {
  return links.filter((linkObject) => {
    const headers = findHeadersInFile(linkObject.fullPath);
    const headersInLinkFormat = convertHeadersToLinkFormat(headers);
    return !headersInLinkFormat.includes(linkObject.linkTag.toLowerCase());
  });
};

const convertHeadersToLinkFormat = (headers) => {
  const headersAsTags = differentiateDuplicateHeaders(
    markdownHeadersToTags(headers)
  );

  return uniq([
    ...headersAsTags,
    // Todo move this snake case logic into "markdownHeadersToTags" if possible
    ...headersAsTags.map((header) => header.replaceAll("_", "")), // account for variation of links for snake case headers
  ]);
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
