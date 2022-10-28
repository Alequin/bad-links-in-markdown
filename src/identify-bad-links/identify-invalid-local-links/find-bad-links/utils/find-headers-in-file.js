import { readCleanMarkdownFileLines } from "../../../../utils/read-clean-markdown-file-lines";

export const findHeadersInFile = (filePath) => {
  const fileLines = readCleanMarkdownFileLines(filePath);

  return [
    ...findTagHeadersInFile(fileLines),
    ...findUnderlineHeadersInFile(fileLines),
  ];
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
