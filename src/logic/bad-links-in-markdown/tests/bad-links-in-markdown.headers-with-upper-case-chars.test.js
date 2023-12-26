import {
  TOP_LEVEL_TEST_DIRECTORY,
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

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
    it(`Identifies local ${markdown.name} which use upper case characters in the header, even when the header exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "#MAIN-TITLE";
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "# MAIN TITLE",
          applyTemplate(markdown.fullTemplate, { link }),
        ].join("\n"),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
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

    it(`Identifies local ${markdown.name} which point at another files header and uses upper case characters in the header, even when the header exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
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
          applyTemplate(markdown.fullTemplate, { link }),
        ].join("\n"),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
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
