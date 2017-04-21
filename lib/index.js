'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.githubIssueToClubhouseStory = exports.loadConfig = exports.saveConfig = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var githubIssueToClubhouseStory = exports.githubIssueToClubhouseStory = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(githubIssueURL, clubhouseProject) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var users, authorId, projects, _projects$find, projectId, issueRegExp, _githubIssueURL$match, _githubIssueURL$match2, _, owner, repo, issueNumber, issue, issueComments, unsavedStory, story;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _assertOption('githubToken', options);
            _assertOption('clubhouseToken', options);

            _context.next = 4;
            return (0, _clubhouse.listUsers)(options.clubhouseToken);

          case 4:
            users = _context.sent;
            authorId = users[0].id;
            _context.next = 8;
            return (0, _clubhouse.listProjects)(options.clubhouseToken);

          case 8:
            projects = _context.sent;
            _projects$find = projects.find(function (project) {
              return project.name === clubhouseProject;
            }), projectId = _projects$find.id;
            issueRegExp = /https?:\/\/github.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
            _githubIssueURL$match = githubIssueURL.match(issueRegExp), _githubIssueURL$match2 = (0, _slicedToArray3.default)(_githubIssueURL$match, 4), _ = _githubIssueURL$match2[0], owner = _githubIssueURL$match2[1], repo = _githubIssueURL$match2[2], issueNumber = _githubIssueURL$match2[3];
            _context.next = 14;
            return (0, _gitHub.getIssue)(options.githubToken, owner, repo, issueNumber);

          case 14:
            issue = _context.sent;
            _context.next = 17;
            return (0, _gitHub.getCommentsForIssue)(options.githubToken, owner, repo, issueNumber);

          case 17:
            issueComments = _context.sent;
            unsavedStory = _issueToStory(authorId, projectId, issue, issueComments);
            story = (0, _clubhouse.createStory)(options.clubhouseToken, unsavedStory);
            return _context.abrupt('return', story);

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function githubIssueToClubhouseStory(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _config = require('./util/config');

Object.defineProperty(exports, 'saveConfig', {
  enumerable: true,
  get: function get() {
    return _config.saveConfig;
  }
});
Object.defineProperty(exports, 'loadConfig', {
  enumerable: true,
  get: function get() {
    return _config.loadConfig;
  }
});

var _gitHub = require('./fetchers/gitHub');

var _clubhouse = require('./fetchers/clubhouse');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertOption(name, options) {
  if (!options[name]) {
    throw new Error(name + ' option must be provided');
  }
}

/* eslint-disable camelcase */
function _issueToStory(authorId, projectId, issue, issueComments) {
  return {
    project_id: projectId,
    name: issue.title,
    description: issue.body + '\n\n----------\n[Original Github Issue](' + issue.html_url + ')',
    comments: _presentComments(authorId, issueComments),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    external_id: issue.url,
    labels: _ghToChLabels(issue.labels),
    story_type: 'bug',
    requested_by_id: _githubToClubhouseUser(issue.user.id)
  };
}

function _presentComments(authorId, issueComments) {
  var comments = issueComments.map(function (issueComment) {
    return {
      author_id: _githubToClubhouseUser(issueComment.user.id),
      text: _getCommentText(issueComment),
      created_at: issueComment.created_at,
      updated_at: issueComment.updated_at,
      external_id: issueComment.url
    };
  });
  return comments;
}

function _ghToChLabels(githubLabels) {
  var labels = githubLabels.map(function (githubLabel) {
    return {
      name: _convertToUppercaseP(githubLabel.name)
    };
  });

  labels.push({ name: 'repo:' + process.env.GITHUB_REPO_NAME });
  return labels;
}

function _convertToUppercaseP(tagName) {
  // convert p1 etc to P1
  var isLowerCasePriorityTag = tagName.search(/^p[1-4]$/);
  if (isLowerCasePriorityTag) {
    return tagName.replace('p', 'P');
  }
  return tagName;
}

function _githubToClubhouseUser(githubUserId) {
  // Github id is the key, ch id is the value
  return {
    "24900407": "58e13fa2-ffb8-4730-a0fc-5bc726cbfe35", //riley
    "444217": "58de942f-0953-47c5-bb86-33c62a1c470e", //brian
    "216384": "58dfb7dc-89d0-4e30-b920-bb977b2301d1", //andoma
    "9979745": "58e143af-e7c4-4252-9f26-97772f1b8186", //mai-li
    "3470363": "58dfb7db-2b77-4530-b12c-818dbf0ad1e6", //frida
    "26336138": "58e0f7e5-84fc-421b-b7a3-491226072e34", //chris
    "147176": "58e26c10-16b6-49f1-b1be-89fda777b7f5", //neil
    "437261": "58e13fd1-9e91-4a0f-83e4-cb98cfa59eeb", //brookie
    "6462735": "58e1ca08-0f7c-4b63-94f1-be4c0949d31d", //craig
    "1147779": "58e04c1b-9337-46d6-ad68-fcddcd482c48", //carl
    "17276592": "58e147fe-e506-4206-a958-3b7485b97334", //henrik
    "34791": "58dfb632-83ac-4581-9e2d-e234533df559", //nevyn
    "564748": "58e13c6e-ea5b-4b36-bbe0-aa26b3cf2262", //pete
    "404076": "58e15ad7-dac7-4db7-b45e-eae59aaee612", //francis
    "227383": "58dfdab8-49c8-41e5-b34a-00cf88345399" }[githubUserId];
}

// If we can map the github user to a clubhouse user then the user will be displayed
// as the author in clubhouse. If we cannot map them then the `Github` user will be the author
// and we add a prefix to show who really created the comment on github.
function _getCommentText(issueComment) {
  var chUserId = _githubToClubhouseUser(issueComment.user.id);

  if (chUserId) return issueComment.body;

  return '**[Comment from GitHub user @' + issueComment.user.login + ':]** ' + issueComment.body;
}