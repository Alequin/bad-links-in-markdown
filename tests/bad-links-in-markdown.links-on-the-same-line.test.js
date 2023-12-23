import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/constants";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown  - links on the same line", () => {
  it("Identifies multiple local inline links on the same file line that point at files that do not exist", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "[I am a local link](./path/to/missing/file.md)",
        "[I am another local link](./path/to/missing/file.md)",
        "[I am anotherx2 local link](./path/to/missing/file.md)",
        "[I am anotherx3 local link](./path/to/missing/file.md)",
      ].join(" and "),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                markdownLink: "[I am a local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "[I am another local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "[I am anotherx2 local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "[I am anotherx3 local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies multiple local anchor links on the same file line that point at files that do not exist", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "<a href='./path/to/missing/file.md'>I am a local link</a>",
        "<a href='./path/to/missing/file.md'>I am another local link</a>",
        "<a href='./path/to/missing/file.md'>I am anotherx2 local link</a>",
        "<a href='./path/to/missing/file.md'>I am anotherx3 local link</a>",
      ].join(" and "),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                markdownLink:
                  "<a href='./path/to/missing/file.md'>I am a local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "<a href='./path/to/missing/file.md'>I am another local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "<a href='./path/to/missing/file.md'>I am anotherx2 local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink:
                  "<a href='./path/to/missing/file.md'>I am anotherx3 local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies multiple local inline image links on the same file line that point at images that do not exist", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `![picture](./path/to/missing/image.png) and ![picture2](./path/to/missing/image.png)![picture3](./path/to/missing/image.png)(foobar)![picture4](./path/to/missing/image.png)`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                markdownLink: "![picture](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: "![picture2](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: "![picture3](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                markdownLink: "![picture4](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
