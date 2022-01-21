import { isEmpty, orderBy, partition } from "lodash";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-invalid-absolute-links";
import { findInvalidRelativeLinkSyntax } from "./find-bad-links/find-invalid-relative-link-syntax";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findLinksWithoutExtensions } from "./find-bad-links/find-links-without-extensions";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { prepareLinkObjects } from "./prepare-link-objects";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map((fileObject) => {
      const linkObjects = prepareLinkObjects(fileObject);

      const [internalFileLinks, externalFileLinks] = partition(
        linkObjects,
        ({ isInternalFileLink }) => isInternalFileLink
      );

      const issues = groupMatchingLinkObjectWithIssues([
        ...findLinksWithBadHeaderTags(internalFileLinks),
        ...identifyInvalidExternalFileLinks(externalFileLinks),
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
};

const identifyInvalidExternalFileLinks = (linkObjects) => {
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
  ];
};
