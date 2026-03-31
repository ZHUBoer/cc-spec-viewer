const { nfes } = require("@ctrip/serverless-nfes");
const { streamify } = require("@ctrip/serverless-streamify");
const { composeChain } = require("@ctrip/serverless-compose");

exports.handler = composeChain(streamify(), nfes({ streamify: true }));
