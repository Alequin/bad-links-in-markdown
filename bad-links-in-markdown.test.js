import fs from "fs";
import path from "path";
import { uniqueId } from "lodash";
import { badLinksInMarkdown } from "./bad-links-in-markdown";
import { badLinkReasons } from "./src/identify-invalid-local-links/bad-link-reasons";

const TOP_LEVEL_DIRECTORY = path.resolve(__dirname, "./test-markdown-files");

describe("bad-links-in-markdown", () => {
  describe("identify-invalid-local-links", () => {
    it("Can identify a local link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

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
                  reason: badLinkReasons.FILE_NOT_FOUND,
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files which exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
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

    it("Can identify a local link that points at a file that does not exist even when the link does not contain a file extension", async () => {
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
                  reason: badLinkReasons.FILE_NOT_FOUND,
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files which exist even when the link is missing an extension", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${fileNameToLinkTo})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Can identify a local link that points at a file that does not exist when the file path does not include either absolute or relative path", async () => {
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
                  reason: badLinkReasons.FILE_NOT_FOUND,
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files which exist when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo}.md)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Can identify a local link that points at a file that does not exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
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
                  reason: badLinkReasons.FILE_NOT_FOUND,
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files which exist even when the link does not contain a file extension and when the file path does not include either absolute or relative path", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(
        testDirectory,
        `./${fileNameToLinkTo}.md`
      );
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    describe("when links include tags", () => {
      it("Can identify a local link that points at a file that exists but does not contain the targeted header tag", async () => {
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
                    reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
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
        const filePathToLinkTo = path.resolve(
          testDirectory,
          `./${fileNameToLinkTo}.md`
        );
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

      it("Can identify a local link that points at a file that exists but does not contain the targeted header tag", async () => {
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
                    reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it("Can identify a local link that points at a file that exists but does not contain the targeted header tag that appears multiple times", async () => {
        const testDirectory = await newTestDirectory();

        const fileNameToLinkTo = uniqueName();
        const filePathToLinkTo = path.resolve(
          testDirectory,
          `./${fileNameToLinkTo}.md`
        );
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
                    reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
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
        const filePathToLinkTo = path.resolve(
          testDirectory,
          `./${fileNameToLinkTo}.md`
        );
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

      it("Can identify a local link that points at a file that exists but does not contain the targeted header tag, regardless of the type of new line character used", async () => {
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
                    reason: badLinkReasons.HEADER_TAG_NOT_FOUND,
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });
    });
  });
});

/**
 * A function used to run a test with a file that will be cleaned up once
 * the tests is complete, regardless of the tests success or failure
 */
const runTestWithDirectoryCleanup = async (testCallback, directoryToDelete) => {
  try {
    await testCallback();
  } catch (error) {
    throw error;
  } finally {
    if (!directoryToDelete || !fs.existsSync(directoryToDelete))
      throw new Error("must have a directory to clean up");
    await forceRemoveDir(directoryToDelete);
  }
};

const newTestDirectory = async () => {
  const testDirectory = path.resolve(TOP_LEVEL_DIRECTORY, `./${uniqueName()}`);

  if (fs.existsSync(testDirectory)) await forceRemoveDir(testDirectory);
  fs.mkdirSync(testDirectory);

  return testDirectory;
};

const getPathToNewTestFile = (testDirectory) =>
  path.resolve(testDirectory, `./${`${uniqueName()}.md`}`);

const uniqueName = () => `test-${uniqueId()}`;

const forceRemoveDir = async (directory) =>
  new Promise((resolve) =>
    fs.rm(directory, { recursive: true, force: true }, resolve)
  );
