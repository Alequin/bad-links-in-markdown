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

    it("Identifies an issue with local inline links for images when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(testDirectory, "./inner-test-1");
      fs.mkdirSync(firstInnerTestDirectory);

      const fileContainingLink = getPathToNewTestFile(`${testDirectory}/inner-test-1`);
      fs.writeFileSync(fileContainingLink, `[I am a local link](.../dog.jpg)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](.../dog.jpg)`,
                  reasons: [badLinkReasons.BAD_RELATIVE_LINK_SYNTAX, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(testDirectory, "./inner-test-1");
      fs.mkdirSync(firstInnerTestDirectory);

      const fileContainingLink = getPathToNewTestFile(`${testDirectory}/inner-test-1`);
      fs.writeFileSync(fileContainingLink, `[I am a local link](../../dog.jpg)`);

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

    it("Identifies an issue with local reference links for images when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(testDirectory, "./inner-test-1");
      fs.mkdirSync(firstInnerTestDirectory);

      const fileContainingLink = getPathToNewTestFile(`${testDirectory}/inner-test-1`);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: .../dog.jpg`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[picture]: .../dog.jpg`,
                  reasons: [badLinkReasons.BAD_RELATIVE_LINK_SYNTAX, badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(testDirectory, "./inner-test-1");
      fs.mkdirSync(firstInnerTestDirectory);

      const fileContainingLink = getPathToNewTestFile(`${testDirectory}/inner-test-1`);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ../../dog.jpg`
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
