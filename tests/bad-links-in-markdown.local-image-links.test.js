import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import { validImageExtensions } from "../src/config/valid-image-extensions";
import {
  newTestDirectory,
  newTestDirectoryWithName,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - local image links", () => {
  describe("identify-invalid-local-links and the image link is an inline link", () => {
    it("Identifies a local inline image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `![picture](./path/to/missing/image.png)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](./path/to/missing/image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline image link which point at an images which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](./${imageFile.fileName})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline image links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![I am a local link](/${imageFile.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline image links which point at nested files that exist", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const nestedImageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
      });
      fs.writeFileSync(nestedImageFile.filePath, "");

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${nestedImageFile.fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local inline image links which starts from outside the given directory", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const mockAbsoluteLink = `/${testDirectory.name}/test-image-9832982.jpg`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `![I am a local link](${mockAbsoluteLink})`,
                  reasons: [
                    badLinkReasons.INVALID_ABSOLUTE_LINK,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local inline image links which starts from within the given directory", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const nestedImageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
      });
      fs.writeFileSync(nestedImageFile.filePath, "");

      const mockAbsoluteLink = `/${innerDirectory2.name}/${nestedImageFile.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory1.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `![I am a local link](${mockAbsoluteLink})`,
                  reasons: [
                    badLinkReasons.INVALID_ABSOLUTE_LINK,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it("Identifies a local inline image link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `![picture](./path/to/missing/image)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](./path/to/missing/image)",
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

    it("Identifies a local inline image link that points at a file that exist when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-image-923of03";
      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](./${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](./${name})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `![picture](image.png)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline image links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](${imageFile.fileName})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that does not exist when the file path is missing and the extension is missing and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `![picture](image)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](image)",
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

    it("Identifies local inline image links which point at files which exist when the file path is missing and extension is missing and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-name-89329840";
      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](${name})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-image-98230923";
      const imageFile1 = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile1.filePath, "");

      const imageFile2 = newTestFile({
        directory: testDirectory,
        extension: ".png",
        name,
      });
      fs.writeFileSync(imageFile2.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](./${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](./${name})`,
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

    it("Ignores local inline image links which point at files which exist, even when the name includes multiple delimiters", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test.foo.bar.jpg";
      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(filePath, `![picture](./${name}.jpg)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local inline links for images when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      // markdown file two directories down from top level
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](.../${imageFile.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](.../${imageFile.fileName})`,
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

    it("Ignores local inline links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      // markdown file two directories down from top level
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${imageFile.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies multiple local inline image links on the same file line that point at images that do not exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `![picture](./path/to/missing/image.png) and ![picture2](./path/to/missing/image.png)![picture3](./path/to/missing/image.png)(foobar)![picture4](./path/to/missing/image.png)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](./path/to/missing/image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: "![picture2](./path/to/missing/image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: "![picture3](./path/to/missing/image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: "![picture4](./path/to/missing/image.png)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.each(validImageExtensions)(
      "Ignores a local inline image link that points at an existing image with an extension %s",
      async (imageFileExtension) => {
        const testDirectory = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { fileName: imageFileName, filePath: imageFilePath } =
          newTestFile({
            directory: testDirectory,
            extension: imageFileExtension,
          });
        fs.writeFileSync(imageFilePath, "");

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });
        fs.writeFileSync(filePath, `![picture](./${imageFileName})`);

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );

    it.each(validImageExtensions.map((extension) => extension.toUpperCase()))(
      "Ignores a local reference image link that points at an existing image with an extension %s, even when the casing is upper case",
      async (imageFileExtension) => {
        const testDirectory = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const imageFile = newTestFile({
          directory: testDirectory,
          extension: imageFileExtension,
        });
        fs.writeFileSync(imageFile.filePath, "");

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });
        fs.writeFileSync(filePath, `![picture](./${imageFile.fileName})`);

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );

    it("Identifies a local inline image link that points at an image that uses an invalid extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { fileName: imageFileName, filePath: imageFilePath } = newTestFile({
        directory: testDirectory,
        extension: ".mp3",
      });
      fs.writeFileSync(imageFilePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `![picture](./${imageFileName})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](./${imageFileName})`,
                  reasons: [badLinkReasons.INVALID_IMAGE_EXTENSIONS],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the image link is a reference link", () => {
    it("Identifies local reference image links that point at images that do not exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./path/to/missing/image.png`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: ./path/to/missing/image.png",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference image links which points at images which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline image links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![and then a link to a file][picture]\n\n[picture]: /${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline image links which point at nested files that exist", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${imageFile.fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![and then a link to a file][picture]\n\n[picture]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local inline image links which starts from outside the given directory", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const mockAbsoluteLink = `/${testDirectory.name}/test-image-uhf392.jpg`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![and then a link to a file][picture]\n\n[picture]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[picture]: ${mockAbsoluteLink}`,
                  reasons: [
                    badLinkReasons.INVALID_ABSOLUTE_LINK,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local inline image links which starts from within the given directory", async () => {
      const testDirectory = await newTestDirectoryWithName({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const mockAbsoluteLink = `/${innerDirectory2.name}/${imageFile.fileName}`;
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory1.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `![and then a link to a file][picture]\n\n[picture]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[picture]: ${mockAbsoluteLink}`,
                  reasons: [
                    badLinkReasons.INVALID_ABSOLUTE_LINK,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory.path);
    });

    it("Identifies a local reference image link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./path/to/missing/image`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: ./path/to/missing/image",
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

    it("Identifies a local reference image link that points at a file that exist when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-image-923of03";
      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: ./${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: image.png`
      );
      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: image.png",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference image links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that does not exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: image`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: image",
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

    it("Identifies local reference image links which point at files which exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-image-i330f3no3";
      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: ${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-image-89f398h3";
      const imageFile1 = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name,
      });
      fs.writeFileSync(imageFile1.filePath, "");

      const imageFile2 = newTestFile({
        directory: testDirectory,
        extension: ".png",
        name,
      });
      fs.writeFileSync(imageFile2.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: ${name}`,
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

    it("Ignores local reference image links which point at files which exist, even when the name includes multiple delimiters", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const imageFile = newTestFile({
        directory: testDirectory,
        extension: ".jpg",
        name: "test.foo.bar",
      });
      fs.writeFileSync(imageFile.filePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local reference image links for images when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      // markdown file two directories down from top level
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: .../${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[picture]: .../${imageFile.fileName}`,
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

    it("Ignores local reference image links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectoryWithName({
        parentDirectory: innerDirectory1.path,
      });

      const imageFile = newTestFile({
        directory: testDirectory, // image file in top level directory
        extension: ".jpg",
      });
      fs.writeFileSync(imageFile.filePath, "");

      // markdown file two directories down from top level
      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ../../${imageFile.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it.each(validImageExtensions)(
      "Ignores a local reference image link that points at an existing image with an extension %s",
      async (imageFileExtension) => {
        const testDirectory = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { fileName: imageFileName, filePath: imageFilePath } =
          newTestFile({
            directory: testDirectory,
            extension: imageFileExtension,
          });
        fs.writeFileSync(imageFilePath, "");

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });
        fs.writeFileSync(
          filePath,
          `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ${imageFileName}`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );

    it.each(validImageExtensions.map((extension) => extension.toUpperCase()))(
      "Ignores a local reference image link that points at an existing image with an extension %s, even when the casing is upper case",
      async (imageFileExtension) => {
        const testDirectory = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { fileName: imageFileName, filePath: imageFilePath } =
          newTestFile({
            directory: testDirectory,
            extension: imageFileExtension,
          });
        fs.writeFileSync(imageFilePath, "");

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });

        fs.writeFileSync(
          filePath,
          `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./${imageFileName}`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );

    it("Identifies a local inline image link that points at an image that uses an invalid extension", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { fileName: imageFileName, filePath: imageFilePath } = newTestFile({
        directory: testDirectory,
        extension: ".mp3",
      });
      fs.writeFileSync(imageFilePath, "");

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n\n[picture]: ./${imageFileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: ./${imageFileName}`,
                  reasons: [badLinkReasons.INVALID_IMAGE_EXTENSIONS],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
