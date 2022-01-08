export const badLinkReasons = {
  FILE_NOT_FOUND: "File cannot be found",
  HEADER_TAG_NOT_FOUND: "Header tag cannot be found in the file",
  MISSING_FILE_EXTENSION:
    "Either the link is pointing at a non existent directory or it requires a file extension", // might work without an extension locally but does not work on github
  INVALID_TARGET_LINE_NUMBER:
    "Target line number is greater than the max number of lines in the file",
  MULTIPLE_MATCHING_FILES:
    "There are two files the link could be referencing. It is unclear which one it should link to",
  POTENTIAL_WINDOWS_ABSOLUTE_LINK:
    "This link is potentially a absolute link on a windows machine. These do not work on github",
  BAD_RELATIVE_LINK_SYNTAX:
    "Relative link syntax can only step up by one parent direction at a time. '.../' is invalid",
  INVALID_ABSOLUTE_LINK:
    "Absolute links must start from the root of the given directory",
};
