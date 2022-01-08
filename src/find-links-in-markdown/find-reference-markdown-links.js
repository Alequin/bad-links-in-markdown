import { isEmpty } from "lodash";
import { match } from "../match";
import { makeLinkObject } from "./make-link-object";

const MARKDOWN_REFERENCE_LINK_REGEX = /!?\[.*\]:.*/g;
const REFERENCE_LINK_REGEX = /\[.*\]:\s?(.*)$/;
const REFERENCE_LINK_USAGE_REGEX = /!?\[.*\]\[.*\]/g;
export const findReferenceMarkdownLinks = (markdown) => {
  const allReferenceUsages = match(markdown, REFERENCE_LINK_USAGE_REGEX);
  if (isEmpty(allReferenceUsages)) return [];

  return match(markdown, MARKDOWN_REFERENCE_LINK_REGEX).map((referenceLink) => {
    const referenceText = match(referenceLink, /\[.*\]/);
    const matchingReferenceUsages = allReferenceUsages.filter((usage) =>
      usage.includes(referenceText)
    );

    return {
      ...makeLinkObject(referenceLink, REFERENCE_LINK_REGEX),
      isImage: Boolean(
        matchingReferenceUsages?.some((usage) => usage.startsWith("!"))
      ),
    };
  });
};
