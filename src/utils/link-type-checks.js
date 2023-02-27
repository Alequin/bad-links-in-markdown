import { LINK_TYPE } from "../config/link-type";

export const isValidLink = (link, tag, type) =>
  isWebLink(link) || isLocalLink(link, tag, type);

const isWebLink = (link) =>
  link?.startsWith("mailto:") || /^\s*http.*/.test(link);

export const isLocalLink = (link, tag, type) => {
  if (!link) return Boolean(tag);
  if (isWebLink(link)) return false;
  if (type === LINK_TYPE.quotedAnchorLink) return true;
  return !doesIncludeSpaces(link.trim());
};

const SPACE_CHAR_REGEX = /\s+/;
const doesIncludeSpaces = (string) => SPACE_CHAR_REGEX.test(string);
