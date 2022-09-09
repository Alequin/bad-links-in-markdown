import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import {
  anchorLinkDoubleQuoteTemplate,
  anchorLinkSingleQuoteTemplate,
  applyTemplate,
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
} from "./markdown-templates";
import {
  newTestMarkdownFile,
  newTestDirectory,
  runTestWithDirectoryCleanup,
  TOP_LEVEL_DIRECTORY,
} from "./test-utils";

describe.each([
  inlineLinkTemplate,
  referenceLinkTemplate,
  shorthandReferenceLinkTemplate,
  anchorLinkSingleQuoteTemplate,
  anchorLinkDoubleQuoteTemplate,
])("bad-links-in-markdown - web links for $linkType", (markdown) => {
  it(`Does not web ${markdown.linkType} in list of bad local links`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: [
        applyTemplate(markdown.template, { link: "http://www.google.com" }),
        applyTemplate(markdown.template, {
          link: "http://www.google.com",
          linkText: "foobar (eggs)",
        }),
      ].join("\n"),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it(`Does not email ${markdown.linkType} in list of bad local links`, async () => {
    const { path: testDirectory } = await newTestDirectory({
      parentDirectory: TOP_LEVEL_DIRECTORY,
    });

    newTestMarkdownFile({
      directory: testDirectory,
      content: applyTemplate(markdown.template, {
        link: "mailto:foo@gmail.com",
        linkText: "foo@gmail.com",
      }),
    });

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });
});
