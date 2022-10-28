import { badLinkReasons } from "../../../config/bad-link-reasons";
import { LINK_TYPE } from "../../../config/link-type";

const INVALID_ANCHOR_QUOTES_REGEX = /^[”]|[”]$/;
export const findAnchorLinksWithInvalidWrappingQuotes = (linkObjects) =>
  linkObjects
    .filter(({ type }) => type === LINK_TYPE.unquotedAnchorLink)
    .filter(({ link }) => INVALID_ANCHOR_QUOTES_REGEX.test(link))
    .map((linkObject) => ({
      ...linkObject,
      reasons: [badLinkReasons.ANCHOR_TAG_INVALID_QUOTE],
    }));
