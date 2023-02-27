import { isEmpty, orderBy, partition } from "lodash";
import { findAnchorLinksWithInvalidWrappingQuotes } from "./find-bad-links/find-anchor-links-with-invalid-wrapping-quotes";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-invalid-absolute-links";
import { findInvalidImageExtensions } from "./find-bad-links/find-invalid-image-extensions";
import { findInvalidRelativeLinkSyntax } from "./find-bad-links/find-invalid-relative-link-syntax";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findLinksWithoutExtensions } from "./find-bad-links/find-links-without-extensions";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { logProgress } from "./log-progress";
import { prepareLocalLinkObjects } from "./prepare-local-link-objects";

export const identifyInvalidLocalLinks = (fileObjects) => {
  const identifiedInvalidLinks = fileObjects
    .map((fileObject, index) => {
      logProgress(index + 1, fileObjects.length);

      const linkObjects = prepareLocalLinkObjects(fileObject);

      const [internalFileLinks, externalFileLinks] = partition(
        linkObjects,
        ({ isInternalFileLink }) => isInternalFileLink
      );

      const issues = groupMatchingLinkObjectWithIssues([
        ...findAnchorLinksWithInvalidWrappingQuotes(linkObjects),
        ...findInvalidInternalFileLinks(internalFileLinks),
        ...findInvalidExternalFileLinks(externalFileLinks),
      ]).map((issue) => ({
        ...issue,
        reasons: issue.reasons.sort(),
      }));

      return {
        filePath: fileObject.sourceFilePath,
        missingLinks: issues.map(({ markdownLink, reasons }) => ({
          link: markdownLink,
          reasons,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));

  return orderBy(identifiedInvalidLinks, ({ filePath }) => filePath);
};

const findInvalidInternalFileLinks = (linkObjects) =>
  findLinksWithBadHeaderTags(linkObjects);

const findInvalidExternalFileLinks = (linkObjects) => {
  return [
    ...findInvalidAbsoluteLinks.windowsAbsoluteLinks(linkObjects),
    ...findInvalidAbsoluteLinks.badRootAbsoluteLinks(linkObjects),

    ...findInvalidRelativeLinkSyntax(linkObjects),
    ...findMissingLinksWithFileExtensions(
      linkObjects.filter(
        ({ isLinkMissingFileExtension }) => !isLinkMissingFileExtension
      )
    ),
    ...findLinksWithoutExtensions(
      linkObjects.filter(
        ({ isLinkMissingFileExtension }) => isLinkMissingFileExtension
      )
    ),
    ...findLinksWithBadHeaderTags(linkObjects),
    ...findInvalidImageExtensions(linkObjects),
  ];
};
