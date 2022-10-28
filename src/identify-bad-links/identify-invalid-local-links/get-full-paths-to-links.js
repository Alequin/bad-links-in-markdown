import path from "path";

export const getFullPathsToLinks = (links, directory) =>
  links.map(({ link }) => path.resolve(directory, link));
