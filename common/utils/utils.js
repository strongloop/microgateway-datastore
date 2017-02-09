// © Copyright IBM Corporation 2016,2017.
// Node module: microgateway-datastore
// LICENSE: Apache 2.0, https://www.apache.org/licenses/LICENSE-2.0


'use strict';

var path = require('path');
var fs = require('fs');
var logger = require('apiconnect-cli-logger/logger.js')
                  .child({ loc: 'microgateway:datastore:common:utils' });
var project = require('apiconnect-project');

exports.storeDataStorePort = function(port) {
  var localPath = getDataStorePath();
  try {
    var contents = JSON.parse(fs.readFileSync(localPath));
    contents.port = port;
    fs.writeFileSync(localPath, JSON.stringify(contents), 'utf8');
  } catch (e) {
    fs.writeFileSync(localPath, JSON.stringify({ port: port }), 'utf8');
  }
};

exports.setPreviousSnapshotDir = function(snapshotDir) {
  var localPath = getDataStorePath();
  try {
    var contents = JSON.parse(fs.readFileSync(localPath));
    contents.snapshot = snapshotDir;
    fs.writeFileSync(localPath, JSON.stringify(contents), 'utf8');
  } catch (e) {
    fs.writeFileSync(localPath, JSON.stringify({ snapshot: snapshotDir }), 'utf8');
  }
};

exports.getPreviousSnapshotDir = function() {
  var localPath = getDataStorePath();
  try {
    var contents = JSON.parse(fs.readFileSync(localPath));
    return contents.snapshot;
  } catch (e) {
    return undefined;
  }
};

function getDataStorePath() {

  var localPath = '.datastore';
  if (process.env.ORIG_CONFIG_DIR) {
    var projectInfo = project.inspectPath(process.env.ORIG_CONFIG_DIR);
    localPath = path.join(projectInfo.basePath, localPath);
  }
  logger.debug('.datastore path:', localPath);
  return localPath;
};
exports.getDataStorePath = getDataStorePath;
