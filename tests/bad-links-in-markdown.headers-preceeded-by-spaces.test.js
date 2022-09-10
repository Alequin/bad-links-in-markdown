import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe.each([
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
])(
  "bad-links-in-markdown - headers preceded by space characters for link type $linkType",
  (markdown) => {
    it(`Ignores local ${markdown.linkType} which point at headers which exist and are preceded by space characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `        # main-title\na story of foo and bar\nand baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: `./${fileToLinkTo.fileName}#main-title`,
        }),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it(`Ignores local ${markdown.linkType} which point at headers in the same file and are preceded by space characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "  # main-title\na story of foo and bar\nand baz",
          applyTemplate(markdown.template, { link: "#main-title" }),
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  }
);
