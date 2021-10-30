# bad-links-in-markdown

A script that identifies links in markdown files that no longer work

`npm run find-bad-links -- --directory C:/path/to/top/level/directory`

# Key terms

- Local link: A link which points to another file / location on the current machine
- Inline link: any markdown link with appears inline in markdown. Contains the descriptive text and the raw link all in one place
  - does this include html links?
- Reference link: any markdown link defined elsewhere in the markdown document and then referenced at a later point

## TODO

- local links
  - Add a new bad-link-reason to say a single link may refer to two possible files
  - Add a new bad-link-reason to say a header tag is found multiple times
- image links
- web links (to be consider)
- html tag links
- html tag image links

### Syntax notes

https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
