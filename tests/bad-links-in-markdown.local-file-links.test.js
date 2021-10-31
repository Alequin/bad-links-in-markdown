import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import {
  getPathToNewTestFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

describe("bad-links-in-markdown - local file links", () => {
  describe("identify-invalid-local-links and the link is an inline link", () => {
    it("Identifies a local inline link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](./path/to/missing/file.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path/to/missing/file.md)",
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an absolute local inline link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/file.md");
      fs.writeFileSync(filePath, `[I am a local link](${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](${absolutePath})`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.BAD_ABSOLUTE_LINK,
                  ]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores absolute local inline links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](/${filePathToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an invalid absolute local inline link that points at a file that exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](${filePathToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${filePathToLinkTo})`,
                  reasons: expect.arrayContaining([badLinkReasons.BAD_ABSOLUTE_LINK]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](./path/to/missing/file)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path/to/missing/file)",
                  reasons: expect.arrayContaining([
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](file.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](file.md)",
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo}.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](file)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](file)`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.MISSING_FILE_EXTENSION,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](${fileNameToLinkTo})`,
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](./path/to/missing/file.js)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path/to/missing/file.js)",
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}.js)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local link that points at a javascript file that exists but the file extension is missing", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local link that is missing a file extension and could potentially refer to two separate files", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const markdownFileToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo})`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ]),
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

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
  });

  describe("identify-invalid-local-links and the link is an inline link which includes a header tag", () => {
    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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

    it("Identifies an absolute inline local link that points at a file that exist but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](${filePathToLinkTo}#main-title)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${filePathToLinkTo}#main-title)`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                    badLinkReasons.BAD_ABSOLUTE_LINK,
                  ]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted sub header", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header that appears multiple times", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo}.md#foo-bar-baz-2)`
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                    badLinkReasons.MISSING_FILE_EXTENSION,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}#main-title)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}#main-title)`,
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(1000));

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}.js#L100)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local links which point at javascript files which exist but do not have a valid line number", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(10));

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}.js#L100)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.js#L100)`,
                  reasons: expect.arrayContaining([badLinkReasons.INVALID_TARGET_LINE_NUMBER]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](./${fileNameToLinkTo}#L1)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}#L1)`,
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is a reference link", () => {
    it("Identifies a reference link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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

    it("Identifies an absolute local reference link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/file.md");
      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: ${absolutePath}`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.BAD_ABSOLUTE_LINK,
                  ]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies invalid absolute local reference links", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${filePathToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ${filePathToLinkTo}`,
                  reasons: expect.arrayContaining([badLinkReasons.BAD_ABSOLUTE_LINK]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores absolute local reference links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: /${filePathToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a file that does not exist even when the link does not contain a file extension", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: expect.arrayContaining([
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.MISSING_FILE_EXTENSION,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference links that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

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

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `Here is some text\n[and then a link to a file][1]\n\n[1]: file`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: file`,
                  reasons: expect.arrayContaining([
                    badLinkReasons.FILE_NOT_FOUND,
                    badLinkReasons.MISSING_FILE_EXTENSION,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a javascript file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reasons: expect.arrayContaining([badLinkReasons.FILE_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
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
      const markdownFileToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(markdownFileToLinkTo, `# foo bar baz`);
      const javascriptFileToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(javascriptFileToLinkTo, `const foo = () => {}`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.MULTIPLE_MATCHING_FILES,
                  ]),
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

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
  });

  describe("identify-invalid-local-links and the link is an reference link which includes a header tag", () => {
    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Next Chapter\n baz and foo join forces`
      );

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(
        filePathToLinkTo,
        `# foo bar baz\na story of foo and bar\nand baz\n### Chapter (1)!!!!! alliances/are\\formed\n baz and foo join forces`
      );

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point a file that exists, contains the targeted header and contains the specified instance", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\n# foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#foo-bar-baz-2`
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `a story of foo and bar\r\nand baz\r\n# foo bar baz\n`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.HEADER_TAG_NOT_FOUND]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([
                    badLinkReasons.HEADER_TAG_NOT_FOUND,
                    badLinkReasons.MISSING_FILE_EXTENSION,
                  ]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# main-title\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(1000));

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz\n`.repeat(10));

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.INVALID_TARGET_LINE_NUMBER]),
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
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.js`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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
                  reasons: expect.arrayContaining([badLinkReasons.MISSING_FILE_EXTENSION]),
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  it.todo("can find matchFiles when the files are in different directories");
});
