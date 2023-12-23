import { chain, isEmpty } from "lodash";
import { badLinkReasons } from "../../../constants";
import { findIssuesForAnchorLinksWithInvalidWrappingQuotes } from "./find-bad-links/find-issues-for-anchor-links-with-invalid-wrapping-quotes";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-issues-for-invalid-absolute-links";
import { findIssuesForInvalidImageExtensions } from "./find-bad-links/find-issues-for-invalid-image-extensions";
import { findIssuesForInvalidRelativeLinkSyntax } from "./find-bad-links/find-issues-for-invalid-relative-link-syntax";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findIssuesForLinksWithoutExtensions } from "./find-bad-links/find-issues-for-links-without-extensions";
import { findIssuesForLinksWithFileExtensions } from "./find-bad-links/find-issues-for-links-with-file-extensions";
import { groupMatchingReasonObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { partitionLinksByType } from "./partition-links-by-type";
import { prepareLocalLinkObjects } from "./prepare-local-link-objects";
import { newReasonObject } from "./reason-object";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return chain(fileObjects)
    .map(findIssuesInFile)
    .filter(({ foundIssues }) => !isEmpty(foundIssues))
    .value();
};

const findIssuesInFile = (fileObject) => {
  const {
    linksWithGoodSyntax,
    linksWithBadSyntax,
    internalFileLinks,
    externalFileLinks,
  } = partitionLinksByType(prepareLocalLinkObjects(fileObject));

  return {
    filePath: fileObject.sourceFilePath,
    foundIssues: groupMatchingReasonObjectWithIssues([
      ...linksWithBadSyntax.map((linkObject) =>
        newReasonObject(linkObject.markdownLink, [
          badLinkReasons.INVALID_SPACE_CHARACTER,
        ])
      ),
      ...findIssuesForAnchorLinksWithInvalidWrappingQuotes(linksWithGoodSyntax),
      ...findIssuesForInternalFileLinks(internalFileLinks),
      ...findIssuesForInvalidExternalFileLinks(externalFileLinks),
    ]).map(({ markdownLink, reasons }) =>
      newReasonObject(markdownLink, reasons.sort())
    ),
  };
};

const findIssuesForInternalFileLinks = (linkObjects) => {
  return findLinksWithBadHeaderTags(linkObjects);
};

const findIssuesForInvalidExternalFileLinks = (linkObjects) => {
  return [
    ...findInvalidAbsoluteLinks.findIssuesForWindowsAbsoluteLinks(linkObjects),
    ...findInvalidAbsoluteLinks.findIssuesForBadRootAbsoluteLinks(linkObjects),

    ...findIssuesForInvalidRelativeLinkSyntax(linkObjects),
    ...findIssuesForLinksWithFileExtensions(
      linkObjects.filter(
        ({ isExistingDirectory, linkFileExtension }) =>
          !isExistingDirectory && linkFileExtension
      )
    ),
    ...findIssuesForLinksWithoutExtensions(
      linkObjects.filter(
        ({ isExistingDirectory, linkFileExtension }) =>
          !isExistingDirectory && !linkFileExtension
      )
    ),
    ...findLinksWithBadHeaderTags(linkObjects),
    ...findIssuesForInvalidImageExtensions(linkObjects),
  ];
};
