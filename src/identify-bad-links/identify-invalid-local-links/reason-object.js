import { isEqual } from "lodash";

export const newReasonObject = (markdownLink, reasons) => {
  return {
    markdownLink,
    reasons,
  };
};

export const mergeReasonObjects = (reasonObject, reasonObjectToMerge) => {
  const markdownLink = assertLinksAreEqual(
    reasonObject.markdownLink,
    reasonObjectToMerge.markdownLink
  );

  return newReasonObject(markdownLink, [
    ...reasonObject.reasons,
    ...reasonObjectToMerge.reasons,
  ]);
};

const assertLinksAreEqual = (link1, link2) => {
  if (!isEqual(link1, link2)) {
    throw new Error(
      `Error: the to given links do not match / markdownLink1: ${link1}, markdownLink2: ${link2}`
    );
  }
  return link1;
};
