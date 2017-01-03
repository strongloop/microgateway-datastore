// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: microgateway
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

var app = require('../../server/server');
var logger = require('apiconnect-cli-logger/logger.js')
        .child({ loc: 'microgateway:datastore:models:api' });
var Promise = require('bluebird');
var _ = require('lodash');

function makePathRegex(basePath, apiPath) {
  var path = apiPath;
  var braceBegin = -1;
  var braceEnd = -1;
  var variablePath;

  // remove the trailing /
  if (basePath) {
    basePath = basePath[basePath.length - 1] === '/' ?
        basePath.substr(0, basePath.length - 1) : basePath;
  } else {
    basePath = '';
  }

  // only the last param can have + to indicate multiple instance
  // need to check if path ends with param with prefix +

  var regex = /{\+([^}]+)}$/;
  var matches = regex.exec(path);
  if (matches) {
    // logger.debug('path before replacing multi instance: ', path);
    braceBegin = path.lastIndexOf('{');
    braceEnd = path.lastIndexOf('}') + 1;
    variablePath = path.substring(braceBegin, braceEnd);
    path = path.replace(variablePath, '.+');
    // logger.debug('path after replacing multi instance: ', path);
  }

  var regex_findPuls = /{\+([^}]+)}/;
  matches = regex_findPuls.exec(path);

  // give a warning if the {+param} is not at the end of the path.
  if (matches) {
    // logger.warn('api path \'' + apiPath + '\' contains \'{+param}\' that is not at the end of the path.' +
    //         ' This parameter will not be able to match multipl URI fragment.');
  }

  do {
    braceBegin = path.indexOf('{');
    if (braceBegin >= 0) {
      braceEnd = path.indexOf('}') + 1;
      variablePath = path.substring(braceBegin, braceEnd);
      path = path.replace(variablePath, '[^/]+');
      //path = path.replace(variablePath, '.+');
    }
  } while (braceBegin >= 0);
  if (apiPath === '/') {
    path = '^' + basePath + '/?$';
  } else {
    path = '^' + basePath + path + '/?$';
  }
  // logger.debug('path after: ', path);
  return path;
}

function calculateMatchingScore(apiPath) {
  var pathArray = apiPath.split('/');
  var pathScore = 0;
  for (var i = 0; i < pathArray.length; i++) {
    if (pathArray[i].indexOf('{') >= 0) {
      pathScore += Math.pow((pathArray.length - i), 2);
    }
  }
  return pathScore;
}

function generateMatchPaths(doc) {
  var result = [];
  var iter_paths = JSON.parse(JSON.stringify(doc.paths));
  _.forOwn(iter_paths, function(def, path) {
    var o = { path: path };
    o['regex'] = makePathRegex(doc.basePath, path);
    o['score'] = calculateMatchingScore(path);
    o['methods'] = _.keys(def);

    result.push(o);
  });
  return result;
}


module.exports = function(Apis) {
  Apis.observe(
    'before save',
    function(ctx, next) {
      logger.debug('supports isNewInstance?', ctx.isNewInstance !== undefined);
      if (ctx.isNewInstance) {
        if (logger.debug()) {
          logger.debug('new api received: %s',
            JSON.stringify(ctx.instance, null, 4));
        }
        ctx.instance.document['x-ibm-api-paths'] = generateMatchPaths(ctx.instance.document);
      }
      next();
    }
  );
};
