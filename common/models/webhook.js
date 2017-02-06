// © Copyright IBM Corporation 2016,2017.
// Node module: microgateway-datastore
// LICENSE: Apache 2.0, https://www.apache.org/licenses/LICENSE-2.0


//var app = require('../../server/server');
var app = require('../../server/server');
var logger = require('apiconnect-cli-logger/logger.js')
        .child({ loc: 'microgateway:models:datastore:webhook' });
var LoadModel = require('../../server/boot/load-model.js');


module.exports = function(Webhooks) {
  Webhooks.observe(
    'after save',
    function(ctx, next) {
      logger.debug('supports isNewInstance?', ctx.isNewInstance !== undefined);
      if (ctx.isNewInstance) {
        if (logger.debug()) {
          logger.debug('new webhook received: %s',
            JSON.stringify(ctx.instance, null, 4));
        }
        LoadModel.triggerReloadFromWebhook(app, ctx);
      }
      next();
    }
  );
};
