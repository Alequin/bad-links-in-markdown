import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/constants";
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
  "bad-links-in-markdown - headers with upper case characters for link type $linkType",
  (markdown) => {
    it(`Identifies local ${markdown.linkType} which use upper case characters in the header, even when the header exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const link = "#MAIN-TITLE";
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "# MAIN TITLE",
          applyTemplate(markdown.template, { link }),
        ].join("\n"),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies local ${markdown.linkType} which point at another files header and uses upper case characters in the header, even when the header exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { fileName: targetFileName } = newTestMarkdownFile({
        directory: testDirectory,
        content: `# MAIN TITLE\nsome random text`,
      });

      const link = `./${targetFileName}#MAIN-TITLE`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "# MAIN TITLE",
          applyTemplate(markdown.template, { link }),
        ].join("\n"),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  }
);
