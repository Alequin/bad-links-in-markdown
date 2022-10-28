import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - anchor tags", () => {
  it("Identifies anchor links which make use of invalid quote marks such as '”'", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `Here is some text\n<a href=”./file.md”>a link</a>`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "<a href=”./file.md”>a link</a>",
                reasons: [
                  badLinkReasons.MISSING_FILE_EXTENSION,
                  badLinkReasons.FILE_NOT_FOUND,
                  badLinkReasons.ANCHOR_TAG_INVALID_QUOTE,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});