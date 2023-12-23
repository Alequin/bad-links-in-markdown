import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

import {
  TOP_LEVEL_TEST_DIRECTORY,
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
} from "../../../../integration-test-utils";

describe("bad-links-in-markdown - anchor tags", () => {
  it("Identifies anchor links which make use of invalid quote marks such as '”'", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `Here is some text\n<a href=”./file.md”>a link</a>`,
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
                markdownLink: "<a href=”./file.md”>a link</a>",
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
