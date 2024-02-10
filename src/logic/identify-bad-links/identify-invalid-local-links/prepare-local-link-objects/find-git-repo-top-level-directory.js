import Path from "path";
import { isDirectory, readItemsInDirectory } from "../../../../utils";
import { GIT_REPO_PRIVATE_FILE_NAME } from "../../../../constants";

// TODO make sure to test windows and ubuntu
// TODO what happens if its not a directory. Can that happen?
// TODO test me
// TODO - integration tests - does it work if git repo is not at the top level or if the user gives a directory at a level lower than the top?
export const findGitRepoTopLevelDirectory = (targetDirectory) => {
  if (!isDirectory(targetDirectory)) {
    throw new Error(
      `findGitRepoTopLevelDirectory errored while trying to located the closest git repository / Current directory: ${targetDirectory}`
    );
  }

  const itemsInDirectory = readItemsInDirectory(targetDirectory);
  const isInGitRepo = itemsInDirectory.includes(GIT_REPO_PRIVATE_FILE_NAME);
  if (isInGitRepo) return targetDirectory;

  const directoriesInNextPath = targetDirectory.split(/\\|\//).slice(0, -1);
  if (directoriesInNextPath.length === 1) return null;

  return findGitRepoTopLevelDirectory(
    Path.resolve(directoriesInNextPath.join("/"))
  );
};
