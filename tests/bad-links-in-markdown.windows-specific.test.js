import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import {
  getPathToNewTestFile,
  transformAbsoluteLinkToMarkdownForCurrentOS,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

describe("bad-links-in-markdown - windows specific", () => {
  describe("identify-invalid-local-links and the link is an inline link", () => {
    it.skip("Identifies an absolute local inline link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/file.md");
      fs.writeFileSync(filePath, `[I am a local link](${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](${absolutePath})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.skip("Identifies an invalid absolute local inline link that points at a file that exist", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](${filePathToLinkTo})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${filePathToLinkTo})`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is an inline link which includes a header tag", () => {
    it.skip("Identifies an absolute inline local link that points at a file that exist but does not contain the targeted header tag", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `# foo bar baz\na story of foo and bar\nand baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(fileContainingLink, `[I am a local link](${filePathToLinkTo}#main-title)`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](${filePathToLinkTo}#main-title)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the link is a reference link", () => {
    it.skip("Identifies an absolute local reference link that points at a file that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/file.md");
      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: ${absolutePath}`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.skip("Identifies invalid absolute local reference links", async () => {
      const testDirectory = await newTestDirectory();

      const fileNameToLinkTo = uniqueName();
      const filePathToLinkTo = path.resolve(testDirectory, `./${fileNameToLinkTo}.md`);
      fs.writeFileSync(filePathToLinkTo, `foo bar baz`);

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ${filePathToLinkTo}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ${filePathToLinkTo}`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the image link is an inline link", () => {
    it.skip("Identifies an absolute local inline image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/image.png");
      fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](/${absolutePath})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it.skip("Identifies an absolute local inline image link which point at images which exist as images cannot use absolute links", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(filePath, `![picture](/${absolutePath})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](/${absolutePath})`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("identify-invalid-local-links and the image link is a reference link", () => {
    it.skip("Identifies an absolute local reference image link that points at an image that does not exist", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "./path/to/missing/image.png");
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND, badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local reference image link as invalid as images cannot use absolute links", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    // TODO - fix windows specific test
    it.skip("Identifies an absolute local reference image as invalid even when the reference is uses as both an image and a file link", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      const absolutePath = path.resolve(testDirectory, "../dog.jpg");
      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][picture]\n![and then a link to a image][picture]\n\n[picture]: /${absolutePath}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: /${absolutePath}`,
                  reasons: [badLinkReasons.BAD_ABSOLUTE_IMAGE_LINK],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
