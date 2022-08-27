import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestMarkdownFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  newTestFile,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - headers with upper case characters", () => {
  it("Identifies local inline links which use upper case characters in the header, even when the header exists", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `# MAIN TITLE\n[I am a local link](#MAIN-TITLE)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link](#MAIN-TITLE)`,
                reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies local inline links which point at another files header and uses upper case characters in the header, even when the header exists", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath: targetFilePath, fileName: targetFileName } = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });
    fs.writeFileSync(targetFilePath, `# MAIN TITLE\nsome random text`);

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `# MAIN TITLE\n[I am a local link](./${targetFileName}#MAIN-TITLE)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link](./${targetFileName}#MAIN-TITLE)`,
                reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies local reference links which use upper case characters in the header, even when the header exists", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `# MAIN TITLE\n[foobar][I am a local link]\n[I am a reference link]: #MAIN-TITLE`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a reference link]: #MAIN-TITLE`,
                reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies local reference links which point at another files header and uses upper case characters in the header, even when the header exists", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath: targetFilePath, fileName: targetFileName } = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });

    fs.writeFileSync(targetFilePath, `# MAIN TITLE\nsome random text`);

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `# MAIN TITLE\n[foobar][I am a local link]\n[I am a reference link]: ./${targetFileName}#MAIN-TITLE`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a reference link]: ./${targetFileName}#MAIN-TITLE`,
                reasons: [badLinkReasons.CASE_SENSITIVE_HEADER_TAG],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
