import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
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
                link: "[I am a local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "[I am another local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "[I am anotherx2 local link](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "[I am anotherx3 local link](./path/to/missing/file.md)",
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
                link: "<a href='./path/to/missing/file.md'>I am a local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "<a href='./path/to/missing/file.md'>I am another local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "<a href='./path/to/missing/file.md'>I am anotherx2 local link</a>",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "<a href='./path/to/missing/file.md'>I am anotherx3 local link</a>",
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
                link: "![picture](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "![picture2](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "![picture3](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: "![picture4](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
