import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  applyTemplate,
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - local header file links", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
  ])(
    "General scenarios - $linkType pointing headers in external files",
    (markdown) => {
      it(`Identifies a local ${markdown.linkType} that points at a file that exists but do not contain the targeted header tag`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file that exists and contain the targeted header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${fileToLinkTo.fileName}#main-title`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file that exists and contain the targeted sub header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${fileToLinkTo.fileName}#next-chapter`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies an absolute local ${markdown.linkType} that points at a file that exist but does not contain the targeted header tag`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file that exist and contain the targeted sub header that contains varying characters`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`,
        });

        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${fileToLinkTo.fileName}#chapter-1-alliancesareformed`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.linkType} that points at a file that exists, contains the targeted header but does not contain the specified instance`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        const link = `./${fileToLinkTo.fileName}#foo-bar-baz-3`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file that exist and contains the targeted header that appears multiple times and the link points at the first header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${fileToLinkTo.fileName}#foo-bar-baz`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} which points at a file that exist and contains the targeted header that appears multiple times and the link points at the second header`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# foo bar baz\n# foo bar baz`,
        });

        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${fileToLinkTo.fileName}#foo-bar-baz-1`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.linkType} that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`,
        });

        const link = `./${fileToLinkTo.fileName}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} when they are relative links which link through multiple parent directories`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const innerDirectory1 = await newTestDirectory({
          parentDirectory: testDirectory,
        });

        const innerDirectory2 = await newTestDirectory({
          parentDirectory: innerDirectory1.path,
        });

        const fileToLinkTo = newTestMarkdownFile({
          directory: testDirectory,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        newTestMarkdownFile({
          directory: innerDirectory2.path,
          content: applyTemplate(markdown.template, {
            link: `../../${fileToLinkTo.fileName}#main-title`,
          }),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
  ])(
    "General scenarios - $linkType pointing at headers in the current file",
    (markdown) => {
      it(`Identifies a local ${markdown.linkType} that points at a header tag in the current file that does not exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = "#main-title";
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Ignores a local ${markdown.linkType} that points at a header tag in the current file that exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "# Main Title",
            applyTemplate(markdown.template, { link: "#main-title" }),
          ].join("\n"),
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.linkType} that attempts to point at a sub header tag by using multiple hash tags in the link`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const link = "##main-title";
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: [
            "## Main Title",
            applyTemplate(markdown.template, { link }),
          ].join("\n"),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, {
          link,
        });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
  ])("Missing file extensions - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.linkType} that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#different-header`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.linkType} that points at a file that exists and contains the targeted header tag, even when the file extension is not provided`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# main-title\na story of foo and bar\nand baz`,
      });

      const link = `./${name}#main-title`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.linkType} that points at a javascript file that exists but the file extension is missing, even if the line number is valid`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-oi234fnio";
      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
        content: "const foobar = () => {}",
      });

      const link = `./${name}#L1`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe.each([anchorLinkSingleQuoteTemplate, anchorLinkDoubleQuoteTemplate])(
    "Missing file extensions - $linkType",
    (markdown) => {
      it(`Identifies a local ${markdown.linkType} that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const name = "file-name-j9823ufno";
        newTestMarkdownFile({
          directory: testDirectory,
          name,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        const link = `./${name}#different-header`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [
                      badLinkReasons.MISSING_FILE_EXTENSION,
                      badLinkReasons.FILE_NOT_FOUND,
                    ],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.linkType} that points at a file that exists and contains the targeted header tag, even when the file extension is not provided`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const name = "file-name-j9823ufno";
        newTestMarkdownFile({
          directory: testDirectory,
          name,
          content: `# main-title\na story of foo and bar\nand baz`,
        });

        const link = `./${name}#main-title`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link,
          }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [
                      badLinkReasons.MISSING_FILE_EXTENSION,
                      badLinkReasons.FILE_NOT_FOUND,
                    ],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it(`Identifies a local ${markdown.linkType} that points at a javascript file that exists but the file extension is missing, even if the line number is valid`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const name = "test-file-oi234fnio";
        newTestFile({
          directory: testDirectory,
          extension: ".js",
          name,
          content: "const foobar = () => {}",
        });

        const link = `./${name}#L1`;
        const { filePath: fileContainingLink } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, { link }),
        });

        const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath: fileContainingLink,
                missingLinks: [
                  {
                    link: expectedBadLink,
                    reasons: [
                      badLinkReasons.MISSING_FILE_EXTENSION,
                      badLinkReasons.FILE_NOT_FOUND,
                    ],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });
    }
  );

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
  ])("General scenarios - line numbers $linkType", (markdown) => {
    it(`Ignores a local ${markdown.linkType} which points at a javascript file that exists and have a valid line number`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        content: `const foobar = () => {}\n`.repeat(1000),
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: `./${fileToLinkTo.fileName}#L100}`,
        }),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.linkType} which points at a javascript file that exists but does not have a valid line number`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        content: `const foobar = () => {}\n`.repeat(10),
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: `./${fileToLinkTo.fileName}#L100}`,
        }),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an inline link which includes a header tag", () => {
    it("Ignores an inline local link that points at a sub header tag in the current file that exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n## Sub Header\n[header](##sub-header)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header, even when the header includes non alpha-numeric characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# Foo Bar -> Bacon and eggs\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#foo-bar---bacon-and-eggs)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores an inline local link that points at a header tag in the current file that exist and include non alpha-numeric characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Foo Bar -> Bacon and eggs\n\n- [Foo Bar -> Bacon and eggs](#foo-bar---bacon-and-eggs)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header and the header is snake-case", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# main_title\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#maintitle)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at headers in the current file which are in snake-case", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# main_title\na story of foo and bar\nand baz\n[I am a local link](./${fileToLinkTo.fileName}#maintitle)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at headers in the current file which consist of multiple text cases", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `### The cat-tails cat_status_award metric\na story of foo and bar\nand baz\n[The cat-tails cat_status_award metric](#the-cat-tails-catstatusaward-metric)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an reference link which includes a header tag", () => {
    it("Ignores absolute reference local links which point at files which exist and contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# main-title\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileToLinkTo.fileName}#main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point headers that appears multiple times in the current file and the link points at the first header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\n# foo bar baz\n\n[header link][1]\n\n[1]: #foo-bar-baz`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point headers that appears multiple times in the current file and the link points at the second header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\n# foo bar baz\n\n[header link][1]\n\n[1]: #foo-bar-baz-1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores a local reference link that points at a sub header tag in the current file that exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n# Sub Header\n[foobar][good header]\n[good header]: ##sub-header`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted header, even when the header includes non alpha-numeric characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# Foo Bar -> Bacon and eggs\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[Foo Bar -> Bacon and eggs][1]\n\n[1]: ./${fileToLinkTo.fileName}#foo-bar---bacon-and-eggs`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores an local reference links that point at header tags in the current file that exist and include non alpha-numeric characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Foo Bar -> Bacon and eggs\n\n- [Foo Bar -> Bacon and eggs][1]\n\n[1]: #foo-bar---bacon-and-eggs`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });
});
