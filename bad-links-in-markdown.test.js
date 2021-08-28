const fs = require("fs");
const path = require("path");
const { uniqueId } = require("lodash");
const badLinksInMarkdown = require("./bad-links-in-markdown");

const TOP_LEVEL_DIRECTORY = path.resolve(__dirname, "./test-markdown-files");

describe("bad-links-in-markdown", () => {
  it("Can identify a local link that point at a file that does not exist", async () => {
    const filePath = getFilePathToTestFile();

    fs.writeFileSync(
      filePath,
      `[I am a local link](./path/to/missing/file.md)`
    );

    await runTestWithFileCleanup(async () => {
      expect(await badLinksInMarkdown(TOP_LEVEL_DIRECTORY)).toEqual({
        badLocalLinks: [
          {
            filePath: path.resolve(TOP_LEVEL_DIRECTORY, "./test-file-1.md"),
            missingLinks: [
              path.resolve(TOP_LEVEL_DIRECTORY, "./path/to/missing/file.md")
            ]
          }
        ]
      });
    }, [filePath]);
  });

  it("Ignores local links which point at files which exist", async () => {
    const fileNameToLinkTo = "link-file-574947.md";
    const filePathToLinkTo = path.resolve(
      TOP_LEVEL_DIRECTORY,
      `./${fileNameToLinkTo}`
    );
    fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

    const fileContainingLink = getFilePathToTestFile();
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./${fileNameToLinkTo})`
    );

    await runTestWithFileCleanup(async () => {
      expect(await badLinksInMarkdown(TOP_LEVEL_DIRECTORY)).toEqual({
        badLocalLinks: []
      });
    }, [fileContainingLink, filePathToLinkTo]);
  });

  it("Can identify a local link that point at a file that does not exist even when the link does not contain a file extension", async () => {
    const filePath = getFilePathToTestFile();

    fs.writeFileSync(filePath, `[I am a local link](./path/to/missing/file)`);

    await runTestWithFileCleanup(async () => {
      expect(await badLinksInMarkdown(TOP_LEVEL_DIRECTORY)).toEqual({
        badLocalLinks: [
          {
            filePath: path.resolve(TOP_LEVEL_DIRECTORY, "./test-file-1.md"),
            missingLinks: [
              path.resolve(TOP_LEVEL_DIRECTORY, "./path/to/missing/file")
            ]
          }
        ]
      });
    }, [filePath]);
  });
});

/**
 * A function used to run a test with a file that will be cleaned up once
 * the tests is complete, regardless of the tests success or failure
 */
const runTestWithFileCleanup = async (testCallback, testFiles = []) => {
  try {
    await testCallback();
  } catch (error) {
    throw error;
  } finally {
    testFiles.forEach(testFile => fs.unlinkSync(testFile));
  }
};

const getFilePathToTestFile = () =>
  path.resolve(TOP_LEVEL_DIRECTORY, `./${`test-file-${uniqueId()}.md`}`);
