import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - local file links", () => {
  describe("identify-invalid-local-links and the link is an inline link", () => {
    it("Identifies local inline links that point at files that do not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing/file.md)`
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

    it("Ignores local inline links which point at files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline links which point at files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline links which point at nested files that exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local inline links which starts from outside the given directory", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${testDirectory.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${mockAbsoluteLink})`,
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

    it("identifies absolute local inline links which starts from within the given directory", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](${mockAbsoluteLink})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${mockAbsoluteLink})`,
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

    it("Identifies a local inline link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `[I am a local link](./path/to/missing/file)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path/to/missing/file)",
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

    it("Identifies local inline links which point at files which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-without-extension";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links with a link which point at a directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${innerDirectory1.name})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `[I am a local link](file.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `[I am a local link](${fileToLinkTo.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `[I am a local link](file)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](file)`,
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

    it("Identifies local inline links which point at files that exist but link does not contain a file extension or either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-9823hf";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(filePath, `[I am a local link](${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](${name})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing/file.js)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path/to/missing/file.js)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at javascript files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that exists but the file extension is missing", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-oi3893";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline link that is missing a file extension and could potentially refer to two separate files", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-name-for-multiple-files";

      const markdownFile = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(markdownFile.filePath, `# foo bar baz`);

      const javascriptFile = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${name})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name})`,
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

    it("Ignores local inline links which point at files which exist, even when the name includes multiple delimiters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const extension = ".config.foobar.woohoo.md";
      const file = newTestFile({
        directory: testDirectory,
        extension: extension,
      });

      fs.writeFileSync(file.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${file.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at a file in another sub directory which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      const fileToLinkTo = newTestFile({
        directory: innerDirectory.path,
        extension: ".md",
        name: nameToLinkTo,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${innerDirectory.name}/${nameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${innerDirectory.name}/${nameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at a file in another parent directory which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const nameToLinkTo = "test-file-983n3no";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name: nameToLinkTo,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../${nameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](../${nameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local inline links when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](.../${fileToLinkTo.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](.../${fileToLinkTo.fileName})`,
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
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileToLinkTo.fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local inline link that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileName = "test-file-for-both-file-iu329";

      const markdownFile = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name: fileName,
      });
      fs.writeFileSync(markdownFile.filePath, `# foo bar baz`);

      const javascriptFile = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name: fileName,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](../../${fileName})`,
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

    it("Identifies a local inline link that is missing a file extension and could potentially refer to two separate files when the files are in a sub directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileName = "test-file-for-both-file-93oif3mio";

      const markdownFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
        name: fileName,
      });
      fs.writeFileSync(markdownFile.filePath, `# foo bar baz`);

      const javascriptFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".js",
        name: fileName,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${innerDirectory1.name}/${innerDirectory2.name}/${fileName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${innerDirectory1.name}/${innerDirectory2.name}/${fileName})`,
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

    it("Identifies multiple local inline links on the same file line that point at files that do not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });
      `![picture](./path/to/missing/image.png) and ![picture2](./path/to/missing/image.png)![picture3](./path/to/missing/image.png)(foobar)![picture4](./path/to/missing/image.png)`;

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing/file.md) and [I am another local link](./path/to/missing/file.md)[I am anotherx2 local link](./path/to/missing/file.md)(foobar)[I am anotherx3 local link](./path/to/missing/file.md)`
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
                {
                  link: "[I am another local link](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: "[I am anotherx2 local link](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: "[I am anotherx3 local link](./path/to/missing/file.md)",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links that point at files that do not exist when the link syntax is not valid", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing file.md)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an inline link which includes a header tag", () => {
    it("Identifies inline local links that point at a files that exists but do not contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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
        `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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
        `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted sub header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#next-chapter)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted sub header which contains varying characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#chapter-1-alliancesareformed)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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
        `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists, contains the targeted header but does not contain the specified instance", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#foo-bar-baz-3)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileToLinkTo.fileName}#foo-bar-baz-3)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the first header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#foo-bar-baz)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the second header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#foo-bar-baz-1)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point headers that appears multiple times in the current file and the link points at the first header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\n# foo bar baz\n\n[I am a local link](#foo-bar-baz)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point headers that appears multiple times in the current file and the link points at the second header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\n# foo bar baz\n\n[I am a local link](#foo-bar-baz-1)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that point at a file that exists but does not contain the targeted header tag, even when the file extension is not provided", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "file-name-j9823ufno";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
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
        `[I am a local link](./${name}#different-header)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name}#different-header)`,
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

    it("Identifies local inline links which point at files that exist and contain the targeted header but do not include a file extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-oi32iog";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
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
        `[I am a local link](./${name}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name}#main-title)`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at javascript files which exist and have a valid line number", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz\n`.repeat(1000));

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#L100)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local links which point at javascript files which exist but do not have a valid line number", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz\n`.repeat(10));

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileToLinkTo.fileName}#L100)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileToLinkTo.fileName}#L100)`,
                  reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a javascript file that exists but the file extension is missing, even if the line number is valid", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-oi234fnio";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${name}#L1)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${name}#L1)`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links when they are relative links which link through multiple parent directories", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# main-title\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });

      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileToLinkTo.fileName}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a header tag in the current file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[bad header](#main-title)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header](#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores an inline local link that points at a header tag in the current file that exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n[header](#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a sub header tag in the current file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(fileContainingLink, `[bad header](##main-title)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header](##main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

  describe("identify-invalid-local-links and the link is a reference link", () => {
    it("Identifies local reference links that point at files that do not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing/file.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: ./path/to/missing/file.md",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local reference links which point at files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local reference links which point at nested files that exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${innerDirectory1.name}/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory.path);
    });

    it("identifies absolute local reference links which starts from outside the given directory", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${testDirectory.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ${mockAbsoluteLink}`,
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

    it("identifies absolute local reference links which starts from within the given directory", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory.path,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const mockAbsoluteLink = `/${innerDirectory2.name}/${fileToLinkTo.fileName}`;

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${mockAbsoluteLink}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory.path)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ${mockAbsoluteLink}`,
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

    it("Identifies a local reference link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing/file`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: ./path/to/missing/file",
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

    it("Identifies local reference links which point at files which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file9i23ji3oim";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links with a link which point at a directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const directory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${directory.name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference links that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: file.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: file.md",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: file`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: file`,
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

    it("Identifies local reference links which point at files that exist but link does not contain a file extension or either absolute or relative path", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-i239foi";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: ${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing/file.js`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: ./path/to/missing/file.js",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at javascript files which exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that exists but the file extension is missing", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-i389j3omi";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that is missing a file extension and could potentially refer to two separate files", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "shared-file-name-j32inofmio";

      const markdownFile = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(markdownFile.filePath, `# foo bar baz`);

      const javascriptFile = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}`,
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

    it("Ignores local reference links which point at files which exist, even when the name includes multiple delimiters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".config.foobar.woohoo.md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at a file in another sub directory which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const directory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const name = "test-file-ojn3hf39";
      const fileToLinkTo = newTestFile({
        directory: directory.path,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${directory.name}/${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${directory.name}/${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at a file in another parent directory which exist but the link is missing an extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const directory = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const name = "test-file-98j2mj3";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: directory.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ../${name}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local reference links when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: .../${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: .../${fileToLinkTo.fileName}`,
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

    it("Ignores local reference links when they are relative links which link through multiple parent directories", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const name = "shared-file-name-oij3nofpwq";

      const markdownFile = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
      });
      fs.writeFileSync(markdownFile.filePath, `foo bar baz`);

      const javascriptFile = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ../../${name}`,
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

    it("Identifies a local reference link that is missing a file extension and could potentially refer to two separate files when the files are in a sub directory", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const name = "shared-file-name-sio3c90mc3jog";

      const markdownFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".md",
        name,
      });
      fs.writeFileSync(markdownFile.filePath, `foo bar baz`);

      const javascriptFile = newTestFile({
        directory: innerDirectory2.path,
        extension: ".js",
        name,
      });
      fs.writeFileSync(javascriptFile.filePath, `const foo = () => {}`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${innerDirectory1.name}/${innerDirectory2.name}/${name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${innerDirectory1.name}/${innerDirectory2.name}/${name}`,
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

    it("Does not error if some of the markdown is written is a similar way to a reference link", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `[1]: Reloading NGINX Plus - high performance web server.`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Does not error if some of the markdown is written is a similar way to a reference link and the text appears twice in the file", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `
        [1]: Reloading NGINX Plus - high performance web server.
        [1]: Reloading NGINX Plus - high performance web server.
        `
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies shorthand reference links that point at files that do not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({ directory: testDirectory });

      fs.writeFileSync(
        filePath,
        `Here is some text\n[1]\n\n[1]: ./path/to/missing/file.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: ./path/to/missing/file.md",
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores shorthand reference links which point at files that exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[1]\n\n[1]: ./${fileToLinkTo.fileName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it.each(["a", "1", "<", "/"])(
      "Ignores local reference links that point at files that do not exist when the link is preceded by %s",
      async (precedingText) => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });

        fs.writeFileSync(
          filePath,
          `Here is some text\n[and then a link to a file][1]\n\n${precedingText} [1]: ./path/to/missing/file.md`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      }
    );

    it.each([">", ">>", ">>>", ">> >>", "    "])(
      "Identifies local reference links that point at files that do not exist when the link is preceded only by '%s'",
      async (precedingText) => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_DIRECTORY,
        });

        const { filePath } = newTestMarkdownFile({ directory: testDirectory });

        fs.writeFileSync(
          filePath,
          `Here is some text\n[and then a link to a file][1]\n\n${precedingText} [1]: ./path/to/missing/file.md`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [
              {
                filePath,
                missingLinks: [
                  {
                    link: `${precedingText} [1]: ./path/to/missing/file.md`.trim(),
                    reasons: [badLinkReasons.FILE_NOT_FOUND],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      }
    );
  });

  describe("identify-invalid-local-links and the link is an reference link which includes a header tag", () => {
    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Ignores local reference links which point at files that exist and contain the targeted header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Identifies an absolute reference local link that points at a file that exist but does not contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Ignores absolute reference local links which point at files which exist and contain the targeted header tag", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Ignores local reference links which point at files that exist and contain the targeted sub header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#next-chapter`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted sub header which contains varying characters", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#chapter-1-alliancesareformed`
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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Identifies a local reference link that points at a file that exists, contains the targeted header but does not contain the specified instance", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#foo-bar-baz-3`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileToLinkTo.fileName}#foo-bar-baz-3`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the first header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#foo-bar-baz`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted header that appears multiple times and the link points at the second header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `# foo bar baz\n# foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#foo-bar-baz-1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point headers that appears multiple times in the current file and the link points at the first header", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
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

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`
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

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-o3fin3op";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
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
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}#different-header`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}#different-header`,
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

    it("Identifies local reference links which point at files that exist and contain the targeted header but are missing a file extension", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-v3h893c0p3";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".md",
        name,
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
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}#main-title`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at javascript files which exist and have a valid line number", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz\n`.repeat(1000));

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#L100`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at javascript files which exist but do not have a valid line number", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz\n`.repeat(10));

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#L100`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileToLinkTo.fileName}#L100`,
                  reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that exists but the file extension is missing, even if the line number is valid", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const name = "test-file-p3vu98nr3hu";
      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
        name,
      });
      fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${name}#L1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${name}#L1`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links when they are relative links which link through multiple parent directories", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory1 = await newTestDirectory({
        parentDirectory: testDirectory,
      });

      const innerDirectory2 = await newTestDirectory({
        parentDirectory: innerDirectory1.path,
      });

      const fileToLinkTo = newTestFile({
        directory: testDirectory,
        extension: ".js",
      });
      fs.writeFileSync(
        fileToLinkTo.filePath,
        `# main-title\na story of foo and bar\nand baz`
      );

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: innerDirectory2.path,
      });

      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${fileToLinkTo.fileName}#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a header tag in the current file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[foobar][bad header]\n[bad header]: #main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header]: #main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores a local reference link that points at a header tag in the current file that exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n[foobar][good header]\n[good header]: #main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a sub header tag in the current file that does not exist", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const { filePath: fileContainingLink } = newTestMarkdownFile({
        directory: testDirectory,
      });
      fs.writeFileSync(
        fileContainingLink,
        `[foobar][bad header]\n[bad header]: ##main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header]: ##main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
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
