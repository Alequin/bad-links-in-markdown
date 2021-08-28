const fs = require("fs");
const path = require("path");
const { uniqueId } = require("lodash");
const badLinksInMarkdown = require("./bad-links-in-markdown");

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
              missingLinks: ["[I am a local link](./path/to/missing/file.md)"],
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
              missingLinks: ["[I am a local link](./path/to/missing/file)"],
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
              missingLinks: ["[I am a local link](file.md)"],
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
              missingLinks: [`[I am a local link](file)`],
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

      fs.writeFileSync(filePath, `[I am a local link](${fileNameToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
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
    if (directoryToDelete && fs.existsSync(directoryToDelete))
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
