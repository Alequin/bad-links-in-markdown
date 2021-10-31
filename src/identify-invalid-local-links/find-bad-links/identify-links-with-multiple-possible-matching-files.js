import fs from "fs";

export const identifyLinksWithMultiplePossibleMatchingFiles = (links) => {
  return links.filter(({ directory, name }) => {
    const possibleFileMatches = fs
      .readdirSync(directory)
      .filter((fileName) => fileName.includes(name));
    return possibleFileMatches.length > 1;
  });
};
