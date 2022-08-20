import fs from "fs";
import path from "path";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  uniqueName,
} from "./test-utils";

const BAD_SYNTAX_EXAMPLES = [" "];

describe("bad-links-in-markdown - bad link syntax", () => {
  describe.each(BAD_SYNTAX_EXAMPLES)(
    `When the bad syntax is "%s"`,
    (syntax) => {
      it(`Ignores local inline links that point at files that do not exist when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const filePath = newTestMarkdownFile(testDirectory);

        fs.writeFileSync(
          filePath,
          `[I am a local link](./path/to/missing/file-${syntax}-test.md)`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores inline local links that point at a files that exists but do not contain the targeted header tag when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const fileNameToLinkTo = uniqueName();
        const filePathToLinkTo = path.resolve(
          testDirectory,
          `./${fileNameToLinkTo}-${syntax}-test.md`
        );
        fs.writeFileSync(
          filePathToLinkTo,
          `# foo bar baz\na story of foo and bar\nand baz`
        );

        const fileContainingLink = newTestMarkdownFile(testDirectory);
        fs.writeFileSync(
          fileContainingLink,
          `[I am a local link](./${fileNameToLinkTo}-${syntax}-test.md#main-title)`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores reference links that point at files that do not exist when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const filePath = newTestMarkdownFile(testDirectory);

        fs.writeFileSync(
          filePath,
          `Here is some text\n[and then a link to a file][1]\n\n[1]: ./path/to/missing/file-${syntax}-test.md`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores inline local links that point at a files that exists but does not contain the targeted header tag when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const fileNameToLinkTo = uniqueName();
        const filePathToLinkTo = path.resolve(
          testDirectory,
          `./${fileNameToLinkTo}-${syntax}-test.md`
        );
        fs.writeFileSync(
          filePathToLinkTo,
          `# foo bar baz\na story of foo and bar\nand baz`
        );

        const fileContainingLink = newTestMarkdownFile(testDirectory);
        fs.writeFileSync(
          fileContainingLink,
          `Here is some text\n[and then a link to a file][1]\n\n[1]: ./${fileNameToLinkTo}-${syntax}-test.md#main-title`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores local inline image links that point at an images that does not exist when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const filePath = newTestMarkdownFile(testDirectory);

        fs.writeFileSync(
          filePath,
          `![picture](./path/to/missing/image-${syntax}-test.png)`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });

      it(`Ignores local reference image links that point at images that do not exist when they include the incorrect syntax "${syntax}"`, async () => {
        const testDirectory = await newTestDirectory();

        const filePath = newTestMarkdownFile(testDirectory);

        fs.writeFileSync(
          filePath,
          `Here is some text\n![and then a link to a file][picture]\n\n[picture]: ./path/to/missing/image-${syntax}-test.png`
        );

        await runTestWithDirectoryCleanup(async () => {
          expect(await badLinksInMarkdown(testDirectory)).toEqual({
            badLocalLinks: [],
          });
        }, testDirectory);
      });
    }
  );
});
