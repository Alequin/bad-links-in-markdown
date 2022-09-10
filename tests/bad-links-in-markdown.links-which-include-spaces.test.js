import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  applyTemplate,
  inlineImageLinkTemplate,
  inlineLinkTemplate,
  referenceImageLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceImageLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown links-which-include-spaces", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
  ])(
    "bad-links-in-markdown - links including spaces when link type is $linkType",
    (markdown) => {
      it(`Identifies local ${markdown.linkType} that point at files that do not exist, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = "    ./path/to/missing/file.md    ";
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink.trim(),
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores local ${markdown.linkType} which point at files which exist, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `foo bar baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `    ./${fileToLinkTo.fileName}    `,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies local ${markdown.linkType} that point at files that exists but do not contain the targeted header tag, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz`,
        });

        const link = `    ./${fileToLinkTo.fileName}#main-title    `;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink.trim(),
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores local ${markdown.linkType} which point at files that exist and contain the targeted header, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `    ./${fileToLinkTo.fileName}#main-title    `,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Does not include web links of type ${markdown.linkType} in the list of bad local links, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `    http://www.google.com    `,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([anchorLinkSingleQuoteTemplate, anchorLinkDoubleQuoteTemplate])(
    "bad-links-in-markdown - links including spaces when link type is $linkType",
    (markdown) => {
      it(`Identifies local ${markdown.linkType} that points at a file that do not exists, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = "    ./path/to/missing/file.md    ";
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink.trim(),
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies local ${markdown.linkType} which points at a file which exists when the link includes empty space at the start`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `foo bar baz`,
        });

        const link = `    ./${fileToLinkTo.fileName}`;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file which exists when the link contains spaces at the end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `foo bar baz`,
        });

        const link = `./${fileToLinkTo.fileName}    `;
        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies a web link of type ${markdown.linkType} in the list of bad local links when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = `    http://www.google.com    `;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Does not include a web link of type ${markdown.linkType} in the list of bad local links when the links contain spaces at the end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = `http://www.google.com    `;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([
    inlineImageLinkTemplate,
    referenceImageLinkTemplate,
    shorthandReferenceImageLinkTemplate,
  ])(
    "bad-links-in-markdown - links including spaces when link type is $linkType",
    (markdown) => {
      it(`Identifies local ${markdown.linkType} that point at images that does not exist, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = "     ./path/to/missing/image.png     ";
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: expectedBadLink.trim(),
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores local ${markdown.linkType} which point at images which exist, even when the links contain spaces at the start and end`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const imageFile = newTestFile({
          directory: testDirectory,
          extension: ".jpg",
          content: "",
        });
        fs.writeFileSync(imageFile.filePath, "");

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `     ./${imageFile.fileName}     `,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );
});
