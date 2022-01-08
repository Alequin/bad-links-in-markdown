import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import {
  getPathToNewTestFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
} from "./test-utils";

describe("bad-links-in-markdown - windows specific", () => {
  it("Identifies a windows absolute local inline link that does not start with a forward slash", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = "C:\\path\\to\\missing\\file.md";
    fs.writeFileSync(filePath, `[I am a local link](${absolutePath})`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[I am a local link](${absolutePath})`,
                reasons: [
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.FILE_NOT_FOUND,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies a windows absolute local reference link that does not start with a forward slash", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = "C:\\path\\to\\missing\\file.md";
    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1]\n\n[1]: ${absolutePath}`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[1]: ${absolutePath}`,
                reasons: [
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.FILE_NOT_FOUND,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies a windows absolute local inline link for an image that does not start with a forward slash", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = "C:\\path\\to\\missing\\image.png";
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
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.FILE_NOT_FOUND,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies a windows absolute local reference link for an image that does not start with a forward slash", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = "C:\\path\\to\\missing\\image.png";
    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture]\n\n[picture]: /${absolutePath}`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[picture]: /${absolutePath}`,
                reasons: [
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.FILE_NOT_FOUND,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies an absolute local reference image as invalid even when the reference is uses as both an image and a file link", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    const absolutePath = "C:\\path\\to\\missing\\image.png";
    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][picture]\n![and then a link to a image][picture]\n\n[picture]: /${absolutePath}`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[picture]: /${absolutePath}`,
                reasons: [
                  badLinkReasons.POTENTIAL_WINDOWS_ABSOLUTE_LINK,
                  badLinkReasons.FILE_NOT_FOUND,
                ],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
