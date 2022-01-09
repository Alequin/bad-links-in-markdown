const IS_RELATIVE_LINK_REGEX = /^\.\/.+|^\.\.\/.+/;
export const doesLinkStartWithRelativePath = (link) =>
  IS_RELATIVE_LINK_REGEX.test(link);
