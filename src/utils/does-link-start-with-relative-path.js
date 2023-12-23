const IS_RELATIVE_LINK_REGEX = /^\.\/.+|^\.\.\/.+/;
export const doesLinkStartWithRelativePath = (link) => {
  return IS_RELATIVE_LINK_REGEX.test(link);
};
