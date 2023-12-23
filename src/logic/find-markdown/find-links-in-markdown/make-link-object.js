import { trimEnd } from "lodash";
import {
  extractHrefLinkFromQuotedAnchorTag,
  extractHrefLinkFromUnquotedAnchorTag,
  isValidLink,
  match,
} from "../../../utils";
import { MARKDOWN_INLINE_LINK_REGEX } from "./markdown-inline-link-regex";
import { LINK_TYPE } from "../../../constants";

export const makeLinkObjectFromInlineLink = ({ markdownLink, isImage }) => {
  return makeLinkObject({
    type: LINK_TYPE.inlineLink,
    markdownLink,
    isImage,
    fullLink: match(markdownLink, MARKDOWN_INLINE_LINK_REGEX)[2].trim(),
  });
};

const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
export const makeLinkObjectFromReferenceLink = ({ markdownLink, isImage }) => {
  return makeLinkObject({
    type: LINK_TYPE.referenceLink,
    markdownLink,
    isImage,
    fullLink: match(markdownLink, REFERENCE_LINK_REGEX)[1].trim(),
  });
};

export const makeLinkObjectFromAnchorLink = ({ markdownLink }) => {
  const quotedAnchorLink = extractHrefLinkFromQuotedAnchorTag(markdownLink);
  if (quotedAnchorLink) {
    return makeLinkObjectFromQuotedAnchorLink(markdownLink, quotedAnchorLink);
  }

  const unquotedAnchorLink = extractHrefLinkFromUnquotedAnchorTag(markdownLink);
  if (unquotedAnchorLink) {
    return makeLinkObjectFromUnquotedAnchorLink(
      markdownLink,
      unquotedAnchorLink
    );
  }

  return null;
};

const makeLinkObjectFromQuotedAnchorLink = (markdownLink, anchorLink) => {
  return makeLinkObject({
    type: LINK_TYPE.quotedAnchorLink,
    markdownLink,
    isImage: false,
    fullLink: trimEnd(removeWrappingQuotes(anchorLink)),
  });
};

const makeLinkObjectFromUnquotedAnchorLink = (markdownLink, anchorLink) => {
  return makeLinkObject({
    type: LINK_TYPE.unquotedAnchorLink,
    markdownLink,
    isImage: false,
    fullLink: trimEnd(anchorLink),
  });
};

const makeLinkObject = ({ type, markdownLink, fullLink, isImage }) => {
  const linkWithTag = removeLabelText(fullLink);

  const [linkPath, linkTag] = linkWithTag.startsWith("#")
    ? [null, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");

  return isValidLink(linkPath, linkTag, type)
    ? Object.freeze({
        markdownLink,
        linkPath: linkPath || null,
        linkTag: linkTag || null,
        link: linkWithTag,
        type,
        isImage,
      })
    : null;
};

/**
 * Some tags include alt text which plays no role in the link to the file. This functions removes it
 * - e.g [link](./path/to/file/md "this is alt text describing the file")
 */
const removeLabelText = (string) => string.replace(/\s+[\"\'].*[\"\']/, "");

const removeHashCharsFromStart = (string) => string.replace(/^#*/, "");

const removeWrappingQuotes = (string) => string.replace(/^["']|["']$/g, "");
