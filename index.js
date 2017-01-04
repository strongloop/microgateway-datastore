// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: microgateway
// US Government Users Restricted Rights - Use, duplication or disclosure
// restricted by GSA ADP Schedule Contract with IBM Corp.

'use strict';

var express = require('express');
var Promise = require('bluebird');
var ds = require('./datastore.js');
var logger = require('apiconnect-cli-logger/logger.js')
        .child({ loc: 'microgateway-datastore:microgw' });
var app = express();
var server;
exports.start = function(port) {
  return new Promise(function(resolve, reject) {
    ds.start(process.env.NODE_ENV === 'production')
      .catch(function(err) {
        logger.debug('datastore failed to start: ', err);
        ds.stop()
          .then(function() {
            reject(err);
          });
      });
  });
};

exports.stop = function() {
  return new Promise(function(resolve, reject) {
    ds.stop()
      .then(function() {
        if (server) {
          server.close(function() {
            resolve();
          });
        } else {
          resolve();
        }
      })
      .catch(reject);
  });
};

exports.app = app;

if (require.main === module) {
  exports.start().then(function() {});
}

var ctx_config = {
  request: {
    contentTypeMaps: [
      { 'application/json': [ '*/json', '+json', '*/javascript' ] },
      { 'application/xml': [ '*/xml', '+xml' ] } ],
    bodyFilter: {
      DELETE: 'ignore',
      GET: 'ignore',
      HEAD: 'ignore',
      OPTIONS: 'ignore' } },
  system: {
    datetimeFormat: 'YYYY-MM-DDTHH:mm:ssZ',
    timezoneFormat: 'Z' } };
