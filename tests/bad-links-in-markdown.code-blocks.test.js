import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - code blocks", () => {
  describe("triple back ticks code block", () => {
    it("Ignores local inline links wrapped in triple backticks, even when the link is broken", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "```",
          `[I am a local link](./path/to/missing/file.md)`,
          "```",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links wrapped in triple backticks, even when the link is broken", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "[foobar][I am a reference link]",
          "```",
          `[I am a reference link]: ./path/to/missing/file.md`,
          "```",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links when the header they link to is in triple backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "```",
          "# cool header",
          "```",
          `[I am a local link](#cool-header)`,
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](#cool-header)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links when the header they link to is in triple backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "```",
          "# cool header",
          "```",
          "",
          "[foobar][I am a reference link]",
          `[I am a reference link]: #cool-header`,
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a reference link]: #cool-header",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at headers placed between two backtick sections", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "```",
          "backtick contents 1",
          "```",
          "# header",
          "```",
          "backtick contents 1",
          "```",
          "[header link](#header)",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at headers placed between two backtick sections", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "```",
          "backtick contents 1",
          "```",
          "# header",
          "```",
          "backtick contents 1",
          "```",
          "[header link][foo]",
          "[foo][#header]",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("single back ticks code block", () => {
    it("Ignores local inline links wrapped in single backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "`[I am a local link 1](./path/to/missing/file.md)`",
          "`here is some other text [I am a local link 2](./path/to/missing/file.md) more text over here`",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links wrapped in single backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "`[I am a reference link 1]: ./path/to/missing/file.md`",
          "`this is text [I am a reference link 2]: ./path/to/missing/file.md also this`",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links the point to files that don't exist, even when the link text contains backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: "[I am a `local link`](./path/to/missing/file.md)",
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a `local link`](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links the point to files that don't exist, even when the link text contains backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          "[I am a `reference` link 1]: ./path/to/missing/file.md",
        ].join("\n"),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a `reference` link 1]: ./path/to/missing/file.md",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores a local inline link that points at header that includes backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: `
      # Header \`text\`

      [I am a local link 1](#header-text)
      `,
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores a local reference link that points at header that includes backticks", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
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
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe.each([1, 2, 3])(
    "indented code block - indented %sX",
    (indentationModifier) => {
      // indented code block requires at least 4 spaces from the line start to create the block
      const indentation = "    ".repeat(indentationModifier);

      it("Ignores local inline links included in indented code blocks, even when the link is broken", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
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
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it("Ignores local reference links in indented code blocks, even when the link is broken", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
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
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it("Identifies local inline links when the header they link to is in an indented code block", async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
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
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: "[I am a local link](#cool-header)",
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
          parentDirectory: TOP_LEVEL_DIRECTORY,
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
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: "[I am a reference link]: #cool-header",
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
          parentDirectory: TOP_LEVEL_DIRECTORY,
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
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: `[I am a local link](./path/to/missing/file.md)`,
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
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });

        fs.writeFileSync(
          filePath,
          [
            "Here is some text to talk about something: [foobar][I am a reference link]",
            // No empty lin here so code block is broken
            `${indentation}[I am a reference link]: ./path/to/missing/file.md`,
            "some more text here that is not in the code block",
          ].join("\n")
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: `[I am a reference link]: ./path/to/missing/file.md`,
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

  describe("html code block", () => {
    it.todo("works as expected");
  });
});
