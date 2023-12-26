const IGNORED_DIRECTORY_REGEX_PATTERNS = [
  /^\..*/, // ignore private directories / files
  /node_modules/, //ignore node_modules
];

export const isIgnoredDirectoryName = (directoryName) => {
  return IGNORED_DIRECTORY_REGEX_PATTERNS.some((pattern) => {
    return pattern.test(directoryName);
  });
};
