import fs from "fs";
import { badLinksInMarkdown } from "../bad-links-in-markdown";
import { badLinkReasons } from "../src/config/bad-link-reasons";
import {
  newTestDirectory,
  newTestFile,
  newTestMarkdownFile,
  runTestWithDirectoryCleanup,
} from "./test-utils";

describe("bad-links-in-markdown - local file links", () => {
  describe("local inline links to headers in current file", () => {
    it("Ignores local inline links which point at headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "[Solution B](#solution-b-foo-x-bar-hybrid)",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "[Solution B](#solution-b-foo-x-bar-hybrid)",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "===",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[Solution A](#solution-a-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[Solution C](#solution-c-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A](#solution-a-foo-x-bar-hybrid)",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "---",
          "",
          "[Solution C](#solution-c-foo-x-bar-hybrid)",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[Solution A](#solution-a-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[Solution C](#solution-c-foo-x-bar-hybrid)",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("local inline links to headers in another file", () => {
    it("Ignores local inline links which point at headers in a different file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
          `[Solution B](./${fileToLinkTo.fileName}#solution-b-foo-x-bar-hybrid)`,
          `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local inline links which point at headers in a different file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
          `[Solution B](./${fileToLinkTo.fileName}#solution-b-foo-x-bar-hybrid)`,
          `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in a different file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "",
          "===",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
          `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local inline links which point at invalid headers in a different file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "",
          "---",
          "",
          "Solution C",
          "Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
          `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[Solution A](./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: `[Solution C](./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid)`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("local reference links to headers in current file", () => {
    it("Ignores local reference links which point at headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "[Solution B][B]",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[B]: #solution-b-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "[Solution B][B]",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[B]: #solution-b-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in the current file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "=",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "===",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[A]: #solution-a-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[C]: #solution-c-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in the current file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "",
          "Solution A: Foo x Bar Hybrid",
          "",
          "-",
          "",
          "[Solution C][C]",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "---",
          "",
          "[A]: #solution-a-foo-x-bar-hybrid",
          "[C]: #solution-c-foo-x-bar-hybrid",
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: "[A]: #solution-a-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: "[C]: #solution-c-foo-x-bar-hybrid",
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });

  describe("local reference links to headers in another file", () => {
    it("Ignores local reference links which point at headers in a different file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "=",
          "",
          "Solution B: Foo x Bar Hybrid",
          "==",
          "",
          "Solution C: Foo x Bar Hybrid",
          "===",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "[Solution B][B]",
          "[Solution C][C]",
          `[A]: ./${fileToLinkTo}#solution-a-foo-x-bar-hybrid`,
          `[B]: ./${fileToLinkTo}#solution-b-foo-x-bar-hybrid`,
          `[C]: ./${fileToLinkTo}#solution-c-foo-x-bar-hybrid`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Ignores local reference links which point at headers in a different file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "-",
          "",
          "Solution B: Foo x Bar Hybrid",
          "--",
          "",
          "Solution C: Foo x Bar Hybrid",
          "---",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          "[Solution A][A]",
          "[Solution B][B]",
          "[Solution C][C]",
          `[A]: ./${fileToLinkTo}#solution-a-foo-x-bar-hybrid`,
          `[B]: ./${fileToLinkTo}#solution-b-foo-x-bar-hybrid`,
          `[C]: ./${fileToLinkTo}#solution-c-foo-x-bar-hybrid`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in a different file that use the equals syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "",
          "=",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "===",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[A]: ./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid`,
          `[C]: ./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[A]: ./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: `[C]: ./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });

    it("Identifies local reference links which point at invalid headers in a different file that use the dash syntax", async () => {
      const testDirectory = await newTestDirectory();

      const fileToLinkTo = newTestFile(testDirectory, ".md");

      fs.writeFileSync(
        fileToLinkTo.filePath,
        [
          "Solution A: Foo x Bar Hybrid",
          "",
          "-",
          "",
          "Solution C: Foo x Bar Hybrid",
          "",
          "---",
        ].join("\n")
      );

      const filePath = newTestMarkdownFile(testDirectory);

      fs.writeFileSync(
        filePath,
        [
          `[A]: ./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid`,
          `[C]: ./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid`,
        ].join("\n")
      );

      await runTestWithDirectoryCleanup(async () => {
        expect(await badLinksInMarkdown(testDirectory)).toEqual({
          badLocalLinks: [
            {
              filePath,
              missingLinks: [
                {
                  link: `[A]: ./${fileToLinkTo.fileName}#solution-a-foo-x-bar-hybrid`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
                {
                  link: `[C]: ./${fileToLinkTo.fileName}#solution-c-foo-x-bar-hybrid`,
                  reasons: [badLinkReasons.HEADER_TAG_NOT_FOUND],
                },
              ],
            },
          ],
        });
      }, testDirectory);
    });
  });
});
