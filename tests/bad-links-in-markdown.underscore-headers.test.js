import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe.each([
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
])("bad-links-in-markdown - underscore headers for link", (markdown) => {
  it(`Ignores local ${markdown.linkType} which point at headers in the current file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "=",
        "",
        applyTemplate(markdown.template, {
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
        applyTemplate(markdown.template, {
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
        applyTemplate(markdown.template, {
          link: "#solution-c-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Ignores local ${markdown.linkType} which point at headers in the current file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "-",
        "",
        applyTemplate(markdown.template, {
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
        applyTemplate(markdown.template, {
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
        applyTemplate(markdown.template, {
          link: "#solution-c-foo-x-bar-hybrid",
        }),
      ].join("\n"),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.linkType} which point at invalid headers in the current file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const firstLink = "#solution-a-foo-x-bar-hybrid";
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "",
        "===",
        "",
        applyTemplate(markdown.template, {
          link: firstLink,
        }),
      ].join("\n"),
    });
    const firstExpectedBadLink = applyTemplate(markdown.expectedLink, {
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
        applyTemplate(markdown.template, {
          link: secondLink,
        }),
      ].join("\n"),
    });
    const secondExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            missingLinks: [
              {
                link: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            missingLinks: [
              {
                link: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.linkType} which point at invalid headers in the current file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const firstLink = "#solution-a-foo-x-bar-hybrid";
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: [
        "Solution A: Foo x Bar Hybrid",
        "",
        "---",
        "",
        applyTemplate(markdown.template, {
          link: firstLink,
        }),
      ].join("\n"),
    });
    const firstExpectedBadLink = applyTemplate(markdown.expectedLink, {
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
        applyTemplate(markdown.template, {
          link: secondLink,
        }),
      ].join("\n"),
    });
    const secondExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            missingLinks: [
              {
                link: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            missingLinks: [
              {
                link: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Ignores local ${markdown.linkType} which point at headers in a different file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileA = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileA.fileName}#solution-a-foo-x-bar-hybrid`,
      }),
    });

    const fileB = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "=="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileB.fileName}#solution-b-foo-x-bar-hybrid`,
      }),
    });

    const fileC = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution C: Foo x Bar Hybrid", "==="].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileC.fileName}#solution-c-foo-x-bar-hybrid`,
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Ignores local ${markdown.linkType} which point at headers in a different file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileA = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "-"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileA.fileName}#solution-a-foo-x-bar-hybrid`,
      }),
    });

    const fileB = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "--"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileB.fileName}#solution-b-foo-x-bar-hybrid`,
      }),
    });

    const fileC = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution C: Foo x Bar Hybrid", "---"].join("\n"),
    });
    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: `./${fileC.fileName}#solution-c-foo-x-bar-hybrid`,
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.linkType} which point at invalid headers in a different file that use the equals syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const firstTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "", "===", ""].join("\n"),
    });
    const firstLink = `./${firstTargetFile.fileName}#solution-a-foo-x-bar-hybrid`;
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: firstLink,
      }),
    });
    const firstExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: firstLink,
    });

    const secondTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "", "===", ""].join("\n"),
    });
    const secondLink = `./${secondTargetFile.fileName}#solution-b-foo-x-bar-hybrid`;
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: secondLink,
      }),
    });
    const secondExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            missingLinks: [
              {
                link: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            missingLinks: [
              {
                link: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it(`Identifies local ${markdown.linkType} which point at invalid headers in a different file that use the dash syntax`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const firstTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution A: Foo x Bar Hybrid", "", "---", ""].join("\n"),
    });
    const firstLink = `./${firstTargetFile.fileName}#solution-a-foo-x-bar-hybrid`;
    const { filePath: firstFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: firstLink,
      }),
    });
    const firstExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: firstLink,
    });

    const secondTargetFile = newTestMarkdownFile({
      directory: testDirectory,
      content: ["Solution B: Foo x Bar Hybrid", "", "---", ""].join("\n"),
    });
    const secondLink = `./${secondTargetFile.fileName}#solution-b-foo-x-bar-hybrid`;
    const { filePath: secondFilePath } = newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: secondLink,
      }),
    });
    const secondExpectedBadLink = applyTemplate(markdown.expectedLink, {
      link: secondLink,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: firstFilePath,
            missingLinks: [
              {
                link: firstExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
          {
            filePath: secondFilePath,
            missingLinks: [
              {
                link: secondExpectedBadLink,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});