export const applyTemplate = (
  template,
  { link, linkText = "some link text", displayText = "some display text" }
) => {
  return template
    .replaceAll("$linkText", linkText)
    .replaceAll("$link", link)
    .replaceAll("$displayText", displayText);
};

export const inlineLinkTemplate = {
  linkType: "inline link",
  template: `Here is some text\n[$linkText]($link)`,
  expectedLink: `[$linkText]($link)`,
};

export const referenceLinkTemplate = {
  linkType: "reference link",
  template: `Here is some text\n[$displayText][$linkText]\n\n[$linkText]: $link`,
  expectedLink: `[$linkText]: $link`,
};

export const shorthandReferenceLinkTemplate = {
  linkType: "reference link",
  template: `Here is some text\n[$linkText]\n\n[$linkText]: $link`,
  expectedLink: `[$linkText]: $link`,
};

export const anchorLinkSingleQuoteTemplate = {
  linkType: "anchor link with single quotes",
  template: `Here is some text\n<a href='$link'>$linkText</a>`,
  expectedLink: `<a href='$link'>$linkText</a>`,
};

export const anchorLinkDoubleQuoteTemplate = {
  linkType: "inline link with double quotes",
  template: `Here is some text\n<a href="$link">$linkText</a>`,
  expectedLink: `<a href="$link">$linkText</a>`,
};
