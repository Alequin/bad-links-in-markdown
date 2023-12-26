import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe("bad-links-in-markdown - local file links", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("General scenarios - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.name} that point at a file that does not exist`, async () => {
      const link = "./path/to/missing/file.md";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.name} which points at a file that exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: `./${fileToLinkTo.fileName}`,
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

    it(`Ignores an absolute local ${markdown.name} which point at a file that exists`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      const mockAbsoluteLink = `/${fileToLinkTo.fileName}`;

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: mockAbsoluteLink,
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

    it(`Ignores absolute local ${markdown.name} which point at nested files that exist`, async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: `foo bar baz`,
      });

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.fullTemplate, {
          link: mockAbsoluteLink,
        }),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory.path })
        ).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory.path);
    });

    it(`Identifies an absolute local ${markdown.name} which starts from outside the given directory`, async () => {
      const link = "./path/to/missing/file.md";

      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory.path,
        content: `foo bar baz`,
      });

      const mockAbsoluteLink = `/${testDirectory.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
        content: applyTemplate(markdown.fullTemplate, {
          link: mockAbsoluteLink,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link: mockAbsoluteLink,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory.path })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it(`Identifies an absolute local ${markdown.name} which starts from within the given directory`, async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: `foo bar baz`,
      });

      const mockAbsoluteLink = `/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
        content: applyTemplate(markdown.fullTemplate, {
          link: mockAbsoluteLink,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link: mockAbsoluteLink,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory.path })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it(`Identifies a local ${markdown.name} that points at a file that does not exist even when the link does not contain a file extension`, async () => {
      const link = "./path/to/missing/file";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
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

    it(`Ignores a local ${markdown.name} with a link which point at a directory`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: `./${innerDirectory1.name}`,
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

    it(`Identifies a local ${markdown.name} that points at a file that does not exist when the file path does not include either absolute or relative path`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";
      const link = "file.md";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores local ${markdown.name} which point at files which exist when the file path does not include either absolute or relative path`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: fileToLinkTo.fileName,
          linkText: "I am an inline link",
          displayText: "I am displayText",
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

    it(`Identifies a local ${markdown.name} that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";
      const link = "file";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
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

    it(`Identifies a local ${markdown.name} that points at a javascript file that does not exist`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";
      const link = "./path/to/missing/file.js";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.name} which points at javascript file that exist`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        content: `const foobar = () => {}`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: `./${fileToLinkTo.fileName}`,
          linkText: "I am an inline link",
          displayText: "I am displayText",
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

    it(`Ignores a local ${markdown.name} which points at a file that exist, even when the name includes multiple delimiters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const extension = ".config.foobar.woohoo.md";
      const file = newTestFile({
        directory: testDirectory,
        extension: extension,
        content: `foo bar baz`,
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: `./${file.fileName}`,
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

    it(`Identifies an issue with a local ${markdown.name} when it uses a relative links which attempts to link through multiple parent directories at once with invalid syntax`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      const link = `.../${fileToLinkTo.fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.BAD_RELATIVE_LINK_SYNTAX,
                    badLinkReasons.FILE_NOT_FOUND,
                  ].sort(),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores a local ${markdown.name} when it uses a relative links which links through multiple parent directories`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestMarkdownFile({
        directory: testDirectory,
        content: `foo bar baz`,
      });

      const link = `../../${fileToLinkTo.fileName}`;
      newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
  ])("Missing file extensions - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.name} which points at a files which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-without-extension";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `foo bar baz`,
      });

      const link = `./${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies local ${markdown.name} which point at files that exist but link does not contain a file extension or either absolute or relative path`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-9823hf";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `foo bar baz`,
      });

      const link = name;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that points at a javascript file that exists but the file extension is missing`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-without-extension";
      newTestFile({
        directory: testDirectory,
        name,
        extension: ".js",
        content: `const foobar = () => {}`,
      });

      const link = `./${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-name-for-multiple-files";

      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
        content: `const foo = () => {}`,
      });

      const link = name;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies local ${markdown.name} which point at a file in another sub directory which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      newTestMarkdownFile({
        directory: innerDirectory.path,
        name: nameToLinkTo,
        content: `foo bar baz`,
      });

      const link = `./${innerDirectory.name}/${nameToLinkTo}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies local ${markdown.name} which point at a file in another parent directory which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      newTestMarkdownFile({
        directory: testDirectory,
        name: nameToLinkTo,
        content: `foo bar baz`,
      });

      const link = `../${nameToLinkTo}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory.path,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const name = "test-file-for-both-file-iu329";

      newTestMarkdownFile({
        directory: testDirectory,
        name: name,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name: name,
        content: `const foo = () => {}`,
      });

      const link = `../../${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files when the files are in a sub directory`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileName = "test-file-for-both-file-93oif3mio";

      newTestMarkdownFile({
        directory: innerDirectory2.path,
        name: fileName,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: innerDirectory2.path,
        extension: ".js",
        name: fileName,
        content: `const foo = () => {}`,
      });

      const link = `./${innerDirectory1.name}/${innerDirectory2.name}/${fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe.each([
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    anchorLinkUnquotesTemplate,
  ])("Missing file extensions - $linkType", (markdown) => {
    it(`Identifies a local ${markdown.name} which points at a files which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-without-extension";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `foo bar baz`,
      });

      const link = `./${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies local ${markdown.name} which point at files that exist but link does not contain a file extension or either absolute or relative path`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-9823hf";
      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `foo bar baz`,
      });

      const link = name;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
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
                  markdownLink: expectedBadLink,
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

    it(`Identifies a local ${markdown.name} that points at a javascript file that exists but the file extension is missing`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-without-extension";
      newTestFile({
        directory: testDirectory,
        name,
        extension: ".js",
        content: `const foobar = () => {}`,
      });

      const link = `./${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files`, async () => {
      const displayText = "I am displayText";
      const linkText = "I am an inline link";

      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-name-for-multiple-files";

      newTestMarkdownFile({
        directory: testDirectory,
        name,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
        content: `const foo = () => {}`,
      });

      const link = name;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies local ${markdown.name} which point at a file in another sub directory which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      newTestMarkdownFile({
        directory: innerDirectory.path,
        name: nameToLinkTo,
        content: `foo bar baz`,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, {
          link: `./${innerDirectory.name}/${nameToLinkTo}`,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link: `./${innerDirectory.name}/${nameToLinkTo}`,
      });

      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies local ${markdown.name} which point at a file in another parent directory which exist but the link is missing an extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      newTestMarkdownFile({
        directory: testDirectory,
        name: nameToLinkTo,
        content: `foo bar baz`,
      });

      const link = `../${nameToLinkTo}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory.path,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const name = "test-file-for-both-file-iu329";

      newTestMarkdownFile({
        directory: testDirectory,
        name: name,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: testDirectory,
        extension: ".js",
        name: name,
        content: `const foo = () => {}`,
      });

      const link = `../../${name}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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

    it(`Identifies a local ${markdown.name} that is missing a file extension and could potentially refer to two separate files when the files are in a sub directory`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileName = "test-file-for-both-file-93oif3mio";

      newTestMarkdownFile({
        directory: innerDirectory2.path,
        name: fileName,
        content: `# foo bar baz`,
      });

      newTestFile({
        directory: innerDirectory2.path,
        extension: ".js",
        name: fileName,
        content: `const foo = () => {}`,
      });

      const link = `./${innerDirectory1.name}/${innerDirectory2.name}/${fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.fullTemplate, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
        link,
      });
      await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
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
  });
});
