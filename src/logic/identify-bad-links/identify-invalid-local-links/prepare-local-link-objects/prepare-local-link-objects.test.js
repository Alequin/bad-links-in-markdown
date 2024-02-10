jest.mock("../../../../utils", () => {
  return {
    ...jest.requireActual("../../../../utils"),
    isDirectory: jest.fn(),
  };
});

import path from "path";
import { LINK_TYPE } from "../../../../constants";
import * as findMatchingFiles from "../find-matching-files";
import { prepareLocalLinkObjects } from "./prepare-local-link-objects";
import { isDirectory } from "../../../../utils";
import * as findGitRepoTopLevelDirectory from "./find-git-repo-top-level-directory";

const MOCK_FILE_OBJECT = {
  name: "markdown-file.md",
  directory: "/path/to/directory/containing/file",
  sourceFilePath: "/path/to/directory/containing/file/markdown-file.md",
  targetDirectory: "/path/to/directory",
  links: [],
};

describe("prepare-local-link-objects", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(findGitRepoTopLevelDirectory, "findGitRepoTopLevelDirectory")
      .mockImplementation(() => MOCK_FILE_OBJECT.targetDirectory);
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

  it.each(Object.values(LINK_TYPE))(
    "returns a link object for the given file when it contains one link when the link type is $s",
    (linkType) => {
      const fileObject = {
        ...MOCK_FILE_OBJECT,
        links: [
          {
            markdownLink: "[foobar](./file-path.md#header-tag)",
            type: linkType,
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
      isDirectory.mockImplementation(() => false);

      expect(prepareLocalLinkObjects(fileObject)).toEqual([
        {
          containingFile: {
            directory: fileObject.directory,
            gitRepositoryDirectory: fileObject.targetDirectory,
          },
          matchedFiles: [],
          markdownLink: "[foobar](./file-path.md#header-tag)",
          type: linkType,
          linkPath: "./file-path.md",
          linkTag: "#header-tag",
          link: "./file-path.md#header-tag",
          name: "file-path.md",
          isImage: false,
          isAbsoluteLink: false,
          isTagOnlyLink: false,
          linkFileExtension: ".md",
          isExistingDirectory: false,
          fullPath: path.resolve(
            fileObject.directory,
            fileObject.links[0].linkPath
          ),
        },
      ]);
    }
  );

  it("returns multiple link objects for the given file when it contains muiltiple links", () => {
    const link = {
      type: LINK_TYPE.inlineLink,
      linkPath: "./file-path.md",
      linkTag: "#header-tag",
      link: "./file-path.md#header-tag",
      isImage: false,
    };

    const fileObject = {
      ...MOCK_FILE_OBJECT,
      links: [
        {
          ...link,
          markdownLink: "[foobar1](./file-path.md#header-tag)",
        },
        {
          ...link,
          markdownLink: "[foobar2](./file-path.md#header-tag)",
        },
        {
          ...link,
          markdownLink: "[foobar3](./file-path.md#header-tag)",
        },
      ],
    };

    jest
      .spyOn(findMatchingFiles, "findMatchingFiles")
      .mockImplementation(() => []);
    isDirectory.mockImplementation(() => false);

    const linkObjects = prepareLocalLinkObjects(fileObject);
    expect(linkObjects).toHaveLength(3);
    expect(linkObjects[0].markdownLink).toBe(
      "[foobar1](./file-path.md#header-tag)"
    );
    expect(linkObjects[1].markdownLink).toBe(
      "[foobar2](./file-path.md#header-tag)"
    );
    expect(linkObjects[2].markdownLink).toBe(
      "[foobar3](./file-path.md#header-tag)"
    );
  });

  it.each([
    {
      state: "the link is not an absolute link",
      expectedValue: { isAbsoluteLink: false },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path.md#header-tag)",
        type: LINK_TYPE.inlineLink,
        linkPath: "./file-path.md",
        linkTag: "#header-tag",
        link: "./file-path.md#header-tag",
        isImage: false,
      },
    },
    {
      state: "the link is an absolute link",
      expectedValue: { isAbsoluteLink: true },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](/full/path/to/file/file-path.md#header-tag)",
        type: LINK_TYPE.inlineLink,
        linkPath: "/full/path/to/file/file-path.md",
        linkTag: null,
        link: "/full/path/to/file/file-path.md#header-tag",
        isImage: false,
      },
    },
  ])(
    "returns the expected value for 'isAbsoluteLink' when $state",
    ({ linkPropertiesUnderTest, expectedValue }) => {
      const fileObject = {
        ...MOCK_FILE_OBJECT,
        links: [linkPropertiesUnderTest],
      };

      jest
        .spyOn(findMatchingFiles, "findMatchingFiles")
        .mockImplementation(() => []);
      isDirectory.mockImplementation(() => false);

      expect(prepareLocalLinkObjects(fileObject)[0].isAbsoluteLink).toBe(
        expectedValue.isAbsoluteLink
      );
    }
  );

  it.each([
    {
      state: "the link only contains a tag",
      expectedValue: { isTagOnlyLink: true },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](#header-tag)",
        linkTag: "#header-tag",
        link: "#header-tag",
        linkPath: null,
      },
    },
    {
      state: "the link contains a file path and a tag",
      expectedValue: { isTagOnlyLink: false },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path.md#header-tag)",
        linkPath: "./file-path.md",
        linkTag: "#header-tag",
        link: "./file-path.md#header-tag",
      },
    },
    {
      state: "the link contains only a file path",
      expectedValue: { isTagOnlyLink: false },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path.md)",
        linkPath: "./file-path.md",
        linkTag: null,
        link: "./file-path.md",
      },
    },
  ])(
    "returns the expected value for 'isTagOnlyLink' when $state (expected value $isTagOnlyLink.expectedValue)",
    ({ linkPropertiesUnderTest, expectedValue }) => {
      const fileObject = {
        ...MOCK_FILE_OBJECT,
        links: [
          {
            type: LINK_TYPE.inlineLink,
            isImage: false,
            ...linkPropertiesUnderTest,
          },
        ],
      };

      jest
        .spyOn(findMatchingFiles, "findMatchingFiles")
        .mockImplementation(() => []);
      isDirectory.mockImplementation(() => false);

      expect(prepareLocalLinkObjects(fileObject)[0].isTagOnlyLink).toBe(
        expectedValue.isTagOnlyLink
      );
    }
  );

  it.each([
    {
      state: "the link is an absolute link inside a git repo",
      topLevelGitRepo: MOCK_FILE_OBJECT.targetDirectory,
      expectedValue: {
        fullPath: path.resolve(
          MOCK_FILE_OBJECT.targetDirectory,
          "./full/path/to/file/file-path.md"
        ),
      },
    },
    {
      state: "the link is an absolute link outside a git repo",
      topLevelGitRepo: null,
      expectedValue: {
        fullPath: path.resolve("/full/path/to/file/file-path.md"),
      },
    },
  ])(
    "returns the expected value for 'fullPath' when $state",
    ({ expectedValue, topLevelGitRepo }) => {
      jest
        .spyOn(findGitRepoTopLevelDirectory, "findGitRepoTopLevelDirectory")
        .mockImplementation(() => topLevelGitRepo);

      const fileObject = {
        ...MOCK_FILE_OBJECT,
        links: [
          {
            markdownLink:
              "[foobar](/full/path/to/file/file-path.md#header-tag)",
            linkPath: "/full/path/to/file/file-path.md",
            linkTag: "#header-tag",
            link: "/full/path/to/file/file-path.md",
            isImage: false,
            type: LINK_TYPE.inlineLink,
          },
        ],
      };

      jest
        .spyOn(findMatchingFiles, "findMatchingFiles")
        .mockImplementation(() => []);
      isDirectory.mockImplementation(() => false);

      expect(prepareLocalLinkObjects(fileObject)[0].fullPath).toBe(
        expectedValue.fullPath
      );
    }
  );

  it("returns the expected value for 'fullPath' when the link does not contain a file extension and a match file is available", () => {
    const fileObject = {
      ...MOCK_FILE_OBJECT,
      links: [
        {
          markdownLink: "[foobar](./file-path)",
          linkPath: "./file-path",
          linkTag: "#header-tag",
          link: "./file-path#header-tag",
          isImage: false,
          type: LINK_TYPE.inlineLink,
        },
      ],
    };

    jest
      .spyOn(findMatchingFiles, "findMatchingFiles")
      .mockImplementation(() => ["file-path.md"]);
    isDirectory.mockImplementation(() => false);

    expect(prepareLocalLinkObjects(fileObject)[0].fullPath).toBe(
      path.resolve(MOCK_FILE_OBJECT.directory, "./file-path.md")
    );
  });

  it.each([
    {
      state: "the link is an unquoted anchor link",
      expectedValue: { matchedFiles: [] },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path#header-tag)",
        type: LINK_TYPE.unquotedAnchorLink,
        linkPath: "./file-path",
        linkTag: "#header-tag",
        link: "./file-path#header-tag",
        isImage: false,
      },
    },
    {
      state: "the link is a quoted anchor link",
      expectedValue: { matchedFiles: [] },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path#header-tag)",
        type: LINK_TYPE.unquotedAnchorLink,
        linkPath: "./file-path",
        linkTag: "#header-tag",
        link: "./file-path#header-tag",
        isImage: false,
      },
    },
    {
      state: "the link is an inline link with matching files",
      expectedValue: {
        matchedFiles: [
          { name: "matching-file.md", extension: ".md" },
          { name: "matching-file.jpg", extension: ".jpg" },
        ],
      },
      linkPropertiesUnderTest: {
        markdownLink: "[foobar](./file-path#header-tag)",
        type: LINK_TYPE.inlineLink,
        linkPath: "./file-path",
        linkTag: "#header-tag",
        link: "./file-path#header-tag",
        isImage: false,
      },
    },
  ])(
    "returns the expected value for 'matchedFiles' when $state",
    ({ linkPropertiesUnderTest, expectedValue }) => {
      const fileObject = {
        ...MOCK_FILE_OBJECT,
        links: [linkPropertiesUnderTest],
      };

      jest
        .spyOn(findMatchingFiles, "findMatchingFiles")
        .mockImplementation(() => ["matching-file.md", "matching-file.jpg"]);
      isDirectory.mockImplementation(() => false);

      expect(prepareLocalLinkObjects(fileObject)[0].matchedFiles).toEqual(
        expectedValue.matchedFiles
      );
    }
  );

  it("returns the expected value for 'matchedFiles' when no matched files can be found", () => {
    const fileObject = {
      ...MOCK_FILE_OBJECT,
      links: [
        {
          markdownLink: "[foobar](./file-path)",
          linkPath: "./file-path",
          linkTag: "#header-tag",
          link: "./file-path#header-tag",
          isImage: false,
          type: LINK_TYPE.inlineLink,
        },
      ],
    };

    jest
      .spyOn(findMatchingFiles, "findMatchingFiles")
      .mockImplementation(() => []); // No matched files can be found

    isDirectory.mockImplementation(() => false);

    expect(prepareLocalLinkObjects(fileObject)[0].matchedFiles).toEqual([]);
  });

  it.each([true, false])(
    "returns the expected value for 'isExistingDirectory' when 'isDirectory' returns %s",
    (expectedValue) => {
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
      isDirectory.mockImplementation(() => expectedValue);

      expect(prepareLocalLinkObjects(fileObject)[0].isExistingDirectory).toBe(
        expectedValue
      );
    }
  );
});
