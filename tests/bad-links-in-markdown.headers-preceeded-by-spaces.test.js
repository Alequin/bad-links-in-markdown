import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import {
  getPathToNewTestFile,
  newTestDirectory,
  newTestDirectoryWithName,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

describe("bad-links-in-markdown - headers preceeded by space characters", () => {
  it("Ignores local inline links which point at headers which exist and are preceeded by space characters", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `        # main-title\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./${fileNameToLinkTo}.md#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Ignores local inline links which point at headers in the same file and are preceeded by space characters", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `        # main-title\na story of foo and bar\nand baz\n[I am a local link](#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at headers which exist and are preceeded by space characters", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `        # main-title\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at headers in the same file which are preceeded by space characters", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `        # main-title\na story of foo and bar\nand baz\n\n[1]: ./${fileNameToLinkTo}.md#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
