export const applyTemplate = (template, { linkText, link, displayText }) => {
  return template
    .replaceAll("$link", link)
    .replaceAll("$linkText", linkText)
    .replaceAll("$displayText", displayText);
};

export const inlineLinkTemplate = {
  linkType: "inline link",
  template: `Here is some text\n[$linkText]($link)`,
  expectedLink: `[$linkText]($link)`,
};

export const referenceLinkTemplate = {
  linkType: "inline link",
  template: `Here is some text\n[$displayText][$linkText]\n\n[$linkText]: $link`,
  expectedLink: `[$linkText]: $link`,
};

export const anchorLinkSingleQuoteTemplate = {
  linkType: "inline link",
  template: `Here is some text\n<a href='$link'>$linkText</a>`,
  expectedLink: `<a href='$link'>$linkText</a>`,
};

export const anchorLinkDoubleQuoteTemplate = {
  linkType: "inline link",
  template: `Here is some text\n<a href="$link">$linkText</a>`,
  expectedLink: `<a href="$link">$linkText</a>`,
};
