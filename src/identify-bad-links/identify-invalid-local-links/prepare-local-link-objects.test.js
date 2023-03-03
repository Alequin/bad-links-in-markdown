import path from "path";
import { LINK_TYPE } from "../../config/link-type";
import * as isDirectory from "../../utils/is-directory";
import * as findMatchingFiles from "./find-matching-files";
import { prepareLocalLinkObjects } from "./prepare-local-link-objects";

const MOCK_FILE_OBJECT = {
  name: "markdown-file.md",
  directory: "/path/to/directory/containing/file",
  sourceFilePath: "/path/to/directory/containing/file/markdown-file.md",
  topLevelDirectory: "/path/to/directory",
  links: [],
};

describe("prepare-local-link-objects", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an empty array when the given file has no links", () => {
    const fileObject = {
      ...MOCK_FILE_OBJECT,
      links: [],
    };

    expect(prepareLocalLinkObjects(fileObject)).toEqual([]);
  });

  it.each([
    { linkPath: null, linkTag: "", type: LINK_TYPE.inlineLink },
    {
      linkPath: "mailto:email-link@gmail.com",
      linkTag: null,
    },
    {
      linkPath: "https://www.web-link.com",
      linkTag: null,
    },
    {
      linkPath: "/valid-link/but has spaces.md",
      linkTag: null,
    },
  ])(
    "returns a empty array when the given link is not a local link ($linkPath, $linkTag)",
    (link) => {
      expect(
        prepareLocalLinkObjects({
          ...MOCK_FILE_OBJECT,
          links: [link],
        })
      ).toEqual([]);
    }
  );

  it("returns the expected details", () => {
    const fileObject = {
      ...MOCK_FILE_OBJECT,
      links: [
        {
          markdownLink: "[foobar](./file-path.md#header-tag)",
          type: LINK_TYPE.inlineLink,
          linkPath: "./file-path.md",
          linkTag: "#header-tag",
          link: "./file-path.md#header-tag",
          isImage: false,
        },
      ],
    };

    jest
      .spyOn(findMatchingFiles, "findMatchingFiles")
      .mockImplementation(() => []);
    jest.spyOn(isDirectory, "isDirectory").mockImplementation(() => false);

    expect(prepareLocalLinkObjects(fileObject)).toEqual([
      {
        containingFile: {
          directory: fileObject.directory,
          topLevelDirectory: fileObject.topLevelDirectory,
        },
        markdownLink: "[foobar](./file-path.md#header-tag)",
        type: LINK_TYPE.inlineLink,
        linkPath: "./file-path.md",
        linkTag: "#header-tag",
        link: "./file-path.md#header-tag",
        name: "file-path.md",
        isImage: false,
        isAbsoluteLink: false,
        isTagOnlyLink: false,
        matchedFileCount: 0,
        matchedFile: null,
        matchedFileExtension: null,
        linkFileExtension: ".md",
        isExistingDirectory: false,
        fullPath: path.resolve(
          fileObject.directory,
          fileObject.links[0].linkPath
        ),
      },
    ]);
  });

  it.todo("returns false for absolute links when the link is absolute");

  it.todo("returns true for absolute links when the link is absolute");

  it.todo("has no issues for all link types");

  it.todo("returns true for 'isTagOnlyLink' link when it is one");

  it.todo("returns false for 'isTagOnlyLink' link when it is not one");

  it.todo("returns the sourceFilePath for 'fullPath' for tag only links");

  it.todo(
    "returns the correct value for 'fullPath' when the link does not start with a relative path"
  );

  it.todo(
    "returns the correct value for 'fullPath' when the link starts with a relative path"
  );

  it.todo("returns nothing on matched files when nothing can be found");

  it.todo(
    "return nothing on matched files when the link type is an unquotedAnchorLink"
  );

  it.todo(
    "return nothing on matched files when the link type is an quotedAnchorLink"
  );

  it.todo("return details on matched files when they can be found");

  it.todo(
    "sets the full path to the raw full path when the file extention is known"
  );

  it.todo(
    "sets the full path to the raw full path when the file extention is not known and no matched files can be found"
  );

  it.todo(
    "creates a fullPath, which includes a potential file extenstion, when a matched file with an extension is available"
  );

  it.todo(
    "sets 'isExistingDirectory' to true when the link points at a valid directory"
  );

  it.todo(
    "sets 'isExistingDirectory' to false when the link points at an invalid directory"
  );

  it.todo(
    "sets 'directory', 'topLevelDirectory' and 'sourceFilePath' based on the file containing the link"
  );
});
