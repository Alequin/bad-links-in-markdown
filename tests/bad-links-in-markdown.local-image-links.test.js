import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import { getPathToNewTestFile, newTestDirectory, runTestWithDirectoryCleanup } from "./test-utils";
import path from "path";

describe("bad-links-in-markdown - local image links", () => {
  describe("identify-invalid-local-links and the image link is an inline link", () => {
    it("Identifies a local inline image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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

    it("Ignores an local inline image link which points at an image which exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](../dog.jpg)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local inline image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/image.png");
      fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](/${absolutePath})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local inline image link which point at images which exist as images cannot use absolute links", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](/${absolutePath})`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](./path/to/missing/image)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](./path/to/missing/image)",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that exist when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](../dog)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](../dog)",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](image.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](image.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline image links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );

      fs.writeFileSync(filePath, `![picture](dog.jpg)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at a file that does not exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](image)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](image)",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline image links which point at files which exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );

      fs.writeFileSync(filePath, `![picture](dog)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](dog)",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.png")
      );

      fs.writeFileSync(filePath, `![picture](./dog)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "![picture](./dog)",
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
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.foo.bar.jpg")
      );

      fs.writeFileSync(filePath, `![picture](./dog.foo.bar.jpg)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it.todo("can identify multiple possible files in a sub directory");
  });

  describe("identify-invalid-local-links and the image link is a reference link", () => {
    it("Identifies a local reference image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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

    it("Ignores an local reference image link which points at an image which exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ../dog.jpg`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local reference image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/image.png");
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local reference image link as invalid as images cannot use absolute links", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local reference image as invalid even when the reference is uses as both an image and a file link", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][picture]\n![and then a link to a image][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that exist when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ../dog`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: ../dog",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: dog.jpg`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that points at a file that does not exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference image links which point at files which exist when the file path is missing and extension and does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: dog`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: dog",
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference image link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.jpg")
      );
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.png")
      );

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: dog`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[picture]: dog",
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
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);
      fs.copyFileSync(
        path.resolve(testDirectory, "../dog.jpg"),
        path.resolve(testDirectory, "./dog.foo.bar.jpg")
      );

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./dog.foo.bar.jpg`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it.todo("can identify multiple possible files in a sub directory");
  });
});
