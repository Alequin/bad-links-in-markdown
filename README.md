# bad-links-in-markdown

A script that identifies links in markdown files that no longer work. The script is designed to work against the top level directory in a github repository.

`npm run find-bad-links -- --directory C:/path/to/top/level/directory`

# Key terms

- **Local link**: A link which points to another file / location in the current git repository
- **Inline link**: any markdown link which appears inline in markdown. Contains the descriptive text and the raw link all in one place
  - does this include html links?
- **Reference link**: any markdown link defined elsewhere in the markdown document and is then referenced at a later point
- **Shorthand reference link**: a reference link which does not use custom display text but instead uses the texted defined by the link
  e.g

  ```
  // reference link
  [custom display text][ref link text defined by link]

  // shorthand reference link
  [ref link text defined by link]

  // reference link definition
  [ref link text defined by link]: ./path/to/file
  ```

- **Image link**: a markdown link used to display an image
  - `![image text](./path/to/image/file.png)`
- **File link**: a markdown link used to link to any file
  - `[image text](./path/to/file.md)`

## TODO

- emails links e.g. [test@gmail.com](mailto:test@gmail.com)
- shorthand emails links e.g. <test@gmail.com>
- shorthand web links e.g. <www.google.com>
- html tag links
- html tag image links
- Confirm absolute image links on linux are invalid
- web links (to be considered)

### Syntax notes

https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
https://www.markdownguide.org/basic-syntax/#links
https://www.w3schools.io/file/markdown-links/
