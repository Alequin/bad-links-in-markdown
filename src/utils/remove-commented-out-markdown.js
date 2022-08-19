export const removeCommentedOutMarkdown = (markdown) => {
  return markdown
    .replace(/<!--.*-->/s, "") // <!-- commented out -->
    .replace(/\<\?.*\?\>/s, "") // <? commented out ?>
    .replace(/\[\/\/\]\:\s*\#\s.*/g, ""); // [//]: # commented out
};
