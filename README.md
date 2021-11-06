# bad-links-in-markdown

A script that identifies links in markdown files that no longer work

`npm run find-bad-links -- --directory C:/path/to/top/level/directory`

# Key terms

- **Local link**: A link which points to another file / location on the current machine
- **Inline link**: any markdown link with appears inline in markdown. Contains the descriptive text and the raw link all in one place
  - does this include html links?
- **Reference link**: any markdown link defined elsewhere in the markdown document and then referenced at a later point
- **Image link**: a markdown link used to display an image
  - `![image text](./path/to/image/file.png)`
- **File link**: a markdown link used to link to any file
  - `[image text](./path/to/file.md)`

## TODO

- html tag links
- html tag image links
- Confirm absolute image links on linux are invalid
- web links (to be considered)

### Syntax notes

https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
