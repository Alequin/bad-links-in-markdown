import { chain, isEmpty, orderBy, partition } from "lodash";
import { badLinkReasons } from "../../constants";
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
  return chain(fileObjects)
    .map((fileObject, index) => {
      logProgress(index + 1, fileObjects.length);
      return processFile(fileObject);
    })
    .filter(({ missingLinks }) => !isEmpty(missingLinks))
    .orderBy(({ filePath }) => filePath)
    .value();
};

const processFile = (fileObject) => {
  const {
    linksWithGoodSyntax,
    linksWithBadSyntax,
    internalFileLinks,
    externalFileLinks,
  } = partitionLinksObjects(prepareLocalLinkObjects(fileObject));

  const missingLinks = groupMatchingLinkObjectWithIssues([
    ...addBadSyntaxReasonToLinks(linksWithBadSyntax),
    ...findAnchorLinksWithInvalidWrappingQuotes(linksWithGoodSyntax),
    ...findInvalidInternalFileLinks(internalFileLinks),
    ...findInvalidExternalFileLinks(externalFileLinks),
  ]).map(({ markdownLink, reasons }) => ({
    link: markdownLink,
    reasons: reasons.sort(),
  }));

  return {
    missingLinks,
    filePath: fileObject.sourceFilePath,
  };
};

const partitionLinksObjects = (linkObjects) => {
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

const addBadSyntaxReasonToLinks = (linkObjects) => {
  return linkObjects.map((linkObject) => {
    return {
      ...linkObject,
      reasons: [badLinkReasons.INVALID_SPACE_CHARACTER],
    };
  });
};

const findInvalidInternalFileLinks = (linkObjects) => {
  return findLinksWithBadHeaderTags(linkObjects);
};

const findInvalidExternalFileLinks = (linkObjects) => {
  return [
    ...findInvalidAbsoluteLinks.windowsAbsoluteLinks(linkObjects),
    ...findInvalidAbsoluteLinks.badRootAbsoluteLinks(linkObjects),

    ...findInvalidRelativeLinkSyntax(linkObjects),
    ...findMissingLinksWithFileExtensions(
      linkObjects.filter(
        ({ isExistingDirectory, linkFileExtension }) =>
          !isExistingDirectory && linkFileExtension
      )
    ),
    ...findLinksWithoutExtensions(
      linkObjects.filter(
        ({ isExistingDirectory, linkFileExtension }) =>
          !isExistingDirectory && !linkFileExtension
      )
    ),
    ...findLinksWithBadHeaderTags(linkObjects),
    ...findInvalidImageExtensions(linkObjects),
  ];
};
