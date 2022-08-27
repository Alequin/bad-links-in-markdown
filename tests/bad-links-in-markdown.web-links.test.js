import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  newTestMarkdownFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - web links", () => {
  it("Does not include inline web links in list of bad local links", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `
      [I am a local link](http://www.google.com)
      [foobar (eggs)](https://github.com/fun-repo)
    `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include reference web links in the list of bad local links", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `
      Here is some text\n[and then a link to a file][1]\n\n[1]: http://www.google.com
      Here is some text\n[and then a link to a file][1(eggs)]\n\n[1(eggs)]: https://github.com/fun-repo
      `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include inline email links in list of bad local links", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(filePath, `[foo@gmail.com](mailto:foo@gmail.com)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include reference email links in list of bad local links", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });
    fs.writeFileSync(
      filePath,
      `
      Here is some text\n[and then a link to a file][1]\n\n[1]: mailto:foobar@gmail.com
      `
    );
    fs.writeFileSync(filePath, `[foo@gmail.com](mailto:foo@gmail.com)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
