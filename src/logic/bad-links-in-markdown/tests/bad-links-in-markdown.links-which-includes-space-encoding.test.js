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

describe("bad-links-in-markdown - links of type $linkType including space encoding", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("for links of type $linkType", (markdown) => {
    it(`Identifies local ${markdown.linkType} that point at files that do not exist, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "./path/to/missing%20file.md";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
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

    it(`Ignores local ${markdown.linkType} which point at files which exist, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test file 893982";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `foo bar baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: "./test%20file%20893982.md",
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

    it(`Identifies inline local ${markdown.linkType} that point at a files that exists but do not contain the targeted header tag, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = `file%20test`;
      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# foo bar baz\na story of foo and bar\nand baz`,
      });

      const link = `./${fileToLinkTo.fileName}#main-title`;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
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

    it(`Ignores local ${markdown.linkType} which point at files that exist and contain the targeted header, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test file 9023892";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: "./test%20file%209023892.md#main-title",
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
  ])("for links of type $linkType", (markdown) => {
    it(`Identifies a local ${markdown.linkType} that points at an image that does not exist, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "./path/to/missing%20image.png";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
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

    it(`Ignores local ${markdown.linkType} which point at images that exist, even when the link includes space encoding characters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name: "test image",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: "./test%20image.jpg",
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

  it(`Identifies multiple local inline links on the same file line that point at files that do not exist, even when the link includes space encoding characters`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `[I am a local link](./path/to/missing%20file.md) and [I am another local link](./path/to/missing%20file.md)[I am anotherx2 local link](./path/to/missing%20file.md)(foobar)[I am anotherx3 local link](./path/to/missing%20file.md)`,
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
                markdownLink: `[I am a local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `[I am another local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `[I am anotherx2 local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `[I am anotherx3 local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Identifies multiple local inline links on the same file line that point at files that do not exist, even when the link includes space encoding characters`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `![picture](./path/to/missing%20image.png) and ![picture2](./path/to/missing%20image.png)![picture3](./path/to/missing%20image.png)(foobar)![picture4](./path/to/missing%20image.png)`,
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
                markdownLink: `![picture](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `![picture2](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `![picture3](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: `![picture4](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
