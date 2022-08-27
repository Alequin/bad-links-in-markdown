import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  newTestMarkdownFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  newTestFile,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - headers preceeded by space characters", () => {
  it("Ignores local inline links which point at headers which exist and are preceeded by space characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `        # main-title\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
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

  it("Ignores local inline links which point at headers in the same file and are preceeded by space characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `        # main-title\na story of foo and bar\nand baz\n[I am a local link](#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at headers which exist and are preceeded by space characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `        # main-title\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
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

  it("Ignores local reference links which point at headers in the same file which are preceeded by space characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `        # main-title\na story of foo and bar\nand baz\n\n[1]: ./${fileToLinkTo.fileName}#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
