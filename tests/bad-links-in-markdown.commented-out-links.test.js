import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - commented out links", () => {
  describe("identify-invalid-local-links and the link is an inline link", () => {
    it("Ignores commented out links", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `
        <!-- [I am a local link](./path/to/missing/file.md) -->

        <!--
          [I am a local link](./path/to/missing/file.md)
        -->

        <? [I am a local link](./path/to/missing/file.md) ?>

        <?
          [I am a local link](./path/to/missing/file.md)
        ?>

        [//]: # [I am a local link](./path/to/missing/file.md)

        [//]: #       [I am a local link](./path/to/missing/file.md)

        [//]:# [I am a local link](./path/to/missing/file.md)
        `
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies incorrectly commented out lines", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        [
          "<!- [I am a local link](./path/to/missing/file.md) -->",
          "<!-- [I am a local link](./path/to/missing/file.md) ->",
          "<! [I am a local link](./path/to/missing/file.md) >",
          "< [I am a local link](./path/to/missing/file.md) ?>",
          "<? [I am a local link](./path/to/missing/file.md) >",
          "[//]: #[I am a local link](./path/to/missing/file.md)",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[//]: #[I am a local link](./path/to/missing/file.md)",
                  reasons: [
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                    badLinkReasons.CASE_SENSITIVE_HEADER_TAG,
                  ],
                },
                {
                  link: "[I am a local link](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Does not get confused between two matching links when one is commented out", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `
        [I am a local link](./path/to/missing/file.md)

        <!--
          [I am a local link](./path/to/missing/file.md)
        -->
        `
      );

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
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.each([
      { openComment: "<!--", closeComment: "-->" },
      { openComment: "<?", closeComment: "?>" },
    ])(
      "Does not incorrectly ignore links when the target header is sat between two comments, using the syntax $openComment $closeComment",
      async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });

        fs.writeFileSync(
          filePath,
          `
        <!--
          [I am a local link](./path/to/missing/file.md)
        -->
        
        # Header

        <!--
          [I am a local link](./path/to/missing/file.md)
        -->

        [I am a local link](#header)
        `
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );
  });
});