import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - links including parenthesis", () => {
  it("Identifies local inline links that point at files that do not exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `[I am a local link (with parens)](./path/to/missing/file.md)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[I am a local link (with parens)](./path/to/missing/file.md)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline links which point at files which exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link (with parens)](./${fileToLinkTo.fileName})`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies inline local links that point at a files that exists but do not contain the targeted header tag, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# foo bar baz\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link (with parens)](./${fileToLinkTo.fileName}#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[I am a local link (with parens)](./${fileToLinkTo.fileName}#main-title)`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local links which point at files that exist and contain the targeted header, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# main-title\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link (with parens)](./${fileToLinkTo.fileName}#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies reference links that point at files that do not exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1(link)]\n\n[1(link)]: ./path/to/missing/file.md`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[1(link)]: ./path/to/missing/file.md",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores reference links which point at files which exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1(link)]\n\n[1(link)]: ./${fileToLinkTo.fileName}`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# foo bar baz\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1(link)]\n\n[1(link)]: ./${fileToLinkTo.fileName}#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[1(link)]: ./${fileToLinkTo.fileName}#main-title`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at files that exist and contain the targeted header, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const fileToLinkTo = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileToLinkTo.filePath,
      `# main-title\na story of foo and bar\nand baz`
    );

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1(link)]\n\n[1(link)]: ./${fileToLinkTo.fileName}#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local inline image links that point at images that does not exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `![picture (check it out)](./path/to/missing/image.png)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "![picture (check it out)](./path/to/missing/image.png)",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline image link which point at images which exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const imageFile = newTestFile({
      directory: testDirectory,
      extension: ".jpg",
    });
    fs.writeFileSync(imageFile.filePath, "");

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });
    fs.writeFileSync(
      filePath,
      `![picture (check it out)](./${imageFile.fileName})`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local reference image links that point at images that do not exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture(link text)]\n\n[picture(link text)]: ./path/to/missing/image.png`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[picture(link text)]: ./path/to/missing/image.png",
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference image links which points at images which exist, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const imageFile = newTestFile({
      directory: testDirectory,
      extension: ".jpg",
    });
    fs.writeFileSync(imageFile.filePath, "");

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });
    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture(link text)]\n\n[picture(link text)]: ./${imageFile.fileName}`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include inline web links in list of bad local links, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `[I am a local link (with parens)](http://www.google.com)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Does not include reference web links in the list of bad local links, even when the links description text contains parentheses", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1(link)]\n\n[1(link)]: http://www.google.com`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
