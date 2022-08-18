import fs from "fs";
import { uniqueId } from "lodash";
import path from "path";
import { doesFileExist } from "../src/utils/does-file-exist";

const TOP_LEVEL_DIRECTORY = path.resolve(__dirname, "../test-markdown-files");

/**
 * A function used to run a test with a file that will be cleaned up once
 * the tests is complete, regardless of the tests success or failure
 */
export const runTestWithDirectoryCleanup = async (
  testCallback,
  directoryToDelete
) => {
  try {
    await testCallback();
  } catch (error) {
    throw error;
  } finally {
    if (!directoryToDelete || !doesFileExist(directoryToDelete))
      throw new Error("must have a directory to clean up");
    await forceRemoveDir(directoryToDelete);
  }
};

export const newTestDirectory = async () => {
  const testDirectory = path.resolve(TOP_LEVEL_DIRECTORY, `./${uniqueName()}`);

  if (doesFileExist(testDirectory)) await forceRemoveDir(testDirectory);
  fs.mkdirSync(testDirectory);

  return testDirectory;
};

export const newTestDirectoryWithName = async () => {
  const directoryName = uniqueName();
  const directoryPath = path.resolve(TOP_LEVEL_DIRECTORY, `./${directoryName}`);

  if (doesFileExist(directoryPath)) await forceRemoveDir(directoryPath);
  fs.mkdirSync(directoryPath);

  return { name: directoryName, path: directoryPath };
};

export const newTestMarkdownFile = (testDirectory) => {
  const { filePath } = newTestFile(testDirectory, ".md");
  return filePath;
};

export const newTestFile = (testDirectory, extension) => {
  const fileName = `${uniqueName()}${extension}`;

  return {
    fileName,
    filePath: path.resolve(testDirectory, `./${fileName}`),
  };
};

export const uniqueName = () => `test-${uniqueId()}`;

const forceRemoveDir = async (directory) =>
  new Promise((resolve) =>
    fs.rm(directory, { recursive: true, force: true }, resolve)
  );

export const transformAbsoluteLinkToMarkdownForCurrentOS = (absoluteLink) => {
  return absoluteLink;
};
