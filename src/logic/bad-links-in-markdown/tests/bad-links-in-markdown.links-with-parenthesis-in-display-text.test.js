import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineImageLinkTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  referenceImageLinkTemplate,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceImageLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe("bad-links-in-markdown - links including parenthesis", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("links of type $linkType ", (markdown) => {
    it(`Identifies a local ${markdown.fullTemplate} that points at a file that do not exist, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const linkText = "I am a local link (with parens)";
      const link = "./path/to/missing/file.md";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, { linkText, link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        linkText,
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.fullTemplate} which points at a file that exist, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          linkText: "I am a local link (with parens)",
          link: `./${fileToLinkTo.fileName}`,
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

    it(`Identifies a local ${markdown.fullTemplate} that points at a file that exists but do not contain the targeted header tag, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `# foo bar baz\na story of foo and bar\nand baz`,
      });

      const linkText = "I am a local link (with parens)";
      const link = `./${fileToLinkTo.fileName}#main-title`;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, { linkText, link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        linkText,
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.fullTemplate} which points at a file that exists and contains the targeted header, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          linkText: "I am a local link (with parens)",
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

    it(`Does not include inline web links in list of bad local links, even when the links description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          linkText: "I am a local link (with parens)",
          link: "http://www.google.com",
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
  });

  describe.each([
    inlineImageLinkTemplate,
    referenceImageLinkTemplate,
    shorthandReferenceImageLinkTemplate,
  ])("links of type $linkType ", (markdown) => {
    it(`Identifies a local ${markdown.fullTemplate} link that points at an image that does not exist, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const linkText = "picture (check it out)";
      const link = "./path/to/missing/image.png";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, { linkText, link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        linkText,
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.fullTemplate} link which points at an image which exist, even when the link description text contains parentheses`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          linkText: "picture (check it out)",
          link: `./${imageFile.fileName}`,
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
  });
});
