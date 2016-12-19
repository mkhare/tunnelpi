/**
 * Created by amit on 19/8/16.
 */
var proj_config = require("./proj_config");

var events = require('events');
module.exports.eventEmitter = new events.EventEmitter();

var pubnub = require("pubnub")({
    publish_key: proj_config.set1.publish_key,
    subscribe_key: proj_config.set1.subscribe_key
});
module.exports.pubnub = pubnub;