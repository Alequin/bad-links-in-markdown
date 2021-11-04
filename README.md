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

- Consider if absolute links can be handled by saying it starts with a "/" as that is common across linux and windows
  - Still would need a way to identify absolute windows links without a "/" and marking them as bad 

- image links
- web links (to be consider)
- html tag links
- html tag image links

### Syntax notes

https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
