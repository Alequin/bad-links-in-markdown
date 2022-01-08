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

describe("bad-links-in-markdown - local file links", () => {
  it("Identifies local inline links that point at files that do not exist, even when the links include odd spacing at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `[I am a local link](    ./path/to/missing/file.md    )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[I am a local link](    ./path/to/missing/file.md    )",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline links which point at files which exist, even when the links include odd spacing at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](    ./${fileNameToLinkTo}.md    )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies inline local links that point at a files that exists but do not contain the targeted header tag, even when the links include odd spacing at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `# foo bar baz\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](    ./${fileNameToLinkTo}.md#main-title    )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link](    ./${fileNameToLinkTo}.md#main-title    )`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local links which point at files that exist and contain the targeted header, even when the links include odd spacing at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `# main-title\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](    ./${fileNameToLinkTo}.md#main-title    )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies reference links that points at files that do not exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1]\n\n[1]:     ./path/to/missing/file.md     `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[1]:     ./path/to/missing/file.md     ",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores reference links which point at files which exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1]\n\n[1]:     ./${fileNameToLinkTo}.md     `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `# foo bar baz\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1]\n\n[1]:     ./${fileNameToLinkTo}.md#main-title     `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[1]:     ./${fileNameToLinkTo}.md#main-title     `,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at files that exist and contain the targeted header, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const fileNameToLinkTo = uniqueName();
    const filePathToLinkTo = path.resolve(
      testDirectory,
      `./${fileNameToLinkTo}.md`
    );
    fs.writeFileSync(
      filePathToLinkTo,
      `# main-title\na story of foo and bar\nand baz`
    );

    const fileContainingLink = getPathToNewTestFile(testDirectory);
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1]\n\n[1]:     ./${fileNameToLinkTo}.md#main-title    `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local inline image links that point at images that does not exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `![picture](     ./path/to/missing/image.png     )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "![picture](     ./path/to/missing/image.png     )",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline image link which point at images which exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(filePath, `![picture](     ../dog.jpg     )`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local reference image links that point at images that do not exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture]\n\n[picture]:     ./path/to/missing/image.png    `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[picture]:     ./path/to/missing/image.png    ",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference image links which points at images which exist, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture]\n\n[picture]:     ../dog.jpg    `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include inline web links in list of bad local links, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `[I am a local link](    http://www.google.com    )`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include reference web links in the list of bad local links, even when the links contain spaces at the start and end", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = getPathToNewTestFile(testDirectory);

    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1]\n\n[1]:     http://www.google.com    `
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
