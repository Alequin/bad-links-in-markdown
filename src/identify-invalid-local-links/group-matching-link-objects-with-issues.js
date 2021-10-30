import { groupBy, uniq } from "lodash";

export const groupMatchingLinkObjectWithIssues = (linkObjectsToGroup) => {
  const groupedLinkedObjects = Object.values(
    groupBy(linkObjectsToGroup, ({ markdownLink }) => markdownLink)
  );

  return groupedLinkedObjects
    .map((linkObjectsList) => linkObjectsList.reduce(mergeLinkObjects, { reasons: [] }))
    .map((linkObject) => ({
      ...linkObject,
      reasons: uniq(linkObject.reasons),
    }));
};

const mergeLinkObjects = (primaryLinkObject, secondaryLinkObject) => ({
  ...primaryLinkObject,
  ...secondaryLinkObject,
  reasons: uniq([...primaryLinkObject.reasons, ...secondaryLinkObject.reasons]),
});
