import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/identify-invalid-local-links/find-bad-links/bad-link-reasons";
import {
  getPathToNewTestFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

describe("bad-links-in-markdown - links with label text", () => {
  describe.each([`"`, `'`])("When the quote mark used is %s", (quoteMark) => {
    const labelText = `${quoteMark}the links label text${quoteMark}`;

    it("Identifies local inline links that point at files that do not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing/file.md ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](./path/to/missing/file.md ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at files which exist, even when the link includes label text", async () => {
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
        `[I am a local link](./${fileNameToLinkTo}.md ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies multiple local inline links on the same file line that point at files that do not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `[I am a local link](./path/to/missing/file.md ${labelText}) and [I am another local link](./path/to/missing/file.md ${labelText})[I am anotherx2 local link](./path/to/missing/file.md ${labelText})(foobar)[I am anotherx3 local link](./path/to/missing/file.md ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[I am a local link](./path/to/missing/file.md ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `[I am another local link](./path/to/missing/file.md ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `[I am anotherx2 local link](./path/to/missing/file.md ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `[I am anotherx3 local link](./path/to/missing/file.md ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies inline local links that point at a files that exists but do not contain the targeted header tag, even when the link includes label text", async () => {
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
        `[I am a local link](./${fileNameToLinkTo}.md#main-title ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[I am a local link](./${fileNameToLinkTo}.md#main-title ${labelText})`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local links which point at files that exist and contain the targeted header, even when the link includes label text", async () => {
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
        `[I am a local link](./${fileNameToLinkTo}.md#main-title ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a header tag in the current file that does not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[bad header](#main-title ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header](#main-title ${labelText})`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores an inline local link that points at a header tag in the current file that exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n[header](#main-title ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies reference links that point at files that do not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing/file.md ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[1]: ./path/to/missing/file.md ${labelText}`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores reference links which point at files which exist, even when the link includes label text", async () => {
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
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies an inline local link that points at a file that exists but does not contain the targeted header tag, even when the link includes label text", async () => {
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
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[1]: ./${fileNameToLinkTo}.md#main-title ${labelText}`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at files that exist and contain the targeted header, even when the link includes label text", async () => {
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
        `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}.md#main-title ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local reference link that points at a header tag in the current file that does not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `[foobar][bad header]\n[bad header]: #main-title ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath: fileContainingLink,
              missingLinks: [
                {
                  link: `[bad header]: #main-title ${labelText}`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores a local reference link that points at a header tag in the current file that exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const fileContainingLink = getPathToNewTestFile(testDirectory);
      fs.writeFileSync(
        fileContainingLink,
        `# Main Title\n[foobar][good header]\n[good header]: #main-title ${labelText}`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies a local inline image link that points at an image that does not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `![picture](./path/to/missing/image.png ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](./path/to/missing/image.png ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies multiple local inline image links on the same file line that point at files that do not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `![picture](./path/to/missing/image.png ${labelText}) and ![picture2](./path/to/missing/image.png ${labelText})![picture3](./path/to/missing/image.png ${labelText})(foobar)![picture4](./path/to/missing/image.png ${labelText})`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `![picture](./path/to/missing/image.png ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `![picture2](./path/to/missing/image.png ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `![picture3](./path/to/missing/image.png ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
                {
                  link: `![picture4](./path/to/missing/image.png ${labelText})`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Ignores local inline image links which point at images that exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(filePath, `![picture](../dog.jpg ${labelText})`);

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference image links which points at images that exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ../dog.jpg 'the images label text'`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference image links that point at images that do not exist, even when the link includes label text", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = getPathToNewTestFile(testDirectory);

      fs.writeFileSync(
        filePath,
        `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./path/to/missing/image.png 'the images label text'`
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[picture]: ./path/to/missing/image.png 'the images label text'`,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
