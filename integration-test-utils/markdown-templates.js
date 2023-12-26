import { LINK_TYPE } from "../src/constants";

export const applyTemplate = (template, options) => apply(template, options);

export const applyTemplateWithoutNewlines = (template, options) => {
  return applyTemplate(template, options).replaceAll("\n", "");
};

const apply = (
  template,
  { link, linkText = "some link text", displayText = "some display text" }
) => {
  return template
    .replaceAll("$linkText", linkText)
    .replaceAll("$link", link)
    .replaceAll("$displayText", displayText);
};

const newTemplate = ({
  name,
  contentTemplate,
  markdownLinkTemplate,
  linkType,
  isImage,
}) => {
  return {
    name,
    contentTemplate,
    fullTemplate: `${contentTemplate}\n${markdownLinkTemplate}`,
    markdownLinkTemplate,
    linkType,
    isImage,
  };
};

/**
 * About Templates - Be aware
 *
 * Some templated do not require both the content and the link to be value. However, some do.
 * consider this when writing tests. Some situations may be a little annoying and need consideration
 * regarding cost benifit
 */

export const inlineLinkTemplate = newTemplate({
  name: "inline link",
  contentTemplate: "Here is some text",
  markdownLinkTemplate: `[$linkText]($link)`,
  linkType: LINK_TYPE.inlineLink,
  isImage: false,
});

export const referenceLinkTemplate = newTemplate({
  name: "reference link",
  contentTemplate: "Here is some text\n[$displayText][$linkText]",
  markdownLinkTemplate: `[$linkText]: $link`,
  linkType: LINK_TYPE.referenceLink,
  isImage: false,
});

export const shorthandReferenceLinkTemplate = newTemplate({
  name: "reference link",
  contentTemplate: `Here is some text\n[$linkText]`,
  markdownLinkTemplate: `[$linkText]: $link`,
  linkType: LINK_TYPE.referenceLink,
  isImage: false,
});

export const anchorLinkSingleQuoteTemplate = newTemplate({
  name: "anchor link with single quotes",
  contentTemplate: `Here is some text`,
  markdownLinkTemplate: `<a href='$link'>$linkText</a>`,
  linkType: LINK_TYPE.quotedAnchorLink,
  isImage: false,
});

export const anchorLinkDoubleQuoteTemplate = newTemplate({
  name: "inline link with double quotes",
  contentTemplate: `Here is some text`,
  markdownLinkTemplate: `<a href="$link">$linkText</a>`,
  linkType: LINK_TYPE.quotedAnchorLink,
  isImage: false,
});

export const anchorLinkUnquotesTemplate = newTemplate({
  name: "inline link with double quotes",
  contentTemplate: `Here is some text`,
  markdownLinkTemplate: `<a href=$link>$linkText</a>`,
  linkType: LINK_TYPE.unquotedAnchorLink,
  isImage: false,
});

export const inlineImageLinkTemplate = newTemplate({
  name: "inline image link",
  contentTemplate: "",
  markdownLinkTemplate: `![$linkText]($link)`,
  linkType: LINK_TYPE.inlineLink,
  isImage: true,
});

export const referenceImageLinkTemplate = newTemplate({
  name: "reference image link",
  contentTemplate: `![$displayText][$linkText]`,
  markdownLinkTemplate: `[$linkText]: $link`,
  linkType: LINK_TYPE.referenceLink,
  isImage: true,
});

export const shorthandReferenceImageLinkTemplate = newTemplate({
  name: "short hand reference link",
  contentTemplate: `![$linkText]`,
  markdownLinkTemplate: `[$linkText]: $link`,
  linkType: LINK_TYPE.referenceLink,
  isImage: true,
});
