import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestMarkdownFile,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe("Markdown headers", () => {
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
      it(`Ignores local ${markdown.name} which point at headers which exist and are preceded by space characters`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `        # main-title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#main-title`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(
            await badLinksInMarkdown({ targetDirectory: testDirectory })
          ).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores local ${markdown.name} which point at headers in the same file and are preceded by space characters`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "  # main-title\na story of foo and bar\nand baz",
            applyTemplate(markdown.fullTemplate, { link: "#main-title" }),
          ].join("\n"),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(
            await badLinksInMarkdown({ targetDirectory: testDirectory })
          ).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])(
    "bad-links-in-markdown - headers with invalid characters at the end of the line for link type $linkType",
    (markdown) => {
      it.each(['"', "?"])(
        `Ignores local ${markdown.name} which point at headers which end in %s`,
        async (invalidChar) => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const fileToLinkTo = newTestMarkdownFile({
            directory: testDirectory,
            content: `# main-title ${invalidChar}\na story of foo and bar\nand baz`,
          });

          newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.fullTemplate, {
              link: `./${fileToLinkTo.fileName}#main-title-`,
            }),
          });

          await runTestWithDirectoryCleanup(async () => {
            expect(
              await badLinksInMarkdown({ targetDirectory: testDirectory })
            ).toEqual({
              badLocalLinks: [],
            });
          }, testDirectory);
        }
      );
    }
  );

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

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])(
    "bad-links-in-markdown - headers with multiple valid link definitions $linkType",
    (markdown) => {
      it(`Does not identify valid headers when the links to them are correct, even when there are multiple possible formats`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `## Should I write an end-to-end test ?\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#should-i-write-an-end-to-end-test`,
          }),
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#should-i-write-an-end-to-end-test-`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(
            await badLinksInMarkdown({ targetDirectory: testDirectory })
          ).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );
});
