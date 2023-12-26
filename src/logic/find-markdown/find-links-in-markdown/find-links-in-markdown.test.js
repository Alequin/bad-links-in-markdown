import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  applyTemplateWithoutNewlines,
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
import { LINK_TYPE } from "../../../constants";
import { findLinksInMarkdown } from "./find-links-in-markdown";

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

const VALID_SINGLE_LINE_TEMPLATES = [
  inlineLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  inlineImageLinkTemplate,
];

describe("find-links-in-markdown", () => {
  describe.each(ALL_TEMPLATES)(
    "When the link type is $linkType",
    (markdown) => {
      it(`Identifies basic links in a markdown file`, async () => {
        const { path: testDirectory } = await newTestDirectory({
          parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
        });

        const templateConfig = {
          link: "./to/another/file.md",
          linkText: "I'm link test",
        };

        const { filePath } = newTestMarkdownFile({
          directory: testDirectory,
          content: applyTemplate(markdown.fullTemplate, templateConfig),
        });

        await runTestWithDirectoryCleanup(() => {
          expect(findLinksInMarkdown(filePath)).toStrictEqual([
            {
              markdownLink: applyTemplate(
                markdown.markdownLinkTemplate,
                templateConfig
              ),
              linkPath: templateConfig.link,
              linkTag: null,
              link: templateConfig.link,
              type: markdown.linkType,
              isImage: markdown.isImage,
            },
          ]);
        }, testDirectory);
      });

      const INDENTATION_MULTIPLIERS = [1, 2, 3];
      describe.each(INDENTATION_MULTIPLIERS)(
        "indented code block - indented %sX",
        (indentationModifier) => {
          const INDENTATION = "    ".repeat(indentationModifier);

          it("Ignores links included in indented code blocks", async () => {
            const { path: testDirectory } = await newTestDirectory({
              parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
            });

            const templateConfig = {
              link: "#cool-header",
              linkText: "I'm link test",
            };

            const markdownLink = applyTemplateWithoutNewlines(
              markdown.markdownLinkTemplate,
              templateConfig
            );

            const content = applyTemplate(
              markdown.contentTemplate,
              templateConfig
            );

            const { filePath } = newTestMarkdownFile({
              directory: testDirectory,
              content: [
                content,
                "Here is some text to talk about something",
                "", // space required between paragraph and code block
                `${INDENTATION}${markdownLink}`,
                "some more text here that is not in the code block",
              ].join("\n"),
            });
            await runTestWithDirectoryCleanup(() => {
              expect(findLinksInMarkdown(filePath)).toStrictEqual([]);
            }, testDirectory);
          });

          it("Identifies a link in an indented code block when the block is not preceded by a blank line", async () => {
            const { path: testDirectory } = await newTestDirectory({
              parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
            });

            const templateConfig = {
              link: "./path/to/missing/file.md",
              linkText: "I am a link",
            };

            const markdownLink = applyTemplateWithoutNewlines(
              markdown.markdownLinkTemplate,
              templateConfig
            );

            const content = applyTemplate(
              markdown.contentTemplate,
              templateConfig
            ).replace(markdownLink, "");

            const { filePath } = newTestMarkdownFile({
              directory: testDirectory,
              content: [
                content,
                "Here is some text to talk about something",
                // No empty line here so code block is broken
                `${INDENTATION}${markdownLink}`,
                "some more text here that is not in the code block",
              ].join("\n"),
            });

            await runTestWithDirectoryCleanup(() => {
              expect(findLinksInMarkdown(filePath)).toStrictEqual([
                {
                  isImage: markdown.isImage,
                  link: templateConfig.link,
                  linkPath: templateConfig.link,
                  linkTag: null,
                  markdownLink,
                  type: markdown.linkType,
                },
              ]);
            }, testDirectory);
          });
        }
      );

      const MULTILINE_CODE_BLOCKS = [
        { openBlock: "```", closeBlock: "```" },
        { openBlock: "<pre>", closeBlock: "</pre>" },
        { openBlock: "<code>", closeBlock: "</code>" },
      ];
      describe.each(MULTILINE_CODE_BLOCKS)(
        "When using a code multiline block created with '$openBlock'",
        ({ openBlock, closeBlock }) => {
          it(`Ignores links wrapped in a ${openBlock} block, even when the link points to a missing file`, async () => {
            const { path: testDirectory } = await newTestDirectory({
              parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
            });

            const { filePath } = newTestMarkdownFile({
              directory: testDirectory,
              content: [
                openBlock,
                applyTemplate(markdown.fullTemplate, {
                  link: "./to/another/file.md",
                  linkText: "I'm a test link",
                }),
                closeBlock,
                "",
                openBlock,
                applyTemplate(markdown.fullTemplate, {
                  link: "./to/another/file2.md",
                  linkText: "I'm the second test link",
                }),
                closeBlock,
              ].join("\n"),
            });

            await runTestWithDirectoryCleanup(() => {
              expect(findLinksInMarkdown(filePath)).toStrictEqual([]);
            }, testDirectory);
          });
        }
      );
    }
  );

  describe.each(VALID_SINGLE_LINE_TEMPLATES)(
    "When the link type is $linkType",
    (markdown) => {
      describe("when using single line code blocks such as `code-block`", () => {
        it(`Ignores links wrapped in single backticks`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const markdownLink = applyTemplate(markdown.markdownLinkTemplate, {
            link: "./path/to-file.md",
            linkText: "I'm link test",
          });

          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: [
              `\`${markdownLink}\``,
              `\`here is some other text ${markdownLink} more text over here\``,
            ].join("\n"),
          });

          await runTestWithDirectoryCleanup(() => {
            expect(findLinksInMarkdown(filePath)).toStrictEqual([]);
          }, testDirectory);
        });

        it(`Identifies links even when the link text contains text wrapped in single backticks`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const templateConfig = {
            link: "./path/to-file.md",
            linkText: "I am a `local link`",
          };

          const content = applyTemplate(markdown.fullTemplate, templateConfig);

          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content,
          });

          await runTestWithDirectoryCleanup(() => {
            expect(findLinksInMarkdown(filePath)).toStrictEqual([
              {
                isImage: markdown.isImage,
                link: templateConfig.link,
                linkPath: templateConfig.link,
                linkTag: null,
                markdownLink: applyTemplate(
                  markdown.markdownLinkTemplate,
                  templateConfig
                ),
                type: markdown.linkType,
              },
            ]);
          }, testDirectory);
        });

        it(`Identifies local inline links the point to files that don't exist when they follow a complete code block and are within an incomplete code block, where the block is created with single backticks`, async () => {
          const { path: testDirectory } = await newTestDirectory({
            parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
          });

          const templateConfig = {
            link: "./path/to-file.md",
            linkText: "I'm link test",
          };

          const markdownLink = applyTemplate(
            markdown.markdownLinkTemplate,
            templateConfig
          );

          const completeCodeBlock = "`code block contents`";
          const incompleteCodeBlock = `${markdownLink} \``;

          const { filePath } = newTestMarkdownFile({
            directory: testDirectory,
            content: `${completeCodeBlock} ${incompleteCodeBlock}`,
          });

          await runTestWithDirectoryCleanup(() => {
            expect(findLinksInMarkdown(filePath)).toStrictEqual([
              {
                isImage: markdown.isImage,
                link: templateConfig.link,
                linkPath: templateConfig.link,
                linkTag: null,
                markdownLink,
                type: markdown.linkType,
              },
            ]);
          }, testDirectory);
        });
      });
    }
  );

  describe("Commented out markdown", () => {
    it("Ignores commented out links", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: `
      <!-- [I am a local link](./path/to/missing/file.md) -->
  
      <!--
        [I am a local link](./path/to/missing/file.md)
      -->
  
      <? [I am a local link](./path/to/missing/file.md) ?>
  
      <?
        [I am a local link](./path/to/missing/file.md)
      ?>
  
      [//]: # [I am a local link](./path/to/missing/file.md)
  
      [//]: #       [I am a local link](./path/to/missing/file.md)
  
      [//]:# [I am a local link](./path/to/missing/file.md)
      `,
      });

      await runTestWithDirectoryCleanup(() => {
        expect(findLinksInMarkdown(filePath)).toStrictEqual([]);
      }, testDirectory);
    });

    it("Identifies links that are commented out but are done incorrectly", async () => {
      const { path: testDirectory } = await newTestDirectory({
        parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
      });

      const linkText = "I am a link";
      const linkPath = "./path/to/a/file.md";
      const { filePath } = newTestMarkdownFile({
        directory: testDirectory,
        content: [
          `<!- [${linkText}](${linkPath}) -->`,
          `<!-- [${linkText}](${linkPath}) ->`,
          `<! [${linkText}](${linkPath}) >`,
          `< [${linkText}](${linkPath}) ?>`,
          `<? [${linkText}](${linkPath}) >`,
          `[//]: #[${linkText}](${linkPath})`,
        ].join("\n"),
      });

      const expectedInlineLink = {
        markdownLink: `[${linkText}](${linkPath})`,
        linkPath,
        linkTag: null,
        link: linkPath,
        type: LINK_TYPE.inlineLink,
        isImage: false,
      };
      const expectedReferenceLink = {
        markdownLink: `[//]: #[${linkText}](${linkPath})`,
        linkPath: null,
        linkTag: `[${linkText}](${linkPath})`,
        link: `#[${linkText}](${linkPath})`,
        type: LINK_TYPE.referenceLink,
        isImage: false,
      };

      await runTestWithDirectoryCleanup(() => {
        expect(findLinksInMarkdown(filePath)).toStrictEqual([
          expectedInlineLink,
          expectedReferenceLink,
        ]);
      }, testDirectory);
    });
  });
});
