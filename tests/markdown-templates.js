export const applyTemplate = (template, { linkText, link }) => {
  return template.replaceAll("$link", link).replaceAll("$linkText", linkText);
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
