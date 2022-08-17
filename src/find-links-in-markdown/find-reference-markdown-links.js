import { match } from "../utils/match";
import { makeLinkObjectFromReferenceLink } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
export const findReferenceMarkdownLinks = (markdown) => {
  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX)
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
