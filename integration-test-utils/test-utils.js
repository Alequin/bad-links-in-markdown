import fs from "fs";
import { isNil, uniqueId } from "lodash";
import Path from "path";
import { doesFileExist } from "../src/utils";

export const TOP_LEVEL_TEST_DIRECTORY = Path.resolve(
  __dirname,
  "./test-generated-output"
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

export const newTestDirectory = async ({
  parentDirectory,
  name = uniqueName(),
  asMockGitRepo = true,
}) => {
  const directoryPath = Path.resolve(parentDirectory, `./${name}`);

  if (doesFileExist(directoryPath)) await forceRemoveDir(directoryPath);
  fs.mkdirSync(directoryPath);

  if (asMockGitRepo) {
    fs.mkdirSync(Path.resolve(directoryPath, "./.git"));
  }

  return { name, path: directoryPath };
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
    filePath: Path.resolve(directory, `./${fileName}`),
  };

  if (isNil(content))
    throw new Error(
      `When making a new test file content must be defined / Content: ${content}`
    );
  fs.writeFileSync(fileDetails.filePath, content);

  return fileDetails;
};

const uniqueName = () => {
  const randomKey = uniqueId().toString();
  const digitsToAdd = "0".repeat(6 - randomKey.length);
  return `test-${digitsToAdd}${randomKey}`;
};
