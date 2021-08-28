import fetch from "node-fetch";

// TODO fix issue with github links: https://docs.github.com/en/enterprise-server@2.22/rest/reference/repos#get-repository-content
export const identifyInvalidLinksToWebSites = async (fileObjects) => {
  for (const { fullPath, links } of fileObjects) {
    const webLinks = links.filter(isStringAWebLink);

    for (const link of webLinks) {
      const statusCode = await linkResponseStatus(link);
      if (Number(statusCode) >= 400) {
        logErrorMessage(fullPath, link, statusCode);
      }
    }
  }
};

const URL_REGEX = /^(http(s)?:\/\/.).*|^(www\.).*/;
const isStringAWebLink = (link) => URL_REGEX.test(link);

const linkResponseStatus = async (link) => {
  const response = await fetch(link);
  return response.status;
};

const logErrorMessage = (fullPath, link, statusCode) => {
  console.log(
    "A URL is not returning a healthy status code in the file ",
    fullPath
  );
  console.log(link, statusCode);
  console.log("-----------------------------------------");
};
