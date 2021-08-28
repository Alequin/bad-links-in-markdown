import fs from "fs";
import { flatMap, flow, groupBy, mapValues, partition } from "lodash";
import { badLinkReasons } from "./bad-link-reasons";

export const findMissingLinksWithFileExtensions = (linksWithFileExtensions) => {
  const [badLinks, workingLinks] = partition(
    linksWithFileExtensions,
    (linkObject) => !fs.existsSync(linkObject.fullPath)
  );

  return [
    ...badLinks.map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.FILE_NOT_FOUND,
    })),
    ...identifyLinksWithBadHeaderTags(workingLinks).map((linkObject) => ({
      ...linkObject,
      reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
    })),
  ];
};

const identifyLinksWithBadHeaderTags = (workingLinks) => {
  return workingLinks
    .filter(({ tag }) => tag)
    .filter((linkObject) => {
      const targetMarkdown = fs.readFileSync(linkObject.fullPath).toString();
      const linesInMarkdownFile = targetMarkdown.split(/\n|\r\n/);
      const headers = linesInMarkdownFile.filter((line) =>
        line.startsWith("#")
      );
      const linksToHeaders = headers.map(markdownHeaderToTag);
      const groupedHeaders = groupBy(linksToHeaders, (header) => header);
      const headerWithIdentifiedDuplicates = flatMap(
        mapValues(groupedHeaders, (repeatedHeaders) => {
          if (repeatedHeaders.length === 1) return repeatedHeaders;
          return repeatedHeaders.map(
            (header, index) => `${header}-${index + 1}`
          );
        }),
        (headers) => headers
      );

      return !headerWithIdentifiedDuplicates.includes(linkObject.tag);
    });
};

// https://stackoverflow.com/questions/51221730/markdown-link-to-header
const markdownHeaderToTag = flow(
  (header) => header.toLowerCase(), // lower case all chars
  (header) => header.replace(/[^\w-\s]/g, "").trim(), // remove chars which are not alpha-numeric or dashes
  (header) => header.replace(/\s/g, "-"), // replace spaces with hyphens
  (header) => header.replace(/-+/g, "-"), // replace occurrences of multiple hyphens with singular hyphens
  (header) => header.replace(/[^\w-]/g, "") // remove chars which are not alpha-numeric or dashes
);
