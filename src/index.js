import {getIssue, getCommentsForIssue} from './fetchers/gitHub'
import {listUsers, listProjects, createStory} from './fetchers/clubhouse'

export {saveConfig, loadConfig} from './util/config'

export async function githubIssueToClubhouseStory(githubIssueURL, clubhouseProject, options = {}) {
  _assertOption('githubToken', options)
  _assertOption('clubhouseToken', options)

  const users = await listUsers(options.clubhouseToken)
  const {id: authorId} = users[0]

  const projects = await listProjects(options.clubhouseToken)
  const {id: projectId} = projects.find(project => project.name === clubhouseProject)

  const issueRegExp = /https?:\/\/github.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/
  const [_, owner, repo, issueNumber] = githubIssueURL.match(issueRegExp)
  const issue = await getIssue(options.githubToken, owner, repo, issueNumber)
  const issueComments = await getCommentsForIssue(options.githubToken, owner, repo, issueNumber)

  const unsavedStory = _issueToStory(authorId, projectId, issue, issueComments)
  const story = createStory(options.clubhouseToken, unsavedStory)

  return story
}

function _assertOption(name, options) {
  if (!options[name]) {
    throw new Error(`${name} option must be provided`)
  }
}

/* eslint-disable camelcase */
function _issueToStory(authorId, projectId, issue, issueComments) {
  return {
    project_id: projectId,
    name: issue.title,
    description: `${issue.body}\n\n----------\n[Original Github Issue](${issue.html_url})`,
    comments: _presentComments(authorId, issueComments),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    external_id: issue.url,
    labels: _ghToChLabels(issue.labels),
    story_type: 'bug',
    requested_by_id: _githubToClubhouseUser(issue.user.id)
  }
}

function _presentComments(authorId, issueComments) {
  const comments = issueComments.map(issueComment => ({
    author_id: _githubToClubhouseUser(issueComment.user.id),
    text: _getCommentText(issueComment),
    created_at: issueComment.created_at,
    updated_at: issueComment.updated_at,
    external_id: issueComment.url,
  }))
  return comments
}

function _ghToChLabels(githubLabels) {
  const labels = githubLabels.map(githubLabel => ({
    name: _convertToUppercaseP(githubLabel.name)
  }))

  labels.push({name: `repo:${process.env.GITHUB_REPO_NAME}` })
  return labels
}

function _convertToUppercaseP(tagName) {
  // convert p1 etc to P1
  const isLowerCasePriorityTag = tagName.search(/^p[1-4]$/);
  if (isLowerCasePriorityTag) {
    return tagName.replace('p', 'P');
  }
  return tagName
}

function _githubToClubhouseUser(githubUserId) {
  // Github id is the key, ch id is the value
  return {
  }[githubUserId]
}

// If we can map the github user to a clubhouse user then the user will be displayed
// as the author in clubhouse. If we cannot map them then the `Github` user will be the author
// and we add a prefix to show who really created the comment on github.
function _getCommentText(issueComment) {
  const chUserId = _githubToClubhouseUser(issueComment.user.id)

  if (chUserId)
    return issueComment.body

  return `**[Comment from GitHub user @${issueComment.user.login}:]** ${issueComment.body}`
}
