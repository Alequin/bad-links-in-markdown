import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  newTestMarkdownFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
} from "./test-utils";

describe("bad-links-in-markdown - web links", () => {
  it("Does not include inline web links in list of bad local links", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

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
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

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
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

    fs.writeFileSync(filePath, `[foo@gmail.com](mailto:foo@gmail.com)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include reference email links in list of bad local links", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);
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
