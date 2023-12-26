import {
  TOP_LEVEL_TEST_DIRECTORY,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkUnquotesTemplate,
  applyTemplate,
  inlineLinkTemplate,
  newTestDirectory,
  newTestMarkdownFile,
  referenceLinkTemplate,
  runTestWithDirectoryCleanup,
  shorthandReferenceLinkTemplate,
} from "../../../../integration-test-utils";
import { badLinksInMarkdown } from "../bad-links-in-markdown";

describe.each([
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
  anchorLinkUnquotesTemplate,
])("bad-links-in-markdown - web links for $linkType", (markdown) => {
  it(`Does not identify web link of type ${markdown.name} in list of bad local links`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        applyTemplate(markdown.fullTemplate, { link: "http://www.google.com" }),
        applyTemplate(markdown.fullTemplate, {
          link: "http://www.google.com",
          linkText: "foobar (eggs)",
        }),
      ].join("\n"),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Does not identify email link of type ${markdown.name} in list of bad local links`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_TEST_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.fullTemplate, {
        link: "mailto:foo@gmail.com",
        linkText: "foo@gmail.com",
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(
        await badLinksInMarkdown({ targetDirectory: testDirectory })
      ).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
