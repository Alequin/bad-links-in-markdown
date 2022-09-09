import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  applyTemplate,
  inlineImageLinkTemplate,
  inlineLinkTemplate,
  referenceImageLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceImageLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

const BAD_SYNTAX_EXAMPLES = [" "];

describe("bad-links-in-markdown - bad link syntax", () => {
  describe.each([
    inlineLinkTemplate,
    referenceLinkTemplate,
    shorthandReferenceLinkTemplate,
    anchorLinkSingleQuoteTemplate,
    anchorLinkDoubleQuoteTemplate,
    inlineImageLinkTemplate,
    referenceImageLinkTemplate,
    shorthandReferenceImageLinkTemplate,
  ])("For $linkType", (markdown) => {
    describe.each(BAD_SYNTAX_EXAMPLES)(
      `When the bad syntax is "%s"`,
      (badSyntax) => {
        it(`Ignores local ${markdown.linkType} that point at files that do not exist when they include the incorrect syntax "${badSyntax}"`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_DIRECTORY,
          });

          newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.template, {
              link: `./path/to/missing/file-${badSyntax}-test.md`,
            }),
          });

          await runTestWithDirectoryCleanup(async () => {
            expect(await badLinksInMarkdown(testDirectory)).toEqual({
              badLocalLinks: [],
            });
          }, testDirectory);
        });

        it(`Ignores local ${markdown.linkType} that point at a files that exists but do not contain the targeted header tag when they include the incorrect syntax "${badSyntax}"`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_DIRECTORY,
          });

          const name = `test${badSyntax}file`;
          const fileToLinkTo = newTestMarkdownFile({
            directory: testDirectory,
            name,
            content: `# foo bar baz\na story of foo and bar\nand baz`,
          });

          newTestMarkdownFile({
            directory: testDirectory,
            content: applyTemplate(markdown.template, {
              link: `./${name}.md#main-title`,
            }),
          });

          await runTestWithDirectoryCleanup(async () => {
            expect(await badLinksInMarkdown(testDirectory)).toEqual({
              badLocalLinks: [],
            });
          }, testDirectory);
        });
      }
    );
  });
});
