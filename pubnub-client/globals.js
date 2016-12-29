/**
 * Created by amit on 19/8/16.
 */
var events = require('events');
var proj_config = require('./proj_config'),
    io = require("socket.io-client");

var configserver = proj_config.set1.configserver,
    sockio = io.connect(configserver, {reconnect: true});

var pubnub = require("pubnub")({
    publish_key: proj_config.set1.publish_key,
    subscribe_key: proj_config.set1.subscribe_key
});

module.exports.eventEmitter = new events.EventEmitter();
module.exports.sockio = sockio;
module.exports.noble = require('noble');
module.exports.pubnub = pubnub;