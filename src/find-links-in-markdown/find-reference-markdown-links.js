import { isEmpty } from "lodash";
import { match } from "../utils/match";
import { makeLinkObjectFromReferenceLink } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
const REFERENCE_LINK_USAGE_REGEX = /!?\[.*\]\[.*\]/g;
export const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceUsages = match(markdown, REFERENCE_LINK_USAGE_REGEX);
  if (isEmpty(allReferenceUsages)) return [];

  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX).map((referenceLink) =>
    makeLinkObjectFromReferenceLink({
      markdownLink: referenceLink,
      isImage: checkReferencesToSeeIfLinkIsForImage(
        referenceLink,
        allReferenceUsages
      ),
    })
  );
};

const checkReferencesToSeeIfLinkIsForImage = (
  referenceLink,
  allReferenceUsages
) => {
  const referenceText = match(referenceLink, /\[.*\]/);
  return Boolean(
    allReferenceUsages.some(
      (usage) => usage.startsWith("!") && usage.includes(referenceText)
    )
  );
};
