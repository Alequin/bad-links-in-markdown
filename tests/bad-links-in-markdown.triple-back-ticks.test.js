import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
} from "./test-utils";

describe("bad-links-in-markdown - links in triple back ticks", () => {
  it("Ignores local inline links wrapped in triple backticks, even when the link is broken", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

    fs.writeFileSync(
      filePath,
      ["```", `[I am a local link](./path/to/missing/file.md)`, "```"].join(
        "\n"
      )
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Ignores local reference links wrapped in triple backticks, even when the link is broken", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

    fs.writeFileSync(
      filePath,
      [
        "[foobar][I am a reference link]",
        "```",
        `[I am a reference link]: ./path/to/missing/file.md`,
        "```",
      ].join("\n")
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [],
      });
    }, testDirectory);
  });

  it("Identifies local inline links when the header they link to is in triple backticks", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

    fs.writeFileSync(
      filePath,
      ["```", "# cool header", "```", `[I am a local link](#cool-header)`].join(
        "\n"
      )
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[I am a local link](#cool-header)",
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });

  it("Identifies local reference links when the header they link to is in triple backticks", async () => {
    const testDirectory = await newTestDirectory();

    const filePath = newTestMarkdownFile(testDirectory);

    fs.writeFileSync(
      filePath,
      [
        "```",
        "# cool header",
        "```",
        "",
        "[foobar][I am a reference link]",
        `[I am a reference link]: #cool-header`,
      ].join("\n")
    );

    await runTestWithDirectoryCleanup(async () => {
      expect(await badLinksInMarkdown(testDirectory)).toEqual({
        badLocalLinks: [
          {
            filePath,
            missingLinks: [
              {
                link: "[I am a reference link]: #cool-header",
                reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
              },
            ],
          },
        ],
      });
    }, testDirectory);
  });
});
