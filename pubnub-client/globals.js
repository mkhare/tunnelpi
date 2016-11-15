/**
 * Created by amit on 19/8/16.
 */
var events = require('events');
var proj_config = require('./proj_config');

var configserver = proj_config.set1.configserver;

module.exports.eventEmitter = new events.EventEmitter();
module.exports.sockio = require('socket.io-client')(configserver);
module.exports.noble = require('noble');