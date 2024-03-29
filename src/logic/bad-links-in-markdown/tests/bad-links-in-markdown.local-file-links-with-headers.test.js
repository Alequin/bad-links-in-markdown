import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe("bad-links-in-markdown - local header file links", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("General scenarios - For links of type $linkType", (markdown) => {
    describe("For links pointing in external files", () => {
      it(`Identifies a local ${markdown.name} that points at a file that exists but do not contain the targeted header tag`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
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

      it(`Ignores a local ${markdown.name} which points at a file that exists and contain the targeted header`, async () => {
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

      it(`Ignores a local ${markdown.name} which points at a file that exists and contain the targeted sub header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#next-chapter`,
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

      it(`Identifies an absolute local ${markdown.name} that points at a file that exist but does not contain the targeted header tag`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
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

      it(`Ignores an absolute local ${markdown.name} that points at a file that exist and contain the targeted header tag`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main title\na story of foo and bar\nand baz`,
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

      it(`Ignores a local ${markdown.name} which points at a file that exist and contain the targeted sub header that contains varying characters`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#chapter-1-alliancesareformed`,
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

      it(`Identifies a local ${markdown.name} that points at a file that exists, contains the targeted header but does not contain the specified instance`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        const link = `./${fileToLinkTo.fileName}#foo-bar-baz-3`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
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

      it(`Ignores a local ${markdown.name} which points at a file that exist and contains the targeted header that appears multiple times and the link points at the first header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#foo-bar-baz`,
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

      it(`Ignores a local ${markdown.name} which points at a file that exist and contains the targeted header that appears multiple times and the link points at the second header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#foo-bar-baz-1`,
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

      it(`Identifies a local ${markdown.name} that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
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

      it(`Ignores a local ${markdown.name} when they are relative links which link through multiple parent directories`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const innerDirectory1 = await newTestDirectory({
          parentDirectory: testDirectory,
        });

        const innerDirectory2 = await newTestDirectory({
          parentDirectory: innerDirectory1.path,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: innerDirectory2.path,
          content: applyTemplate(markdown.fullTemplate, {
            link: `../../${fileToLinkTo.fileName}#main-title`,
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

      it(`Ignores a local ${markdown.name} which points at a file that exist and contains the targeted header, even when the header includes non alpha-numeric characters`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# Foo Bar -> Bacon and eggs\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#foo-bar---bacon-and-eggs`,
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

      it(`Ignores a local ${markdown.name} which points at a file that exist and contains the targeted header and the header is kabab-case`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main_title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, {
            link: `./${fileToLinkTo.fileName}#maintitle`,
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

    describe("For links pointing at headers in the current file", () => {
      it(`Identifies a local ${markdown.name} that points at a header tag in the current file that does not exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const link = "#main-title";
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
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

      it(`Ignores a local ${markdown.name} that points at a header tag in the current file that exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "# Main Title",
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

      it(`Identifies a local ${markdown.name} that attempts to point at a sub header tag by using multiple hash tags in the link, when the sub header does not exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const link = "##main-title";
        const { filePath: fileContainingLink } = newTestMarkdownFile({
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
                filePath: fileContainingLink,
                foundIssues: [
                  {
                    markdownLink: expectedBadLink,
                    reasons: [
                      badLinkReasons.TOO_MANY_HASH_CHARACTERS,
                      badLinkReasons.HEADER_TAG_NOT_FOUND,
                    ],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.name} that attempts to point at a sub header tag by using multiple hash tags in the link, when the sub header exists`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const link = "##main-title";
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "## Main Title",
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
                    reasons: [badLinkReasons.TOO_MANY_HASH_CHARACTERS],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.name} which points at a header in the current file which consist of multiple text cases`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "### The cat-tails cat_status_award metric\na story of foo and bar\nand baz",
            applyTemplate(markdown.fullTemplate, {
              link: "#the-cat-tails-catstatusaward-metric",
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
  });

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
  ])("Missing file extensions - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.name} that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#different-header`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that points at a file that exists and contains the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#main-title`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that points at a javascript file that exists but the file extension is missing, even if the line number is valid`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-oi234fnio";
      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
        content: "const foobar = () => {}",
      });

      const link = `./${name}#L1`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe.each([
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("Missing file extensions - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.name} that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#different-header`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that points at a file that exists and contains the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#main-title`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that points at a javascript file that exists but the file extension is missing, even if the line number is valid`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-oi234fnio";
      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
        content: "const foobar = () => {}",
      });

      const link = `./${name}#L1`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
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
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
