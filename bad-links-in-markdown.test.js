const fs = require("fs");
const path = require("path");
const { uniqueId } = require("lodash");
const badLinksInMarkdown = require("./bad-links-in-markdown");

const ROOT_DIRECTORY = __dirname;

describe("bad-links-in-markdown", () => {
  const topLevelDirectory = path.resolve(__dirname, "./test-markdown-files");

  it("Can identify a local link point at a file that does not exist", async () => {
    const filePath = getFilePathToTestFile();

    fs.writeFileSync(
      filePath,
      `[I am a local link](./path/to/missing/file.md)`
    );

    await runTestWithFile(filePath, async () => {
      expect(await badLinksInMarkdown(topLevelDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: path.resolve(
              ROOT_DIRECTORY,
              "./test-markdown-files/test-file-1.md"
            ),
            missingLinks: [
              path.resolve(
                ROOT_DIRECTORY,
                "./test-markdown-files/path/to/missing/file.md"
              )
            ]
          }
        ]
      });
    });
  });
});

/**
 * A function used to run a test with a file that will be cleaned up once
 * the tests is complete, regardless of the tests success or failure
 */
const runTestWithFile = async (testFile, testCallback) => {
  try {
    await testCallback();
  } catch (error) {
    throw error;
  } finally {
    fs.unlinkSync(testFile);
  }
};

const getFilePathToTestFile = () =>
  path.resolve(topLevelDirectory, `./${`test-file-${uniqueId()}.md`}`);
