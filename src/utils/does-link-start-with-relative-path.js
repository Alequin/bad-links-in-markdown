const IS_RELATIVE_LINK_REGEX = /^\.\/.+|^\.\.\/.+/;
// TODO is this dead?
export const doesLinkStartWithRelativePath = (link) => {
  return IS_RELATIVE_LINK_REGEX.test(link);
};
