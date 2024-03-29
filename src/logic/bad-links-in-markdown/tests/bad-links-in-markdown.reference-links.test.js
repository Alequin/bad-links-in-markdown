import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../../../constants";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_TEST_DIRECTORY,
} from "../../../../integration-test-utils";

describe("bad-links-in-markdown - reference links", () => {
  it("Does not error if some of the markdown is written in a similar way to a reference link", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: `[1]: Reloading NGINX Plus - high performance web server.`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not error if some of the markdown is written is a similar way to a reference link and the text appears twice in the file", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: `
    [1]: Reloading NGINX Plus - high performance web server.
    [1]: Reloading NGINX Plus - high performance web server.
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

  it.each(["a", "1", "<", "/"])(
    "Ignores local reference links that point at files that do not exist when the link is preceded by %s",
    async (precedingText) => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: `Here is some text\n[and then a link to a file][1]\n\n${precedingText} [1]: ./path/to/missing/file.md`,
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    }
  );

  it.each([">", ">>", ">>>", ">> >>", "    "])(
    "Identifies local reference links that point at files that do not exist when the link is preceded only by '%s'",
    async (precedingText) => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: `Here is some text\n[and then a link to a file][1]\n\n${precedingText} [1]: ./path/to/missing/file.md`,
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
                    `${precedingText} [1]: ./path/to/missing/file.md`.trim(),
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    }
  );
});
