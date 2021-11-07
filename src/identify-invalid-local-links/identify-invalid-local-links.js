import { isEmpty, partition } from "lodash";
import { isWindowsOs } from "../is-windows-os";
import * as findInvalidAbsoluteLinks from "./find-bad-links/find-invalid-absolute-links";
import { findInvalidRelativeLinkSyntax } from "./find-bad-links/find-invalid-relative-link-syntax";
import { findLinksWithBadHeaderTags } from "./find-bad-links/find-links-with-bad-header-tags";
import { findLinksWithoutExtensionsAsBad } from "./find-bad-links/find-links-without-extensions-as-bad";
import { findMissingLinksWithFileExtensions } from "./find-bad-links/find-missing-links-with-file-extensions";
import { groupMatchingLinkObjectWithIssues } from "./group-matching-link-objects-with-issues";
import { prepareLinkObjects } from "./prepare-link-objects";

const WINDOWS_ABSOLUTE_PATH_REGEX = /^\/?\w:/;
export const identifyInvalidLocalLinks = (fileObjects) => {
  return fileObjects
    .map(({ directory, links, sourceFilePath }) => {
      const [windowsAbsoluteLinks, linksToTest] = partition(
        prepareLinkObjects(links, directory),
        ({ rawLink }) => isWindowsOs() && WINDOWS_ABSOLUTE_PATH_REGEX.test(rawLink)
      );

      const missingLinks = groupMatchingLinkObjectWithIssues([
        // Windows specific
        ...findInvalidAbsoluteLinks.absoluteLinks(windowsAbsoluteLinks),
        ...findInvalidAbsoluteLinks.absoluteImageLinks(windowsAbsoluteLinks),

        // General
        ...findInvalidRelativeLinkSyntax(linksToTest),
        ...findMissingLinksWithFileExtensions(
          linksToTest.filter(({ isLinkMissingFileExtension }) => !isLinkMissingFileExtension)
        ),
        ...findLinksWithoutExtensionsAsBad(
          linksToTest.filter(({ isLinkMissingFileExtension }) => isLinkMissingFileExtension)
        ),
        ...findLinksWithBadHeaderTags(linksToTest),
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
