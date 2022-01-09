import { match } from "../utils/match";
import { MARKDOWN_INLINE_LINK_REGEX } from "./markdown-inline-link-regex";

export const makeLinkObjectFromInlineLink = ({ markdownLink, isImage }) => {
  return makeLinkObject({
    markdownLink,
    isImage,
    fullLink: match(markdownLink, MARKDOWN_INLINE_LINK_REGEX)[2],
  });
};

const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
export const makeLinkObjectFromReferenceLink = ({ markdownLink, isImage }) => {
  return makeLinkObject({
    markdownLink,
    isImage,
    fullLink: match(markdownLink, REFERENCE_LINK_REGEX)[1],
  });
};

const makeLinkObject = ({ markdownLink, fullLink, isImage }) => {
  const linkWithTag = removeLabelText(fullLink).trim();
  const [link, tag] = linkWithTag.startsWith("#")
    ? [undefined, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");
  return Object.freeze({ markdownLink, link, tag, isImage });
};

/**
 * Some tags include alt text which plays no role in the link to the file. This functions removes it
 * - e.g [link](./path/to/file/md "this is alt text describing the file")
 */
const removeLabelText = (string) => string.replace(/\s+[\"\'].*[\"\']/, "");

const removeHashCharsFromStart = (string) => string.replace(/^#*/, "");
