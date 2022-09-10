import { trimEnd } from "lodash";
import { LINK_TYPE } from "../config/link-type";
import { extractHrefLinkFromQuotedAnchorTag } from "../utils/extract-href-link-from-quoted-anchor-tag";
import { extractHrefLinkFromUnquotedAnchorTag } from "../utils/extract-href-link-from-unquoted-anchor-tag";
import {
  isLocalQuotedAnchorLink,
  isValidLink,
} from "../utils/link-type-checks";
import { match } from "../utils/match";
import { MARKDOWN_INLINE_LINK_REGEX } from "./markdown-inline-link-regex";

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
    ? [undefined, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");

  const isLinkValid =
    type === LINK_TYPE.quotedAnchorLink
      ? isLocalQuotedAnchorLink(linkPath, linkTag)
      : isValidLink(linkPath, linkTag);

  return isLinkValid
    ? Object.freeze({
        markdownLink,
        linkPath,
        linkTag,
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
