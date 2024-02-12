import { markdownHeadersToTags } from "./markdown-headers-to-tags";

describe("markdownHeaderToTag", () => {
  it.each([
    { input: ["# MAIN TITLE"], output: ["main-title"] },
    { input: ["# MAIN-----TITLE"], output: ["main-----title"] },

    {
      input: ["## Reading / Sources of information"],
      output: ["reading--sources-of-information"],
    },
    {
      input: ["     # main-title"],
      output: ["main-title"],
    },
    {
      input: ["## Should I write an end-to-end test?"],
      output: ["should-i-write-an-end-to-end-test"],
    },
    {
      input: [`## Should I write an end-to-end test ????'''''"""}}}}}foo`],
      output: ["should-i-write-an-end-to-end-test-foo"],
    },
    {
      input: ["## Should i get two variants of this header ?"],
      output: [
        "should-i-get-two-variants-of-this-header-",
        "should-i-get-two-variants-of-this-header",
      ],
    },
    {
      input: ['### 1: "Critical Business logic" only ⚠️'],
      output: [
        "1-critical-business-logic-only-️",
        "1-critical-business-logic-only-⚠️",
      ],
    },
    {
      input: ["# Headerv1 `text`"],
      output: ["headerv1-text"],
    },
    {
      input: ["# headerv2-`text`"],
      output: ["headerv2-text"],
    },
  ])(
    "Should transform the header to the expected value (input: $input => output: $output)",
    ({ input, output }) => {
      expect(markdownHeadersToTags(input)).toStrictEqual(output);
    }
  );

  it("Should return the same header twice when the same header is given twice as input", () => {
    expect(
      markdownHeadersToTags(["# a matching header", "# a matching header"])
    ).toStrictEqual(["a-matching-header", "a-matching-header"]);
  });

  it.todo("fix logic with pre tags");

  it.todo("fix logic with code tags");
});
