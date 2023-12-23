import { badLinksInMarkdown } from "../../bad-links-in-markdown";
import { badLinkReasons } from "../../src/constants";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_TEST_DIRECTORY,
} from "../test-utils";

describe("bad-links-in-markdown - code sections", () => {
  describe.each([
    { openBlock: "`", closeBlock: "`" },
    { openBlock: "<code>", closeBlock: "<code/>" },
  ])(
    "when using single line code blocks created using $openBlock",
    ({ openBlock, closeBlock }) => {
      it(`Ignores local inline links wrapped in ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            `${openBlock}[I am a local link 1](./path/to/missing/file.md)${closeBlock}`,
            `${openBlock}here is some other text [I am a local link 2](./path/to/missing/file.md) more text over here${closeBlock}`,
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

      it(`Ignores local reference links wrapped in ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            `${openBlock}[I am a reference link 1]: ./path/to/missing/file.md${closeBlock}`,
            `${openBlock}this is text [I am a reference link 2]: ./path/to/missing/file.md also this${closeBlock}`,
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

      it(`Identifies local inline links the point to files that don't exist, even when the link text contains text wrapped in ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: `[I am a ${openBlock}local link${closeBlock}](./path/to/missing/file.md)`,
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
                    markdownLink: `[I am a ${openBlock}local link${closeBlock}](./path/to/missing/file.md)`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies local reference links the point to files that don't exist, even when the link text contains text wrapped in ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            `[I am a ${openBlock}reference${closeBlock} link 1]: ./path/to/missing/file.md`,
          ].join("\n"),
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
                    markdownLink: `[I am a ${openBlock}reference${closeBlock} link 1]: ./path/to/missing/file.md`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies local inline links the point to files that don't exist when they follow a complete code block and are within an incomplete code block, where the block is created with ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const completeCodeBlock = `${openBlock}code block contents${closeBlock}`;
        const incompleteCodeBlock = `[I am a local link](./path/to/missing/file.md) ${closeBlock}`;

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: `${completeCodeBlock} ${incompleteCodeBlock}`,
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
                    markdownLink: `[I am a local link](./path/to/missing/file.md)`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies local inline links the point to files that don't exist when they follow a complete code block and are within an incomplete code block, where the block is created with ${openBlock}`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const completeCodeBlock = `${openBlock}code block contents${closeBlock}`;

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            completeCodeBlock,
            "",
            `[I am a reference link 1]: ./path/to/missing/file.md`,
            closeBlock,
          ].join("\n"),
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
                    markdownLink: `[I am a reference link 1]: ./path/to/missing/file.md`,
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

  describe.each([1, 2, 3])(
    "indented code block - indented %sX",
    (indentationModifier) => {
      // indented code block requires at least 4 spaces from the line start to create the block
      const indentation = "    ".repeat(indentationModifier);

      it("Ignores local inline links included in indented code blocks, even when the link is broken", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something",
            // space required between paragraph and code block
            "",
            `${indentation}[I am a local link](./path/to/missing/file.md)`,
            "some more text here that is not in the code block",
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

      it("Ignores local reference links in indented code blocks, even when the link is broken", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something: [foobar][I am a reference link]",
            // space required between paragraph and code block
            "",
            `${indentation}[I am a reference link]: ./path/to/missing/file.md`,
            "some more text here that is not in the code block",
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

      it("Identifies local inline links when the header they link to is in an indented code block", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something: [I am a local link](#cool-header)",
            // space required between paragraph and code block
            "",
            `${indentation}# Cool Header`,
            "some more text here that is not in the code block",
          ].join("\n"),
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
                    markdownLink: "[I am a local link](#cool-header)",
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it("Identifies local reference links when the header they link to is in an indented code block", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something: [foobar][I am a reference link]",
            // space required between paragraph and code block
            "",
            `${indentation}# Cool Header`,
            "some more text here that is not in the code block",
            "[I am a reference link]: #cool-header",
          ].join("\n"),
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
                    markdownLink: "[I am a reference link]: #cool-header",
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it("Identifies a local inline link in an indented code block when the block is not preceded by a blank line", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something",
            // No empty lin here so code block is broken
            `${indentation}[I am a local link](./path/to/missing/file.md)`,
            "some more text here that is not in the code block",
          ].join("\n"),
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
                    markdownLink: `[I am a local link](./path/to/missing/file.md)`,
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it("Identifies a local reference link in an indented code block when the block is not preceded by a blank line", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something: [foobar][I am a reference link]",
            // No empty lin here so code block is broken
            `${indentation}[I am a reference link]: ./path/to/missing/file.md`,
            "some more text here that is not in the code block",
          ].join("\n"),
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
                    markdownLink: `[I am a reference link]: ./path/to/missing/file.md`,
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
    { openBlock: "```", closeBlock: "```" },
    { openBlock: "<pre>", closeBlock: "<pre/>" },
  ])(
    "When using a code multiline block created with '$openBlock'",
    ({ openBlock, closeBlock }) => {
      it(`Ignores local inline links wrapped in a ${openBlock} block, even when the link is broken`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            openBlock,
            `[I am a local link](./path/to/missing/file.md)`,
            closeBlock,
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

      it(`Ignores local reference links wrapped in a ${openBlock} block, even when the link is broken`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "[foobar][I am a reference link]",
            openBlock,
            `[I am a reference link]: ./path/to/missing/file.md`,
            closeBlock,
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

      it(`Identifies local inline links when the header they link to is in a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            openBlock,
            "# cool header",
            closeBlock,
            `[I am a local link](#cool-header)`,
          ].join("\n"),
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
                    markdownLink: "[I am a local link](#cool-header)",
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies local reference links when the header they link to is in a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            openBlock,
            "# cool header",
            closeBlock,
            "",
            "[foobar][I am a reference link]",
            `[I am a reference link]: #cool-header`,
          ].join("\n"),
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
                    markdownLink: "[I am a reference link]: #cool-header",
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores local inline links which point at headers placed within a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            openBlock,
            "pre contents 1",
            closeBlock,
            "# header",
            openBlock,
            "pre contents 2",
            closeBlock,
            "[header link](#header)",
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

      it(`Ignores local reference links which point at headers placed within a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            openBlock,
            "pre contents 1",
            closeBlock,
            "# header",
            openBlock,
            "pre contents 2",
            closeBlock,
            "[header link][foo]",
            "[foo][#header]",
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

  describe("When header text includes text wrapped in a single backtick", () => {
    it("Ignores a local inline link that points at header that includes content wrapped in a single backtick", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });
      newTestMarkdownFile({
        directory: testDirectory,
        content: `
        # Header \`text\`
        [I am a local link 1](#header-text)
        `,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores a local reference link that points at header that includes content wrapped in a single backtick", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });
      newTestMarkdownFile({
        directory: testDirectory,
        content: `
        # Header \`text\`
        [I am a local link 1][foobar]
        [foobar]: #header-text
        `,
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

  describe("When header text includes text wrapped in a <code> tag", () => {
    it("Identifies a local inline link that points at header that includes content wrapped in <code> tags", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: `
        # Header <code>text</code>
        [I am a local link 1](#header-text)
        `,
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
                  markdownLink: "[I am a local link 1](#header-text)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at header that includes content wrapped in <code> tags", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: `
        # Header <code>text</code>
        [I am a local link 1][foobar]
        [foobar]: #header-text
        `,
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
                  markdownLink: "[foobar]: #header-text",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
