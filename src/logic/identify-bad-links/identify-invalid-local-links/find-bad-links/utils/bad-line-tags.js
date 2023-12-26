import {
  readFileAsString,
  splitByNewLineCharacters,
} from "../../../../../utils";
import { cleanMarkdown } from "../../../../../utils/clean-markdown";

export const badLineTags = (links) => {
  return links.filter((linkObject) => {
    const markdown = readFileAsString(linkObject.fullPath);
    const linesInMarkdownFile = splitByNewLineCharacters(
      // TODO how well tested is this?
      cleanMarkdown(markdown)
    );

    const targetLineNumber = Number(linkObject.linkTag.replace("L", ""));

    return targetLineNumber > linesInMarkdownFile.length;
  });
};
