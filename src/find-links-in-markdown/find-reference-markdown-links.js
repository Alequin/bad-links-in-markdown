import { match } from "../utils/match";
import { makeLinkObjectFromReferenceLink } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
export const findReferenceMarkdownLinks = (markdown) => {
  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX)
    .map((referenceLink) => {
      const referenceText = match(referenceLink, /\[.*\]/)[0];
      const markdownWithoutLink = markdown.replace(referenceLink, "");

      const isLinkUsed = markdownWithoutLink.includes(referenceText);
      if (!isLinkUsed) return null;

      const isLinkAnImage = markdownWithoutLink.includes(`!${referenceText}`);

      return makeLinkObjectFromReferenceLink({
        markdownLink: referenceLink,
        isImage: isLinkAnImage,
      });
    })
    .filter(Boolean);
};
