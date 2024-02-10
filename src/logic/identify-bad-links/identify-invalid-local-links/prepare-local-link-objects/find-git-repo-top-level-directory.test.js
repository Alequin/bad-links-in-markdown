import Path from "path";
import { GIT_REPO_PRIVATE_FILE_NAME } from "../../../../constants";
import { isDirectory, readItemsInDirectory } from "../../../../utils";
import { findGitRepoTopLevelDirectory } from "./find-git-repo-top-level-directory";

jest.mock("../../../../utils", () => {
  return {
    ...jest.requireActual("../../../../utils"),
    isDirectory: jest.fn(),
    readItemsInDirectory: jest.fn(),
  };
});

describe("find-git-repo-top-level-directory", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    isDirectory.mockReturnValue(true);
  });

  it("Will return the given directory if an item within it is '.git', which means it's a git repo", () => {
    readItemsInDirectory.mockReturnValue([
      "item1.md",
      "item2.js",
      GIT_REPO_PRIVATE_FILE_NAME,
    ]);

    const fakePath = Path.resolve("/fake/directory/path");
    expect(findGitRepoTopLevelDirectory(fakePath)).toBe(fakePath);
  });

  it("Will return the parent directory from the given directory if an item within the parent is '.git', which means it's a git repo", () => {
    const givenDirectoryContents = ["item1.md", "item2.js"];
    const parentDirectoryContents = [
      "item3.md",
      "item4.js",
      GIT_REPO_PRIVATE_FILE_NAME,
    ];

    readItemsInDirectory
      .mockReturnValueOnce(givenDirectoryContents)
      .mockReturnValueOnce(parentDirectoryContents);

    expect(
      findGitRepoTopLevelDirectory(Path.resolve("/fake/directory/path"))
    ).toBe(Path.resolve("/fake/directory"));
  });

  it("Will return null if non of the directories, all the way up the the root, do not contain a '.git' private file", () => {
    const noGitRepoDirectoryContents = ["item1.md", "item2.js"];

    readItemsInDirectory.mockReturnValue(noGitRepoDirectoryContents);

    expect(
      findGitRepoTopLevelDirectory(Path.resolve("/fake/directory/path"))
    ).toBe(null);
  });

  it("Throws an error if the given directory is not actually a directory", () => {
    isDirectory.mockReturnValue(false);

    expect(() =>
      findGitRepoTopLevelDirectory(Path.resolve("/fake/directory/path"))
    ).toThrow();
  });
});
