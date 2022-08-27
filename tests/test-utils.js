import fs from "fs";
import { uniqueId } from "lodash";
import path from "path";
import { doesFileExist } from "../src/utils/does-file-exist";

export const TOP_LEVEL_DIRECTORY = path.resolve(
  __dirname,
  "../test-markdown-files"
);

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

export const newTestDirectory = async ({ parentDirectory, name }) => {
  const { path } = await newTestDirectoryWithName({
    parentDirectory,
    name,
  });
  return path;
};

export const newTestDirectoryWithName = async ({
  parentDirectory,
  name = uniqueName(),
}) => {
  const directoryPath = path.resolve(parentDirectory, `./${name}`);

  if (doesFileExist(directoryPath)) await forceRemoveDir(directoryPath);
  fs.mkdirSync(directoryPath);

  return { name: name, path: directoryPath };
};

export const newTestMarkdownFile = ({ directory, name, content }) => {
  return newTestFile({
    directory,
    extension: ".md",
    name,
    content,
  });
};

/**
 * @param {object} options
 * @param {String} directory - directory the file should be made in
 * @param {[String]} name - name (without the extension) for the file. If null default name will be used
 * @param {String} extension - the file extension
 */
export const newTestFile = ({
  directory,
  extension,
  name = uniqueName(),
  content,
}) => {
  const fileName = `${name}${extension}`;
  const fileDetails = {
    fileName,
    filePath: path.resolve(directory, `./${fileName}`),
  };

  // TODO remove this condition and update all the tests
  if (content) {
    fs.writeFileSync(fileDetails.filePath, content);
  }

  return fileDetails;
};

const uniqueName = () => `test-${uniqueId()}`;
