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

const forceRemoveDir = async (directory) =>
  new Promise((resolve) =>
    fs.rm(directory, { recursive: true, force: true }, resolve)
  );

export const newTestDirectory = async () => {
  const { path } = await newTestDirectoryWithName();
  return path;
};

export const newTestDirectoryWithName = async () => {
  const directoryName = uniqueName();
  const directoryPath = path.resolve(TOP_LEVEL_DIRECTORY, `./${directoryName}`);

  if (doesFileExist(directoryPath)) await forceRemoveDir(directoryPath);
  fs.mkdirSync(directoryPath);

  return { name: directoryName, path: directoryPath };
};

export const newTestMarkdownFile = (testDirectory) => {
  const { filePath } = newTestFile({
    directory: testDirectory,
    extension: ".md",
  });
  return filePath;
};

/**
 *
 * @param {object} options
 * @param {String} directory - directory the file should be made in
 * @param {[String]} name - name (without the extension) for the file. If null default name will be used
 * @param {String} extension - the file extension
 */
export const newTestFile = ({ directory, extension, name = uniqueName() }) => {
  const fileName = `${name}${extension}`;

  return {
    fileName,
    filePath: path.resolve(directory, `./${fileName}`),
  };
};

export const uniqueName = () => `test-${uniqueId()}`;

export const transformAbsoluteLinkToMarkdownForCurrentOS = (absoluteLink) => {
  return absoluteLink;
};
