import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import { getPathToNewTestFile, newTestDirectory, runTestWithDirectoryCleanup } from "./test-utils";
import path from "path";

describe("bad-links-in-markdown - local image links", () => {
  it("Identifies a local inline image link that points at an image that does not exist", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(filePath, `![picture](./path/to/missing/image.png)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "![picture](./path/to/missing/image.png)",
                reasons: [badLinkReasons.IMAGE_FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores an local inline image link which points at an image which exist", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(filePath, `![picture](../dog.jpg)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies an absolute local inline image link that points at an image that does not exist", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = path.resolve(testDirectory, "./path/to/missing/image.png");
    fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `![picture](/${absolutePath})`,
                reasons: [
                  badLinkReasons.IMAGE_FILE_NOT_FOUND,
                  badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies an absolute local inline image link which point at images which exist as images cannot use absolute links", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = path.resolve(testDirectory, "../dog.jpg");
    fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `![picture](/${absolutePath})`,
                reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
