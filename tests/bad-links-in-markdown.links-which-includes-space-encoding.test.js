import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe("bad-links-in-markdown - links-which-includes-space-encoding", () => {
  it("Identifies local inline links that point at files that do not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `[I am a local link](./path/to/missing%20file.md)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[I am a local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline links which point at files which exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = "test file 893982";
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
    });
    fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `[I am a local link](./test%20file%20893982.md)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies multiple local inline links on the same file line that point at files that do not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `[I am a local link](./path/to/missing%20file.md) and [I am another local link](./path/to/missing%20file.md)[I am anotherx2 local link](./path/to/missing%20file.md)(foobar)[I am anotherx3 local link](./path/to/missing%20file.md)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[I am a local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `[I am another local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `[I am anotherx2 local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `[I am anotherx3 local link](./path/to/missing%20file.md)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies inline local links that point at a files that exists but do not contain the targeted header tag, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = `file%20test`;
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
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

  it("Ignores local links which point at files that exist and contain the targeted header, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = "test file 9023892";
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
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
      `[I am a local link](./test%20file%209023892.md#main-title)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies reference links that point at files that do not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing%20file.md`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[1]: ./path/to/missing%20file.md`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores reference links which point at files which exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = `file test`;
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
    });
    fs.writeFileSync(fileToLinkTo.filePath, `foo bar baz`);

    const { filePath: fileContainingLink } = newTestMarkdownFile({
      directory: testDirectory,
    });
    fs.writeFileSync(
      fileContainingLink,
      `Here is some text\n[and then a link to a file][1]\n\n[1]: ./file%20test.md`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = `file%20test-893892hf`;
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
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
      `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileToLinkTo.fileName}#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath: fileContainingLink,
            missingLinks: [
              {
                link: `[1]: ./${fileToLinkTo.fileName}#main-title`,
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference links which point at files that exist and contain the targeted header, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const name = "test file nio39820";
    const fileToLinkTo = newTestFile({
      directory: testDirectory,
      extension: ".md",
      name,
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
      `Here is some text\n[and then a link to a file][1]\n\n[1]: ./test%20file%20nio39820.md#main-title`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies a local inline image link that points at an image that does not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(filePath, `![picture](./path/to/missing%20image.png)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `![picture](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies multiple local inline image links on the same file line that point at files that do not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `![picture](./path/to/missing%20image.png) and ![picture2](./path/to/missing%20image.png)![picture3](./path/to/missing%20image.png)(foobar)![picture4](./path/to/missing%20image.png)`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `![picture](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `![picture2](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `![picture3](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
              {
                link: `![picture4](./path/to/missing%20image.png)`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local inline image links which point at images that exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const imageFile = newTestFile({
      directory: testDirectory,
      extension: ".jpg",
      name: "test image",
    });
    fs.writeFileSync(imageFile.filePath, "");

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(filePath, `![picture](./test%20image.jpg)`);

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local reference image links that point at images that do not exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./path/to/missing%20image.png`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: `[picture]: ./path/to/missing%20image.png`,
                reasons: [badLinkReasons.FILE_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Ignores local reference image links which points at images that exist, even when the link includes space encoding characters", async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    const imageFile = newTestFile({
      directory: testDirectory,
      extension: ".jpg",
      name: "test image",
    });
    fs.writeFileSync(imageFile.filePath, "");

    const { filePath } = newTestMarkdownFile({ directory: testDirectory });

    fs.writeFileSync(
      filePath,
      `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./test%20image.jpg`
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
