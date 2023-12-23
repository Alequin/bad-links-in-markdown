import { partition } from "lodash";
import { doesFileExist } from "../../../utils";
import { badLinkReasons } from "../../../constants";
import { badLineTags } from "./utils/bad-line-tags";
import { newReasonObject } from "../reason-object";

export const findIssuesForLinksWithFileExtensions = (linkObjects) => {
  const [workingLinks, badLinks] = partition(linkObjects, (linkObject) =>
    doesFileExist(linkObject.fullPath)
  );

  const linkWithBadTargetLineNumbers = badLineTags(
    workingLinks.filter(({ linkTag }) => linkTag?.startsWith("L"))
  );

  return [
    ...badLinks.map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [badLinkReasons.FILE_NOT_FOUND])
    ),
    ...linkWithBadTargetLineNumbers.map((linkObject) =>
      newReasonObject(linkObject.markdownLink, [
        badLinkReasons.INVALID_TARGET_LINE_NUMBER,
      ])
    ),
  ];
};
