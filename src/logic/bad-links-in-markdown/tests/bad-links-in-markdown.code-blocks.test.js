import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../../../constants";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_TEST_DIRECTORY,
} from "../../../../integration-test-utils";

const MULTILINE_CODE_BLOCKS = [
  { openBlock: "```", closeBlock: "```" },
  { openBlock: "<pre>", closeBlock: "</pre>" },
  { openBlock: "<code>", closeBlock: "</code>" },
];

describe("bad-links-in-markdown - code sections", () => {
  describe("when using single line code blocks such as `code-block`", () => {
    it(`Ignores local inline links wrapped in single backticks`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "`[I am a local link 1](./path/to/missing/file.md)`",
          "`here is some other text [I am a local link 2](./path/to/missing/file.md) more text over here`",
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

    it(`Identifies local inline links that point to files that don't exist, even when the link text contains text wrapped in single backticks`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: "[I am a `local link`](./path/to/missing/file.md)",
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
                  markdownLink:
                    "[I am a `local link`](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies local inline links the point to files that don't exist when they follow a complete code block and are within an incomplete code block, where the block is created with single backticks`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const completeCodeBlock = "`code block contents`";
      const incompleteCodeBlock =
        "[I am a local link](./path/to/missing/file.md) `";

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
  });

  describe.each([1, 2, 3])(
    "indented code block - indented %sX",
    (indentationModifier) => {
      // indented code block requires at least 4 spaces from the line start to create the block
      const INDENTATION = "    ".repeat(indentationModifier);

      it("Ignores local inline links included in indented code blocks, even when the link is points to a missing files", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "Here is some text to talk about something",
            "", // space required between paragraph and code block
            `${INDENTATION}[I am a local link](./path/to/missing/file.md)`,
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
    }
  );

  describe.each(MULTILINE_CODE_BLOCKS)(
    "When using a multiline block created with '$openBlock'",
    ({ openBlock, closeBlock }) => {
      it(`Ignores local inline links wrapped in a ${openBlock} block, even when the link points to a missing file`, async () => {
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

  describe.each(MULTILINE_CODE_BLOCKS)(
    "When header text includes text wrapped in '$openBlock'",
    ({ openBlock, closeBlock }) => {
      it(`Does not identify a local inline link that points at header that includes content wrapped in a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });
        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            `# Header ${openBlock}text${closeBlock}`,
            "[I am a local link 1](#header-text)",
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

      it(`Does not identify a local reference link that points at header that includes content wrapped in a ${openBlock} block`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            `# Header ${openBlock}text${closeBlock}`,
            "[I am a local link 1][foobar]",
            "[foobar]: #header-text",
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
});
