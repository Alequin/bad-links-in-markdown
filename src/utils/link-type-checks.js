export const isValidLink = (link, tag) =>
  isEmailLink(link) || isWebLink(link) || isLocalLink(link, tag);

export const isEmailLink = (link) => link?.startsWith("mailto:");
export const isWebLink = (link) => link?.startsWith("http");
export const isLocalLink = (link, tag) => {
  if (!link) return Boolean(tag);
  if (isEmailLink(link) || isWebLink(link)) return false;
  return isValidUNIXPath(link) && !doesIncludeSpaces(link);
};

// https://stackoverflow.com/questions/537772/what-is-the-most-correct-regular-expression-for-a-unix-file-path
const VALID_UNIX_PATH_REGEX = /[^\0]+/;
const isValidUNIXPath = (link) => VALID_UNIX_PATH_REGEX.test(link);

const SPACE_CHAR_REGEX = /\s+/;
const doesIncludeSpaces = (string) => SPACE_CHAR_REGEX.test(string);
