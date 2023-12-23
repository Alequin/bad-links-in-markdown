import {
  TOP_LEVEL_TEST_DIRECTORY,
  applyTemplate,
  inlineImageLinkTemplate,
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  referenceImageLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceImageLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons, validImageExtensions } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe.each([
  inlineImageLinkTemplate,
  referenceImageLinkTemplate,
  shorthandReferenceImageLinkTemplate,
])(
  "bad-links-in-markdown - local image links of type $linkType",
  (markdown) => {
    it(`Identifies a local ${markdown.linkType} that points at an image that does not exist`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "./path/to/missing/image.png";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, { link }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, { link });
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

    it(`Ignores local ${markdown.linkType} which point at an images which exist`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: `./${imageFile.fileName}`,
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

    it(`Ignores absolute local ${markdown.linkType} which point at files which exist`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: `/${imageFile.fileName}`,
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

    it(`Ignores absolute local ${markdown.linkType} which point at nested files that exist`, async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const nestedImageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
        content: "",
      });

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${nestedImageFile.fileName}`;
      newTestMarkdownFile({
        directory: innerDirectory2.path,
        content: applyTemplate(markdown.template, {
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

    it(`identifies absolute local ${markdown.linkType} which starts from outside the given directory`, async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const mockAbsoluteLink = `/${testDirectory.name}/test-image-9832982.jpg`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
        content: applyTemplate(markdown.template, { link: mockAbsoluteLink }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`identifies absolute local ${markdown.linkType} which starts from within the given directory`, async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const nestedImageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
        content: "",
      });

      const mockAbsoluteLink = `/${innerDirectory2.name}/${nestedImageFile.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory1.path,
        content: applyTemplate(markdown.template, { link: mockAbsoluteLink }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Identifies a local ${markdown.linkType} that points at a file that exist when the link does not contain a file extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-image-923of03";
      newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
        content: "",
      });

      const link = `./${name}`;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Identifies a local ${markdown.linkType} that points at a file that does not exist when the file path does not include either absolute or relative path`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "image.png";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Ignores local ${markdown.linkType} which point at files which exist when the file path does not include either absolute or relative path`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.template, {
          link: imageFile.fileName,
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

    it(`Identifies a local ${markdown.linkType} that points at a file that does not exist when the file path is missing and the extension is missing and does not include either absolute or relative path`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const link = "image";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.expectedLink, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Identifies local ${markdown.linkType} which point at files which exist when the file path is missing and extension is missing and does not include either absolute or relative path`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-file-name-89329840";
      newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
        content: "",
      });

      const link = name;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.expectedLink, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Identifies a local ${markdown.linkType} that is missing a file extension and could potentially refer to two separate files`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const name = "test-image-98230923";
      newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
        content: "",
      });

      newTestFile({
        directory: testDirectory,
        extension: ".png",
        name,
        content: "",
      });

      const link = name;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.expectedLink, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it(`Ignores local ${markdown.linkType} which point at files which exist, even when the name includes multiple delimiters`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name: "test.foo.bar",
        content: "",
      });

      newTestMarkdownFile({
        directory: testDirectory,
        content: applyTemplate(markdown.expectedLink, {
          link: `./${imageFile.fileName}`,
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

    it(`Identifies an issue with local ${markdown.linkType} when they are relative links which attempts to link through multiple parent directories at once with invalid syntax`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
        content: "",
      });

      const link = `.../${imageFile.fileName}`;
      const { filePath } = newTestMarkdownFile({
        directory: innerDirectory2.path, // markdown file two directories down from top level
        content: applyTemplate(markdown.expectedLink, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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

    it(`Ignores local ${markdown.linkType} when they are relative links which link through multiple parent directories`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
        content: "",
      });

      newTestMarkdownFile({
        directory: innerDirectory2.path, // markdown file two directories down from top level
        content: applyTemplate(markdown.expectedLink, {
          link: `../../${imageFile.fileName}`,
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

    it(`Identifies a local ${markdown.linkType} that points at an image that uses an invalid extension`, async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { fileName: imageFileName } = newTestFile({
        directory: testDirectory,
        extension: ".mp3",
        content: "",
      });

      const link = `./${imageFileName}`;
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory, // markdown file two directories down from top level
        content: applyTemplate(markdown.template, {
          link,
        }),
      });

      const expectedBadLink = applyTemplate(markdown.expectedLink, {
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
                  reasons: [badLinkReasons.INVALID_IMAGE_EXTENSIONS],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.each(validImageExtensions)(
      `Ignores a local ${markdown.linkType} that points at an existing image with an extension %s`,
      async (imageFileExtension) => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { fileName: imageFileName } = newTestFile({
          directory: testDirectory,
          extension: imageFileExtension,
          content: "",
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${imageFileName}`,
          }),
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

    it.each(validImageExtensions.map((extension) => extension.toUpperCase()))(
      "Ignores a local reference image link that points at an existing image with an extension %s, even when the casing is upper case",
      async (imageFileExtension) => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { fileName: imageFileName } = newTestFile({
          directory: testDirectory,
          extension: imageFileExtension,
          content: "",
        });

        newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.template, {
            link: `./${imageFileName}`,
          }),
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
  }
);
