import { doesLinkStartWithRelativePath } from "./does-link-start-with-relative-path";

export const isEmailLink = (link) => link?.startsWith("mailto:");
export const isWebLink = (link) => link?.startsWith("http");
export const isLocalLink = (link, tag) => {
  if (!link) return Boolean(tag);
  if (isEmailLink(link) || isWebLink(link)) return false;
  return doesLinkStartWithRelativePath(link) || isLocalLinkWithoutPath(link);
};

// https://www.computerhope.com/jargon/f/fileext.htm
const IS_LOCAL_LINK_WITHOUT_PATH_REGEX = /w*|w*\.[\w\d]*$/;
const isLocalLinkWithoutPath = (link) =>
  IS_LOCAL_LINK_WITHOUT_PATH_REGEX.test(link);
