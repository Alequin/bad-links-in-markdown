import {
  TOP_LEVEL_TEST_DIRECTORY,
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
} from "../../../../integration-test-utils";
import path from "path";
import { findMarkdownFilesInDirectory } from "./find-markdown-files-in-directory";

describe("find-markdown-files-in-directory", () => {
  it("Finds all markdown files in the given directory", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const testFile1 = newTestMarkdownFile({
      directory: testDirectory,
      content: `test1`,
    });
    const testFile2 = newTestMarkdownFile({
      directory: testDirectory,
      content: `test2`,
    });
    const testFile3 = newTestMarkdownFile({
      directory: testDirectory,
      content: `test3`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(findMarkdownFilesInDirectory(testDirectory)).toStrictEqual([
        {
          name: testFile1.fileName,
          directory: testDirectory,
          sourceFilePath: path.resolve(
            testDirectory,
            `./${testFile1.fileName}`
          ),
        },
        {
          name: testFile2.fileName,
          directory: testDirectory,
          sourceFilePath: path.resolve(
            testDirectory,
            `./${testFile2.fileName}`
          ),
        },
        {
          name: testFile3.fileName,
          directory: testDirectory,
          sourceFilePath: path.resolve(
            testDirectory,
            `./${testFile3.fileName}`
          ),
        },
      ]);
    }, testDirectory);
  });

  it("Finds all markdown files in the sub directories of the given directory", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { path: testDirectoryLevel1 } = await newTestDirectory({
      parentDirectory: testDirectory,
    });
    const testFileLevel1 = newTestMarkdownFile({
      directory: testDirectoryLevel1,
      content: `test1`,
    });

    const { path: testDirectoryLevel2 } = await newTestDirectory({
      parentDirectory: testDirectoryLevel1,
    });
    const testFileLevel2 = newTestMarkdownFile({
      directory: testDirectoryLevel2,
      content: `test1`,
    });

    const { path: testDirectoryLevel3 } = await newTestDirectory({
      parentDirectory: testDirectoryLevel2,
    });
    const testFileLevel3 = newTestMarkdownFile({
      directory: testDirectoryLevel3,
      content: `test1`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(findMarkdownFilesInDirectory(testDirectory)).toStrictEqual([
        {
          name: testFileLevel1.fileName,
          directory: testDirectoryLevel1,
          sourceFilePath: path.resolve(
            testDirectoryLevel1,
            `./${testFileLevel1.fileName}`
          ),
        },
        {
          name: testFileLevel2.fileName,
          directory: testDirectoryLevel2,
          sourceFilePath: path.resolve(
            testDirectoryLevel2,
            `./${testFileLevel2.fileName}`
          ),
        },
        {
          name: testFileLevel3.fileName,
          directory: testDirectoryLevel3,
          sourceFilePath: path.resolve(
            testDirectoryLevel3,
            `./${testFileLevel3.fileName}`
          ),
        },
      ]);
    }, testDirectory);
  });

  it("Ignores files that are not markdown files", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestFile({
      directory: testDirectory,
      extension: ".js",
      content: "",
    });

    const { path: testDirectoryLevel1 } = await newTestDirectory({
      parentDirectory: testDirectory,
    });
    newTestFile({
      directory: testDirectory,
      extension: ".yaml",
      content: "",
    });

    await newTestDirectory({
      parentDirectory: testDirectoryLevel1,
    });
    newTestFile({
      directory: testDirectory,
      extension: ".json",
      content: "",
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(findMarkdownFilesInDirectory(testDirectory)).toStrictEqual([]);
    }, testDirectory);
  });

  it("Ignores private directories", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { path: testDirectoryLevel1 } = await newTestDirectory({
      name: ".private-dir-1",
      parentDirectory: testDirectory,
    });
    newTestMarkdownFile({
      directory: testDirectoryLevel1,
      content: `test1`,
    });

    const { path: testDirectoryLevel2 } = await newTestDirectory({
      name: ".private-dir-2",
      parentDirectory: testDirectoryLevel1,
    });
    newTestMarkdownFile({
      directory: testDirectoryLevel2,
      content: `test1`,
    });

    const { path: testDirectoryLevel3 } = await newTestDirectory({
      name: ".private-dir-3",
      parentDirectory: testDirectoryLevel2,
    });
    newTestMarkdownFile({
      directory: testDirectoryLevel3,
      content: `test1`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(findMarkdownFilesInDirectory(testDirectory)).toStrictEqual([]);
    }, testDirectory);
  });

  it('Ignores the directory "node_modules"', async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    const { path: testDirectoryLevel1 } = await newTestDirectory({
      name: "node_modules",
      parentDirectory: testDirectory,
    });
    newTestMarkdownFile({
      directory: testDirectoryLevel1,
      content: `test1`,
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(findMarkdownFilesInDirectory(testDirectory)).toStrictEqual([]);
    }, testDirectory);
  });
});
