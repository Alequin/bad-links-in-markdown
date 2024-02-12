import { uniq, flow } from "lodash";

// https://stackoverflow.com/questions/51221730/markdown-link-to-header

/**
 * Transforms all the given raw markdown headers to a link versions
 *
 * Returns multiple variants when there are multiple valid link formats
 * - If the two variants match then only one will be returned
 */
export const markdownHeadersToTags = (headers) => {
  return headers
    .map((header) =>
      uniq([markdownAllInOneVariant(header), standardVariant(header)])
    )
    .flat();
};

const generalUtils = {
  toLowerCase: (header) => header.toLowerCase(),
  removeHtmlTags: (header) => {
    return header
      .replace(/<pre>|<\/pre>/g, "") // Remove pre HTML tags
      .replace(/<code>|<\/code>/g, ""); // Remove code HTML tags
  },
  swapDashesForSpaces: (header) => {
    return header.replace(/-/g, " "); // Replace dashes with spaces before they get removed by later actions. Should be changed back before the end
  },
  cleanPunctuation: (header) => {
    return header
      .replace(/\p{P}/gu, "") // Remove unicode punctuation
      .replace(/`/g, ""); // Remove backticks
  },
  trim: (header) => {
    return header.trim();
  },
  swapSpacesForDashes: (header) => {
    return header.replace(/\s/g, "-");
  },
};

const markdownAllInOneVariantUtils = {
  removeBadCharacters: (header) => {
    return header.replace(
      /[^\p{L}\p{M}\p{Nd}\p{Nl}\p{Pc}\- ]/gu, // Replace invalid charaters (following regex for valid slugs in "markdown all in one")
      ""
    );
  },
  trimTrailingPunctuation: (header) => {
    return header.replace(/\p{P}+$/, ""); // Remove all punctuations from the end of the string if there is any
  },
  replaceAllTrailingSpaceWithSingleDash: (header) => {
    return header.replace(/\s+$/, "-"); // Replace any trailing space with dash characters
  },
};

/**
 * Transforms a raw markdown header to a link version
 *
 * standardVariant: removes bad chars and trims extra space
 */
const standardVariant = flow(
  generalUtils.toLowerCase,
  generalUtils.removeHtmlTags,
  generalUtils.swapDashesForSpaces,
  generalUtils.cleanPunctuation,
  generalUtils.trim,
  generalUtils.swapSpacesForDashes
);

/**
 * Transforms a raw markdown header to a link version
 *
 * markdownAllInOneVariant: Following logic for slugging in "Markdown all in one" package
 * - https://github.com/yzhang-gh/vscode-markdown/blob/4de3b74db885885581e5c0e6033c613f0a3fc88b/src/util/slugify.ts#L99-L109
 */
const markdownAllInOneVariant = flow(
  generalUtils.toLowerCase,
  generalUtils.removeHtmlTags,
  generalUtils.swapDashesForSpaces,
  generalUtils.cleanPunctuation,
  markdownAllInOneVariantUtils.trimTrailingPunctuation,
  markdownAllInOneVariantUtils.replaceAllTrailingSpaceWithSingleDash,
  markdownAllInOneVariantUtils.removeBadCharacters,
  generalUtils.trim,
  generalUtils.swapSpacesForDashes
);
