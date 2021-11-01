export const badLinkReasons = {
  FILE_NOT_FOUND: "File cannot be found",
  HEADER_TAG_NOT_FOUND: "Header tag cannot be found in the file",
  MISSING_FILE_EXTENSION: "Link requires a file extension", // might work without an extension locally but does not work on github
  INVALID_TARGET_LINE_NUMBER:
    "Target line number is greater than the max number of lines in the file",
  MULTIPLE_MATCHING_FILES:
    "There are two files the link could be referencing. It is unclear which one it should link to",
  BAD_ABSOLUTE_LINK: "Absolute links to files must start with a forward slash ('/')",
  BAD_ABSOLUTE_IMAGE_LINK: "Absolute links to image files do not work",
};
