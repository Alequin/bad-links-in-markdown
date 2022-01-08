import { isEmpty, partition } from "lodash";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-invalid-absolute-links";
import { findInvalidRelativeLinkSyntax } from "./find-bad-links/find-invalid-relative-link-syntax";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findLinksWithoutExtensionsAsBad } from "./find-bad-links/find-links-without-extensions-as-bad";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { prepareLinkObjects } from "./prepare-link-objects";

export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ directory, links, sourceFilePath }) => {
      const linkObjects = prepareLinkObjects(links, directory, sourceFilePath);

      const [internalFileLinks, externalFileLinks] = partition(
        linkObjects,
        ({ isInternalFileLink }) => isInternalFileLink
      );

      const missingLinks = groupMatchingLinkObjectWithIssues([
        ...identifyInvalidInternalFileLinks(internalFileLinks),
        ...identifyInvalidExternalFileLinks(externalFileLinks),
      ]);

      return {
        filePath: sourceFilePath,
        missingLinks: missingLinks.map(({ markdownLink, reasons }) => ({
          link: markdownLink,
          reasons,
        })),
      };
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks));
};

const identifyInvalidInternalFileLinks = (linkObjects) => {
  return findLinksWithBadHeaderTags(linkObjects);
};

const identifyInvalidExternalFileLinks = (linkObjects) => {
  return [
    // Windows specific
    ...findInvalidAbsoluteLinks.windowsAbsoluteLinks(linkObjects),

    // General
    ...findInvalidRelativeLinkSyntax(linkObjects),
    ...findMissingLinksWithFileExtensions(
      linkObjects.filter(
        ({ isLinkMissingFileExtension }) => !isLinkMissingFileExtension
      )
    ),
    ...findLinksWithoutExtensionsAsBad(
      linkObjects.filter(
        ({ isLinkMissingFileExtension }) => isLinkMissingFileExtension
      )
    ),
    ...findLinksWithBadHeaderTags(linkObjects),
  ];
};
