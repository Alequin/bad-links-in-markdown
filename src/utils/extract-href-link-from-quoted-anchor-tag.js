import { match } from "./match";

const QUOTED_ANCHOR_LINK_REGEX = /href=["'](.*?)["']/;
export const extractHrefLinkFromQuotedAnchorTag = (anchorTag) => {
  return match(anchorTag, QUOTED_ANCHOR_LINK_REGEX)[1];
};
