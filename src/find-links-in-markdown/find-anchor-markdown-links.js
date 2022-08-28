import { match } from "../utils/match";
import { makeLinkObjectFromAnchorLink } from "./make-link-object";

const MARKDOWN_ANCHOR_LINK_REGEX = /<a.*?a>/;
export const findAnchorMarkdownLinks = (markdown) => {
  return extractAnchorLinksFromMarkdown(markdown)
    .map((inlineLink) =>
      makeLinkObjectFromAnchorLink({
        markdownLink: inlineLink,
        isImage: inlineLink.startsWith("!"),
      })
    )
    .filter(Boolean);
};

const extractAnchorLinksFromMarkdown = (markdown) =>
  recursivelyExtractAnchorLinksFromMarkdown(markdown, []);

const recursivelyExtractAnchorLinksFromMarkdown = (
  markdown,
  foundLinks = []
) => {
  const firstLink = match(markdown, MARKDOWN_ANCHOR_LINK_REGEX)[0];
  if (!firstLink) return foundLinks;

  const markdownWithoutLink = markdown.replace(firstLink, "");
  return recursivelyExtractAnchorLinksFromMarkdown(markdownWithoutLink, [
    ...foundLinks,
    firstLink,
  ]);
};
