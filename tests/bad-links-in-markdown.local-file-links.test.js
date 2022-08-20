import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestMarkdownFile,
  newTestDirectory,
  newTestDirectoryWithName,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

describe("bad-links-in-markdown - local file links", () => {
  describe("identify-invalid-local-links and the link is an inline link", () => {
    it("Identifies local inline links that point at files that do not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectoryWithName();

      const firstNestedDirName = "test-dir-1";
      const firstNestedDirPath = path.resolve(
        testDirectory.path,
        `./${firstNestedDirName}`
      );
      fs.mkdirSync(firstNestedDirPath);

      const secondNestedDirName = "test-dir-2";
      const secondNestedDirPath = path.resolve(
        firstNestedDirPath,
        `./${secondNestedDirName}`
      );
      fs.mkdirSync(secondNestedDirPath);

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        secondNestedDirPath,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${firstNestedDirName}/${secondNestedDirName}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(secondNestedDirPath);
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
      const testDirectory = await newTestDirectoryWithName();

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        testDirectory.path,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${testDirectory.name}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory.path);
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
      const testDirectory = await newTestDirectoryWithName();

      const firstNestedDirName = "test-dir-1";
      const firstNestedDirPath = path.resolve(
        testDirectory.path,
        `./${firstNestedDirName}`
      );
      fs.mkdirSync(firstNestedDirPath);

      const secondNestedDirName = "test-dir-2";
      const secondNestedDirPath = path.resolve(
        firstNestedDirPath,
        `./${secondNestedDirName}`
      );
      fs.mkdirSync(secondNestedDirPath);

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        secondNestedDirPath,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${secondNestedDirName}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory.path);
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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links with a link which point at a directory", async () => {
      const testDirectory = await newTestDirectory();

      const directoryToLinkTo = path.resolve(testDirectory, `./inner-dir`);
      fs.mkdirSync(directoryToLinkTo);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./inner-dir)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo}.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](${fileNameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.js)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that exists but the file extension is missing", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local inline link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.config.foobar.woohoo.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.config.foobar.woohoo.md)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at a file in another sub directory which exist but the link is missing an extension", async () => {
      const testDirectory = await newTestDirectory();
      const innerTestDirectory = path.resolve(testDirectory, "./inner-test");
      fs.mkdirSync(innerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./inner-test/${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./inner-test/${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./inner-test/${fileNameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at a file in another parent directory which exist but the link is missing an extension", async () => {
      const testDirectory = await newTestDirectory();
      const innerTestDirectory = path.resolve(testDirectory, "./inner-test");
      fs.mkdirSync(innerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test`
      );
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](../${fileNameToLinkTo})`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local inline links when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](.../${fileNameToLinkTo}.md)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](.../${fileNameToLinkTo}.md)`,
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
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileNameToLinkTo}.md)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local inline link that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](../../${fileNameToLinkTo})`,
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
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        secondInnerTestDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        secondInnerTestDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./inner-test-1/inner-test-2/${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./inner-test-1/inner-test-2/${fileNameToLinkTo})`,
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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.md#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted sub header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#next-chapter)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted sub header which contains varying characters", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#chapter-1-alliancesareformed)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.md#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists, contains the targeted header but does not contain the specified instance", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#foo-bar-baz-3)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.md#foo-bar-baz-3)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the first header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#foo-bar-baz)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the second header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#foo-bar-baz-1)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point headers that appears multiple times in the current file and the link points at the first header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\n# foo bar baz\n\n[I am a local link](#foo-bar-baz)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point headers that appears multiple times in the current file and the link points at the second header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\n# foo bar baz\n\n[I am a local link](#foo-bar-baz-1)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.md#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that point at a file that exists but does not contain the targeted header tag, even when the file extension is not provided", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}#different-header)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}#different-header)`,
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}#main-title)`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at javascript files which exist and have a valid line number", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(1000));

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.js#L100)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local links which point at javascript files which exist but do not have a valid line number", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(10));

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.js#L100)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.js#L100)`,
                  reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a javascript file that exists but the file extension is missing, even if the line number is valid", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}#L1)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}#L1)`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );

      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](../../${fileNameToLinkTo}.md#main-title)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a header tag in the current file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# Foo Bar -> Bacon and eggs\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#foo-bar---bacon-and-eggs)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores an inline local link that points at a header tag in the current file that exist and include non alpha-numeric characters", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main_title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#maintitle)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at headers in the current file which are in snake-case", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main_title\na story of foo and bar\nand baz\n[I am a local link](./${fileNameToLinkTo}.md#maintitle)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at headers in the current file which consist of multiple text cases", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );

      fs.writeFileSync(
        filePathToLinkTo,
        `### The cat-tails cat_status_award metric\na story of foo and bar\nand baz\n[The cat-tails cat_status_award metric](#the-cat-tails-catstatusaward-metric)`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "[Solution B](#solution-b-foo-x-bar-hybrid)",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "[Solution B](#solution-b-foo-x-bar-hybrid)",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "===",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[Solution A](#solution-a-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[Solution C](#solution-c-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "---",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[Solution A](#solution-a-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[Solution C](#solution-c-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is a reference link", () => {
    it("Identifies reference links that point at files that do not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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

    it("Ignores reference links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores absolute local reference links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectoryWithName();

      const firstNestedDirName = "test-dir-1";
      const firstNestedDirPath = path.resolve(
        testDirectory.path,
        `./${firstNestedDirName}`
      );
      fs.mkdirSync(firstNestedDirPath);

      const secondNestedDirName = "test-dir-2";
      const secondNestedDirPath = path.resolve(
        firstNestedDirPath,
        `./${secondNestedDirName}`
      );
      fs.mkdirSync(secondNestedDirPath);

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        secondNestedDirPath,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${firstNestedDirName}/${secondNestedDirName}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory.path);
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
      const testDirectory = await newTestDirectoryWithName();

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        testDirectory.path,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${testDirectory.name}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory.path);
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
      const testDirectory = await newTestDirectoryWithName();

      const firstNestedDirName = "test-dir-1";
      const firstNestedDirPath = path.resolve(
        testDirectory.path,
        `./${firstNestedDirName}`
      );
      fs.mkdirSync(firstNestedDirPath);

      const secondNestedDirName = "test-dir-2";
      const secondNestedDirPath = path.resolve(
        firstNestedDirPath,
        `./${secondNestedDirName}`
      );
      fs.mkdirSync(secondNestedDirPath);

      const fileNameToLinkTo = `${uniqueName()}.md`;
      const filePathToLinkTo = path.resolve(
        secondNestedDirPath,
        `./${fileNameToLinkTo}`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const mockAbsoluteLink = `/${secondNestedDirName}/${fileNameToLinkTo}`;

      const fileContainingLink = newTestMarkdownFile(testDirectory.path);
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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links with a link which point at a directory", async () => {
      const testDirectory = await newTestDirectory();

      const directoryToLinkTo = path.resolve(testDirectory, `./inner-dir`);
      fs.mkdirSync(directoryToLinkTo);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./inner-dir`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference links that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${fileNameToLinkTo}.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: ${fileNameToLinkTo}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.js`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that exists but the file extension is missing", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}`,
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.config.foobar.woohoo.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.config.foobar.woohoo.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at a file in another sub directory which exist but the link is missing an extension", async () => {
      const testDirectory = await newTestDirectory();
      const innerTestDirectory = path.resolve(testDirectory, "./inner-test");
      fs.mkdirSync(innerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./inner-test/${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./inner-test/${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./inner-test/${fileNameToLinkTo}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at a file in another parent directory which exist but the link is missing an extension", async () => {
      const testDirectory = await newTestDirectory();
      const innerTestDirectory = path.resolve(testDirectory, "./inner-test");
      fs.mkdirSync(innerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test`
      );
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ../${fileNameToLinkTo}`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies an issue with local reference links when they are relative links which attempts to link through multiple parent directories at once with invalid syntax", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: .../${fileNameToLinkTo}.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: .../${fileNameToLinkTo}.md`,
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
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${fileNameToLinkTo}.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that is missing a file extension and could potentially refer to two separate files when the files are in a parent directory", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ../../${fileNameToLinkTo}`,
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
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(
        secondInnerTestDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(
        secondInnerTestDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./inner-test-1/inner-test-2/${fileNameToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./inner-test-1/inner-test-2/${fileNameToLinkTo}`,
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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[1]\n\n[1]: ./${fileNameToLinkTo}.md`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an reference link which includes a header tag", () => {
    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an absolute reference local link that points at a file that exist but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores absolute reference local links which point at files which exist and contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted sub header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#next-chapter`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted sub header which contains varying characters", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#chapter-1-alliancesareformed`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that exists, contains the targeted header but does not contain the specified instance", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#foo-bar-baz-3`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#foo-bar-baz-3`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times and the link points at the first header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#foo-bar-baz`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted header that appears multiple times and the link points at the second header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#foo-bar-baz-1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point headers that appears multiple times in the current file and the link points at the first header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\n# foo bar baz\n\n[header link][1]\n\n[1]: #foo-bar-baz`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point headers that appears multiple times in the current file and the link points at the second header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\n# foo bar baz\n\n[header link][1]\n\n[1]: #foo-bar-baz-1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#main-title`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that exists but does not contain the targeted header tag, even when the file extension is not provided", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}#different-header`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}#different-header`,
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}#main-title`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at javascript files which exist and have a valid line number", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(1000));

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.js#L100`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at javascript files which exist but do not have a valid line number", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(10));

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.js#L100`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.js#L100`,
                  reasons: [badLinkReasons.INVALID_TARGET_LINE_NUMBER],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that exists but the file extension is missing, even if the line number is valid", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.js`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}#L1`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}#L1`,
                  reasons: [badLinkReasons.MISSING_FILE_EXTENSION],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links when they are relative links which link through multiple parent directories", async () => {
      const testDirectory = await newTestDirectory();
      const firstInnerTestDirectory = path.resolve(
        testDirectory,
        "./inner-test-1"
      );
      const secondInnerTestDirectory = path.resolve(
        firstInnerTestDirectory,
        "./inner-test-2"
      );
      fs.mkdirSync(firstInnerTestDirectory);
      fs.mkdirSync(secondInnerTestDirectory);

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# main-title\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(
        `${testDirectory}/inner-test-1/inner-test-2`
      );

      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ../../${fileNameToLinkTo}.md#main-title`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a header tag in the current file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(
        filePathToLinkTo,
        `# Foo Bar -> Bacon and eggs\na story of foo and bar\nand baz`
      );

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[Foo Bar -> Bacon and eggs][1]\n\n[1]: ./${fileNameToLinkTo}.md#foo-bar---bacon-and-eggs`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores an local reference links that point at header tags in the current file that exist and include non alpha-numeric characters", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = newTestMarkdownFile(testDirectory);
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

    it("Ignores local reference links which point at headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "[Solution B][B]",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[B]: #solution-b-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "[Solution B][B]",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[B]: #solution-b-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "=",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "===",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[A]: #solution-a-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[C]: #solution-c-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "-",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "---",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[A]: #solution-a-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[C]: #solution-c-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
