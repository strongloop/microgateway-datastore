// © Copyright IBM Corporation 2016,2017.
// Node module: microgateway-datastore
// LICENSE: Apache 2.0, https://www.apache.org/licenses/LICENSE-2.0


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
