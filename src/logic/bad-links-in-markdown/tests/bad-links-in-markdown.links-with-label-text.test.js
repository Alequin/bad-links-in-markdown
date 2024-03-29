import {
  TOP_LEVEL_TEST_DIRECTORY,
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

describe("bad-links-in-markdown - links with label text", () => {
  describe.each([`"`, `'`].slice(0, 1))(
    "When the quote mark used is %s",
    (quoteMark) => {
      const labelText = `${quoteMark}the links label text${quoteMark}`;

      describe.each([
        inlineLinkTemplate,
        referenceLinkTemplate,
        shorthandReferenceLinkTemplate,
      ])("For link type $linkType", (markdown) => {
        it(`Identifies a local ${markdown.name} that points at file that does not exist, even when the link includes label text`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const link = `./path/to/missing/file.md ${labelText}`;
          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.fullTemplate, { link }),
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

        it(`Ignores a local ${markdown.name} which points at file that exist, even when the link includes label text`, async () => {
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
              link: `./${fileToLinkTo.fileName} ${labelText}`,
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

        it(`Identifies a local ${markdown.name} that points at a file that exists but do not contain the targeted header tag, even when the link includes label text`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const fileToLinkTo = newTestMarkdownFile({
            directory: testDirectory,
            content: `# foo bar baz\na story of foo and bar\nand baz`,
          });

          const link = `./${fileToLinkTo.fileName}#main-title ${labelText}`;
          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.fullTemplate, {
              link,
            }),
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

        it(`Ignores a local ${markdown.name} which points at a file that exist and contain the targeted header, even when the link includes label text`, async () => {
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
              link: `./${fileToLinkTo.fileName}#main-title ${labelText}`,
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

        it(`Identifies a local ${markdown.name} that points at a header tag in the current file that does not exist, even when the link includes label text`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const link = `#main-title ${labelText}`;
          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.fullTemplate, { link }),
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

        it(`Ignores an local ${markdown.name} that points at a header tag in the current file that exist, even when the link includes label text`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          newTestMarkdownFile({
            directory: testDirectory,
            content: [
              "# Main title",
              applyTemplate(markdown.fullTemplate, {
                link: `#main-title ${labelText}`,
              }),
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
      });

      describe.each([
        inlineImageLinkTemplate,
        referenceImageLinkTemplate,
        shorthandReferenceImageLinkTemplate,
      ])("For link type $linkType", (markdown) => {
        it(`Identifies a local ${markdown.fullTemplate} link that points at an image that does not exist, even when the link includes label text`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const link = `./path/to/missing/image.png ${labelText}`;
          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.fullTemplate, {
              link,
            }),
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

        it(`Ignores a local ${markdown.fullTemplate} link that points at an image that exist, even when the link includes label text`, async () => {
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
              link: `./${imageFile.fileName} ${labelText}`,
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

      it(`Identifies multiple local inline links on the same file line that point at files that do not exist, even when the link includes label text`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: `[I am a local link](./path/to/missing/file.md ${labelText}) and [I am another local link](./path/to/missing/file.md ${labelText})[I am anotherx2 local link](./path/to/missing/file.md ${labelText})(foobar)[I am anotherx3 local link](./path/to/missing/file.md ${labelText})`,
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
                    markdownLink: `[I am a local link](./path/to/missing/file.md ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `[I am another local link](./path/to/missing/file.md ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `[I am anotherx2 local link](./path/to/missing/file.md ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `[I am anotherx3 local link](./path/to/missing/file.md ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies multiple local inline image links on the same file line that point at files that do not exist, even when the link includes label text`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: `![picture](./path/to/missing/image.png ${labelText}) and ![picture2](./path/to/missing/image.png ${labelText})![picture3](./path/to/missing/image.png ${labelText})(foobar)![picture4](./path/to/missing/image.png ${labelText})`,
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
                    markdownLink: `![picture](./path/to/missing/image.png ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `![picture2](./path/to/missing/image.png ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `![picture3](./path/to/missing/image.png ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                  {
                    markdownLink: `![picture4](./path/to/missing/image.png ${labelText})`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
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
  ])("For link type $linkType", (markdown) => {
    it(`Ignores a local ${markdown.name} that points at file that does not exist when the link includes label text not wrapped in quotes`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: "./path/to/missing/file.md invalid-label-text",
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
