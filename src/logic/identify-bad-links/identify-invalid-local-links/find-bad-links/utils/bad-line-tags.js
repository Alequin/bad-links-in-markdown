import { readMarkdownFileLines } from "../../../../../utils";

export const badLineTags = (links) => {
  return links.filter((linkObject) => {
    const linesInMarkdownFile = readMarkdownFileLines(linkObject.fullPath);

    const targetLineNumber = Number(linkObject.linkTag.replace("L", ""));

    return targetLineNumber > linesInMarkdownFile.length;
  });
};
