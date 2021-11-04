import fs from "fs";
import { uniqueId } from "lodash";
import path from "path";
import { isWindowsOs } from "../src/is-windows-os";

const TOP_LEVEL_DIRECTORY = path.resolve(__dirname, "../test-markdown-files");

/**
 * A function used to run a test with a file that will be cleaned up once
 * the tests is complete, regardless of the tests success or failure
 */
export const runTestWithDirectoryCleanup = async (testCallback, directoryToDelete) => {
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

export const newTestDirectory = async () => {
  const testDirectory = path.resolve(TOP_LEVEL_DIRECTORY, `./${uniqueName()}`);

  if (fs.existsSync(testDirectory)) await forceRemoveDir(testDirectory);
  fs.mkdirSync(testDirectory);

  return testDirectory;
};

export const getPathToNewTestFile = (testDirectory) =>
  path.resolve(testDirectory, `./${`${uniqueName()}.md`}`);

export const uniqueName = () => `test-${uniqueId()}`;

const forceRemoveDir = async (directory) =>
  new Promise((resolve) => fs.rm(directory, { recursive: true, force: true }, resolve));

export const transformAbsoluteLinkToMarkdownForCurrentOS = (absoluteLink) => {
  return isWindowsOs() ? `/${absoluteLink}` : absoluteLink;
};
