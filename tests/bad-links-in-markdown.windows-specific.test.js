import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/constants";
import {
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
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - windows specific", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
  ])("$linkType", (markdown) => {
    it(`Identifies a windows absolute ${markdown.linkType} that does not start with a forward slash`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const absolutePath = "C:\\path\\to\\missing\\file.md";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link: absolutePath }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
        link: absolutePath,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe.each([
    inlineImageLinkTemplate,
    referenceImageLinkTemplate,
    shorthandReferenceImageLinkTemplate,
  ])("$linkType", (markdown) => {
    it(`Identifies a windows absolute ${markdown.linkType} for an image that does not start with a forward slash`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const absolutePath = "C:\\path\\to\\missing\\image.png";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link: absolutePath }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
        link: absolutePath,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  it("Identifies an absolute local reference image as invalid even when the reference is used as both an image and a file link", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const absolutePath = "C:\\path\\to\\missing\\image.png";
    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `Here is some text\n[and then a link to a file][picture]\n![and then a link to a image][picture]\n\n[picture]: /${absolutePath}`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            foundIssues: [
              {
                markdownLink: `[picture]: /${absolutePath}`,
                reasons: [
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
                  badLinkReasons.FILE_NOT_FOUND,
                ].sort(),
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
