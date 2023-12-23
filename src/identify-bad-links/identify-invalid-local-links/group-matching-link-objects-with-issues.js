import { chain, groupBy, uniq } from "lodash";
import { mergeReasonObjects, newReasonObject } from "./reason-object";

export const groupMatchingReasonObjectWithIssues = (reasonObjects) => {
  const groupedReasonObjects = groupBy(
    reasonObjects,
    ({ markdownLink }) => markdownLink
  );

  return chain(groupedReasonObjects)
    .map((reasonObjectsList, markdownLink) =>
      reasonObjectsList.reduce(
        mergeReasonObjects,
        newReasonObject(markdownLink, [])
      )
    )
    .map((reasonObject) =>
      newReasonObject(reasonObject.markdownLink, uniq(reasonObject.reasons))
    )
    .value();
};
