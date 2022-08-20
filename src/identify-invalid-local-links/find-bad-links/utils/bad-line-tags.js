import { readFileLines } from "../../../utils/read-file-lines";

export const identifyLinksWithBadLineTags = (links) => {
  return links.filter((linkObject) => {
    const linesInMarkdownFile = readFileLines(linkObject.fullPath);

    const targetLineNumber = Number(linkObject.tag.replace("L", ""));

    return targetLineNumber > linesInMarkdownFile.length;
  });
};
