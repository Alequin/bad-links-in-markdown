import { match } from "../../../utils";
import { makeLinkObjectFromInlineLink } from "./make-link-object";
import { MARKDOWN_INLINE_LINK_REGEX } from "./markdown-inline-link-regex";

export const findInlineMarkdownLinks = (markdown) => {
  return extractInlineLinksFromMarkdown(markdown)
    .map((inlineLink) =>
      makeLinkObjectFromInlineLink({
        markdownLink: inlineLink,
        isImage: inlineLink.startsWith("!"),
      })
    )
    .filter(Boolean);
};

const extractInlineLinksFromMarkdown = (markdown) =>
  recursivelyExtractInlineLinksFromMarkdown(markdown, []);

const recursivelyExtractInlineLinksFromMarkdown = (
  markdown,
  foundLinks = []
) => {
  const firstLink = match(markdown, MARKDOWN_INLINE_LINK_REGEX)[0];
  if (!firstLink) return foundLinks;

  const markdownWithoutLink = markdown.replace(firstLink, "");
  return recursivelyExtractInlineLinksFromMarkdown(markdownWithoutLink, [
    ...foundLinks,
    firstLink,
  ]);
};
