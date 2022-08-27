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

describe("bad-links-in-markdown - headers followed by command", () => {
  it("Ignores local inline links which point at existing headers that are followed by and inline command (example command <!-- omit-in-toc -->)", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# main-title <!-- omit-in-toc -->`
    );

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local inline links which point at missing headers that are followed by an inline command (example command <!-- omit-in-toc -->)", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# unexpected title <!-- omit-in-toc -->`
    );

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at existing headers that are followed by an inline command (example command <!-- omit-in-toc -->)", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# main-title <!-- omit-in-toc -->`
    );

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link][1]\n\n[1]: ./${fileToLinkTo.fileName}#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local reference links which point at missing headers that are followed by an inline command (example command <!-- omit-in-toc -->)", async () => {
    const testDirectory = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# unexpected title <!-- omit-in-toc -->`
    );

    const fileContainingLink = newTestMarkdownFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./${fileToLinkTo.fileName}#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link](./${fileToLinkTo.fileName}#main-title)`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
