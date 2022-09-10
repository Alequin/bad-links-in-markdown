import { match } from "./match";

const UNQUOTED_ANCHOR_LINK_REGEX = /href=\s*(.*?)[\s\>]/;
export const extractHrefLinkFromUnquotedAnchorTag = (anchorTag) => {
  return match(anchorTag, UNQUOTED_ANCHOR_LINK_REGEX)[1];
};
