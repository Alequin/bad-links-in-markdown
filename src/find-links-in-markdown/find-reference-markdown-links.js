import { match } from "../utils/match";
import { makeLinkObjectFromReferenceLink } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /^[\s,\>]*!?\[.*\]:.*/;
export const findReferenceMarkdownLinks = (markdown, markdownLines) => {
  return markdownLines
    .map(identifyReferenceLink)
    .filter(Boolean)
    .map((referenceLink) => {
      const referenceText = match(referenceLink, /\[.*\]/)[0];

      const referenceLinksUsage = match(markdown, /!\[.*\]/).filter(
        (linkUsage) => linkUsage.includes(referenceText)
      );

      return makeLinkObjectFromReferenceLink({
        markdownLink: referenceLink,
        isImage: referenceLinksUsage.some((linkUsage) =>
          linkUsage.startsWith("!")
        ),
      });
    })
    .filter(Boolean);
};

const identifyReferenceLink = (line) => {
  const referenceLink = match(line, MARKDOWN_REFERENCE_LINK_REGEX)[0];
  if (!referenceLink) return null;
  return referenceLink;
};
