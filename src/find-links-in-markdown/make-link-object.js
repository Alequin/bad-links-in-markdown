import { match } from "../match";

export const makeLinkObject = (markdownLink, linkRegex) => {
  const linkWithTag = removeLinkAltText(match(markdownLink, linkRegex)[1]);
  const [link, tag] = linkWithTag.startsWith("#")
    ? [undefined, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");
  return Object.freeze({ markdownLink, link, tag });
};

/**
 * Some tags include alt text which plays no role in the link to the file. This functions removes it
 * - e.g [link](./path/to/file/md "this is alt text describing the file")
 */
const removeLinkAltText = (string) => string.replace(/\s+[\"\'].*[\"\']/, "");

const removeHashCharsFromStart = (string) => string.replace(/^#*/, "");
