import { trimEnd } from "lodash";
import { LINK_TYPE } from "../config/link-type";
import { isValidLink, isValidLocalAnchorLink } from "../utils/link-type-checks";
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

const ANCHOR_LINK_REGEX = /href=[",'](.*?)[",']/;
export const makeLinkObjectFromAnchorLink = ({ markdownLink }) => {
  return makeLinkObject({
    type: LINK_TYPE.anchorLink,
    markdownLink,
    isImage: false,
    fullLink: trimEnd(
      removeLabelText(match(markdownLink, ANCHOR_LINK_REGEX)[1])
    ),
  });
};

const makeLinkObject = ({ type, markdownLink, fullLink, isImage }) => {
  const linkWithTag = removeLabelText(fullLink);
  const [linkPath, linkTag] = linkWithTag.startsWith("#")
    ? [undefined, removeHashCharsFromStart(linkWithTag)]
    : linkWithTag.split("#");

  return isValidLink(linkPath, linkTag)
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
