import { match } from "../utils/match";
import { makeLinkObjectFromReferenceLink } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
export const findReferenceMarkdownLinks = (markdown) => {
  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX)
    .map((referenceLink) => {
      const referenceText = match(referenceLink, /\[.*\]/)[0];
      const markdownWithoutLink = markdown.replace(referenceLink, "");

      return makeLinkObjectFromReferenceLink({
        markdownLink: referenceLink,
        isImage: markdownWithoutLink.includes(`!${referenceText}`),
      });
    })
    .filter(Boolean);
};
