import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestDirectoryWithName,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - local directory links", () => {
  describe("identify-invalid-local-links and the link is an inline link to a directory", () => {
    it("Identifies local inline links that point at directories that do not exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(filePath, `[I am a local link](./path)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[I am a local link](./path)",
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at directories which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const innerDirectory = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${innerDirectory.name})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at directories which exist and have names similar to other directories in the same location", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const baseDirectoryName = "test-directory-i3oni3fpo";
      await newTestDirectoryWithName({
        parentDirectory: testDirectory,
        name: baseDirectoryName,
      });

      await newTestDirectoryWithName({
        parentDirectory: testDirectory,
        name: `${baseDirectoryName}-another-one`,
      });

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[I am a local link](./${baseDirectoryName})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an reference link to a directory", () => {
    it("Identifies local reference links that point at directories that do not exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[1]: ./path",
                  reasons: [
                    badLinkReasons.MISSING_FILE_EXTENSION,
                    badLinkReasons.FILE_NOT_FOUND,
                  ],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at directories which exist", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const directoryToLinkTo = await newTestDirectoryWithName({
        parentDirectory: testDirectory,
      });

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${directoryToLinkTo.name}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at directories which exist and have names similar to other directories in the same location", async () => {
      const testDirectory = await newTestDirectory({
        parentDirectory: TOP_LEVEL_DIRECTORY,
      });

      const directoryName = "inner-test-1";

      await newTestDirectoryWithName({
        parentDirectory: testDirectory,
        name: directoryName,
      });
      await newTestDirectoryWithName({
        parentDirectory: testDirectory,
        name: `${directoryName}-another-one`,
      });

      const fileContainingLink = newTestMarkdownFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${directoryName}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });
  });
});
