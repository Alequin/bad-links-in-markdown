import { flatMap } from "lodash";
import {
  match,
  readFileAsString,
  splitByNewLineCharacters,
} from "../../../../../utils";
import {
  BACKTICKS_CODE_BLOCK_REGEX,
  CODE_TAG_REGEX,
  PRE_TAG_REGEX,
  TRIPLE_TICK_REGEX,
  removeCommentsFromMarkdown,
} from "../../../../../utils/clean-markdown";

export const findHeadersInFile = (filePath) => {
  const markdown = readFileAsString(filePath);
  const commentlessMarkdown = removeCommentsFromMarkdown(markdown);
  const fileLines = splitByNewLineCharacters(commentlessMarkdown);

  const headers = [
    ...findTagHeadersInFile(fileLines),
    ...findUnderlineHeadersInFile(fileLines),
  ];

  return removeHeadersInsideBlocks(headers, commentlessMarkdown);
};

const TAG_HEADER_SYNTAX_REGEX = /^\s*#/;
const findTagHeadersInFile = (fileLines) => {
  return fileLines.filter((line) => TAG_HEADER_SYNTAX_REGEX.test(line));
};

const UNDERLINE_HEADER_SYNTAX_REGEX = /^\-+$|^=+$/;
const findUnderlineHeadersInFile = (fileLines) => {
  const headers = [];
  for (const indexAsString in fileLines) {
    const index = Number(indexAsString);

    const currentLine = fileLines[index];
    if (!UNDERLINE_HEADER_SYNTAX_REGEX.test(currentLine)) continue;

    const previousLineText = fileLines[index - 1];
    if (!previousLineText) continue;

    headers.push(previousLineText);
  }

  return headers;
};

/**
 * These blocks can be used as part of headers and the headers will still be valid
 */
const BLOCK_WHICH_CAN_BE_USED_IN_HEADERS = [
  BACKTICKS_CODE_BLOCK_REGEX,
  TRIPLE_TICK_REGEX,
  CODE_TAG_REGEX,
  PRE_TAG_REGEX,
];

const removeHeadersInsideBlocks = (headers, markdown) => {
  const markdownWrappedInBlocks = flatMap(
    BLOCK_WHICH_CAN_BE_USED_IN_HEADERS,
    (pattern) => match(markdown, pattern)
  );

  return headers.filter((header) => {
    return markdownWrappedInBlocks.every((block) => !block.includes(header));
  });
};
