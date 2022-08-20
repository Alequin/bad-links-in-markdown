import { readCleanMarkdownFileLines } from "../../../utils/read-clean-markdown-file-lines";

export const identifyLinksWithBadLineTags = (links) => {
  return links.filter((linkObject) => {
    const linesInMarkdownFile = readCleanMarkdownFileLines(linkObject.fullPath);

    const targetLineNumber = Number(linkObject.tag.replace("L", ""));

    return targetLineNumber > linesInMarkdownFile.length;
  });
};
