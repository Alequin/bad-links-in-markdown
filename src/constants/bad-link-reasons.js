import { validImageExtensions } from "./valid-image-extensions";

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
    "This link is potentially an absolute link on a windows machine. These do not work on github",
  BAD_RELATIVE_LINK_SYNTAX:
    "Relative link syntax can only step up by one parent direction at a time. '.../' is invalid",
  // TODO what happens the git repos are nested?
  ABSOLUTE_LINK_INVALID_START_POINT:
    "Absolute links inside git repositories must start from the root of git repository directory",
  INVALID_IMAGE_EXTENSIONS: `Image extension is not valid. The supported extensions are ${validImageExtensions.join(
    ", "
  )}`,
  CASE_SENSITIVE_HEADER_TAG:
    "Header tag includes upper case characters. It is recommended to only used lower case. It will work in github but may not work in other markdown readers",
  TOO_MANY_HASH_CHARACTERS:
    "A header link should not contain more then one hash character",
  ANCHOR_TAG_INVALID_QUOTE:
    "The anchor tag is using invalid quotes and may not work when clicked",
  INVALID_SPACE_CHARACTER:
    "The link includes a space charater in an unexpected location",
};
