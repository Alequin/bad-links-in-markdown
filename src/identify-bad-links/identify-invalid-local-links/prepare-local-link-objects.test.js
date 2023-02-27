import { LINK_TYPE } from "../../config/link-type";
import { prepareLocalLinkObjects } from "./prepare-local-link-objects";

describe("prepare-local-link-objects", () => {
  it.each([
    { linkPath: null, linkTag: "", type: LINK_TYPE.inlineLink },
    {
      linkPath: "mailto:email-link@gmail.com",
      linkTag: null,
    },
    {
      linkPath: "https://www.web-link.com",
      linkTag: null,
    },
    {
      linkPath: "/valid-link/but has spaces.md",
      linkTag: null,
    },
  ])(
    "returns a empty array when the given link is not a local link ($linkPath, $linkTag)",
    (link) => {
      expect(
        prepareLocalLinkObjects({
          links: [link],
        })
      ).toEqual([]);
    }
  );
});
