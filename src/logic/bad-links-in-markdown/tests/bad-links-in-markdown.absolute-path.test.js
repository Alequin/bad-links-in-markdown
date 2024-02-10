import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineImageLinkTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestMarkdownFile,
  referenceImageLinkTemplate,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceImageLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinkReasons } from "../../../constants";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

const ALL_TEMPLATES = [
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  inlineImageLinkTemplate,
  referenceImageLinkTemplate,
  shorthandReferenceImageLinkTemplate,
];

describe("bad-links-in-markdown - absolute path", () => {
  describe.each(ALL_TEMPLATES)("$linkType", (markdown) => {
    describe("Target directory is a git repo", () => {
      it(`Identifies a link with an absolute path to a file when the target of the link does not exist`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const { name: testSubDirectoryName } = await newTestDirectory({
          parentDirectory: testDirectory,
          asMockGitRepo: false,
        });

        const absolutePath = `/${testSubDirectoryName}/non/existant/file.jpg`;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, { link: absolutePath }),
        });

        const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
          link: absolutePath,
        });

        // await runTestWithDirectoryCleanup(async () => {
        expect(
          await badLinksInMarkdown({ targetDirectory: testDirectory })
        ).toEqual({
          badLocalLinks: [
            {
              filePath,
              foundIssues: [
                {
                  markdownLink: expectedBadLink,
                  reasons: [badLinkReasons.FILE_NOT_FOUND],
                },
              ],
            },
          ],
        });
        // }, testDirectory);
      });

      it(`Identifies a link with an absolute path that tries to link into a directory that does not exist in the git repo`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const absolutePath = `/non-existant-directory-in-git-repo/file.jpg`;
        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, { link: absolutePath }),
        });

        const expectedBadLink = applyTemplate(markdown.markdownLinkTemplate, {
          link: absolutePath,
        });

        await runTestWithDirectoryCleanup(async () => {
          expect(
            await badLinksInMarkdown({ targetDirectory: testDirectory })
          ).toEqual({
            badLocalLinks: [
              {
                filePath,
                foundIssues: [
                  {
                    markdownLink: expectedBadLink,
                    reasons: [
                      badLinkReasons.ABSOLUTE_LINK_INVALID_START_POINT,
                      badLinkReasons.FILE_NOT_FOUND,
                    ],
                  },
                ],
              },
            ],
          });
        }, testDirectory);
      });

      it.todo(
        "Ignores valid links which point to existing files when the initial given directory is a sub directory of a git repo"
      );
    });
  });
});
