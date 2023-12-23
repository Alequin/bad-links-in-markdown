import { partition } from "lodash";

export const partitionLinksByType = (linkObjects) => {
  const [linksWithGoodSyntax, linksWithBadSyntax] = partition(
    linkObjects,
    doesLinkHaveBadSyntax
  );

  const [internalFileLinks, externalFileLinks] = partition(
    linksWithGoodSyntax,
    ({ isTagOnlyLink }) => isTagOnlyLink
  );

  return {
    linksWithGoodSyntax,
    linksWithBadSyntax,
    internalFileLinks,
    externalFileLinks,
  };
};

const doesLinkHaveBadSyntax = ({ linkPath }) => {
  if (!linkPath) return true;
  return !linkPath.trim().includes(" ");
};
