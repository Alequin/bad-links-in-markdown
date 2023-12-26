import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestMarkdownFile,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe.each([
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
])("bad-links-in-markdown - underscore headers for link", (markdown) => {
  it(`Ignores local ${markdown.name} which point at headers in the current file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "=",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-a-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution B: Foo x Bar Hybrid",
        "==",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-b-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution C: Foo x Bar Hybrid",
        "===",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-c-foo-x-bar-hybrid",
        }),
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

  it(`Ignores local ${markdown.name} which point at headers in the current file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "-",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-a-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution B: Foo x Bar Hybrid",
        "--",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-b-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution C: Foo x Bar Hybrid",
        "---",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: "#solution-c-foo-x-bar-hybrid",
        }),
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

  it(`Identifies local ${markdown.name} which point at invalid headers in the current file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const firstLink = "#solution-a-foo-x-bar-hybrid";
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "",
        "===",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: firstLink,
        }),
      ].join("\n"),
    });
    const firstExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: firstLink,
    });

    const secondLink = "#solution-b-foo-x-bar-hybrid";
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution B",
        "Foo x Bar Hybrid",
        "===",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: secondLink,
        }),
      ].join("\n"),
    });
    const secondExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            foundIssues: [
              {
                markdownLink: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            foundIssues: [
              {
                markdownLink: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.name} which point at invalid headers in the current file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const firstLink = "#solution-a-foo-x-bar-hybrid";
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "",
        "---",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: firstLink,
        }),
      ].join("\n"),
    });
    const firstExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: firstLink,
    });

    const secondLink = "#solution-c-foo-x-bar-hybrid";
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution B",
        "Foo x Bar Hybrid",
        "---",
        "",
        applyTemplate(markdown.fullTemplate, {
          link: secondLink,
        }),
      ].join("\n"),
    });
    const secondExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            foundIssues: [
              {
                markdownLink: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            foundIssues: [
              {
                markdownLink: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Ignores local ${markdown.name} which point at headers in a different file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const fileA = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileA.fileName}#solution-a-foo-x-bar-hybrid`,
      }),
    });

    const fileB = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "=="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileB.fileName}#solution-b-foo-x-bar-hybrid`,
      }),
    });

    const fileC = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution C: Foo x Bar Hybrid", "==="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileC.fileName}#solution-c-foo-x-bar-hybrid`,
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Ignores local ${markdown.name} which point at headers in a different file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const fileA = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "-"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileA.fileName}#solution-a-foo-x-bar-hybrid`,
      }),
    });

    const fileB = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "--"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileB.fileName}#solution-b-foo-x-bar-hybrid`,
      }),
    });

    const fileC = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution C: Foo x Bar Hybrid", "---"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: `./${fileC.fileName}#solution-c-foo-x-bar-hybrid`,
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.name} which point at invalid headers in a different file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const firstTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "", "===", ""].join("\n"),
    });
    const firstLink = `./${firstTargetFile.fileName}#solution-a-foo-x-bar-hybrid`;
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: firstLink,
      }),
    });
    const firstExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: firstLink,
    });

    const secondTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "", "===", ""].join("\n"),
    });
    const secondLink = `./${secondTargetFile.fileName}#solution-b-foo-x-bar-hybrid`;
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: secondLink,
      }),
    });
    const secondExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            foundIssues: [
              {
                markdownLink: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            foundIssues: [
              {
                markdownLink: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.name} which point at invalid headers in a different file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const firstTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "", "---", ""].join("\n"),
    });
    const firstLink = `./${firstTargetFile.fileName}#solution-a-foo-x-bar-hybrid`;
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: firstLink,
      }),
    });
    const firstExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: firstLink,
    });

    const secondTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "", "---", ""].join("\n"),
    });
    const secondLink = `./${secondTargetFile.fileName}#solution-b-foo-x-bar-hybrid`;
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: secondLink,
      }),
    });
    const secondExpectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            foundIssues: [
              {
                markdownLink: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            foundIssues: [
              {
                markdownLink: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
