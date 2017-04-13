const request = require('request');
const ghCh = require('./lib');

const options = {
  githubToken: process.env.GITHUB_TOKEN,
  clubhouseToken: process.env.CLUBHOUSE_TOKEN
}

request({
    url: `https://api.github.com/repos/${process.env.GITHUB_ORGANIZATION_NAME}/${process.env.GITHUB_REPO_NAME}/issues`,
    headers: {
      "Authorization": `token ${options.githubToken}`,
      "User-Agent": "request"
    }
  }, function(err, res, body) {
    if (err) {
      console.log(err)
      return
    }

    // https://developer.github.com/guides/traversing-with-pagination/
    let numberOfPages = 1;
    if (res.headers.link) {
      const links = res.headers.link.split(',');
      for (i=0; i<links.length; i++) {
        const link = links[i]

        if (link.indexOf('rel="last"') > -1)
          numberOfPages = link.match(/page=(\d+).*$/)[1]
      }
    }

    for (page=1; page<=numberOfPages; page++) {
      request({
        url: `https://api.github.com/repos/${process.env.GITHUB_ORGANIZATION_NAME}/${process.env.GITHUB_REPO_NAME}/issues?page=${page}}`,
        headers: {
          "Authorization": `token ${options.githubToken}`,
          "User-Agent": "request"
        }
      }, function(err, res, body) {
        if (err) {
          console.log(err)
          return
        }
        const jsonBody = JSON.parse(body)
        for (var key in jsonBody) {
          var issue = jsonBody[key];
          if (!issue.pull_request) {
            ghCh.githubIssueToClubhouseStory(issue.html_url, process.env.CLUBHOUSE_PROJECT_NAME, options)
              .then(function(story) {
                console.info('Created story with ID:', story.id)
              })
              .catch(function(err) {
                console.error(err)
              })
          }
        }
      })
    }
  }
);
