import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/constants";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - comments in markdown", () => {
  it("Ignores commented out links", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `
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
    `,
    });

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

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "<!- [I am a local link](./path/to/missing/file.md) -->",
        "<!-- [I am a local link](./path/to/missing/file.md) ->",
        "<! [I am a local link](./path/to/missing/file.md) >",
        "< [I am a local link](./path/to/missing/file.md) ?>",
        "<? [I am a local link](./path/to/missing/file.md) >",
        "[//]: #[I am a local link](./path/to/missing/file.md)",
      ].join("\n"),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            foundIssues: [
              {
                markdownLink:
                  "[//]: #[I am a local link](./path/to/missing/file.md)",
                reasons: [
                  badLinkReasons.HEADER_TAG_NOT_FOUND,
                  badLinkReasons.CASE_SENSITIVE_HEADER_TAG,
                ],
              },
              {
                markdownLink: "[I am a local link](./path/to/missing/file.md)",
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

    const { filePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: `
      [I am a local link](./path/to/missing/file.md)

      <!--
        [I am a local link](./path/to/missing/file.md)
      -->
      `,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            foundIssues: [
              {
                markdownLink: "[I am a local link](./path/to/missing/file.md)",
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

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: `
        <!--
          [I am a local link](./path/to/missing/file.md)
        -->
        
        # Header

        <!--
          [I am a local link](./path/to/missing/file.md)
        -->

        [I am a local link](#header)
        `,
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    }
  );

  it("Ignores local inline links which point at existing headers that are followed by a comment", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
      content: `# main-title <!-- omit-in-toc -->`,
    });

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
      content: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local inline links which point at missing headers that are followed by a comment", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
      content: `# unexpected title <!-- omit-in-toc -->`,
    });

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
      content: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            foundIssues: [
              {
                markdownLink: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at existing headers that are followed by a comment", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
      content: `# main-title <!-- omit-in-toc -->`,
    });

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
      content: `[I am a local link][1]\n\n[1]: ./${fileToLinkTo.fileName}#main-title`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local reference links which point at missing headers that are followed by a comment", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
      content: `# unexpected title <!-- omit-in-toc -->`,
    });

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
      content: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            foundIssues: [
              {
                markdownLink: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
