import { readMarkdownFileLines } from "../../../utils/read-markdown-file-lines";

export const badLineTags = (links) => {
  return links.filter((linkObject) => {
    const linesInMarkdownFile = readMarkdownFileLines(linkObject.fullPath);

    const targetLineNumber = Number(linkObject.tag.replace("L", ""));

    return targetLineNumber > linesInMarkdownFile.length;
  });
};