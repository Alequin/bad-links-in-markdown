export const badLinkReasons = {
  FILE_NOT_FOUND: "file cannot be found",
  HEADER_TAG_NOT_FOUND: "header tag cannot be found in the file",
  MISSING_FILE_EXTENSION: "link requires a file extension", // might work without an extension locally but does not work on github
  INVALID_TARGET_LINE_NUMBER:
    "target line number is greater than the max number of lines in the file",
  MULTIPLE_MATCHING_FILES: "there are two files this could like to but it is unclear which one",
};
