var proj_config = require('./proj_config');
var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports.build_peripheral_data = function (peripheral) {
    var peripheral_data = {
        "peripheral_uuid": peripheral.uuid,
        "peripheral_addr": peripheral.address
    };
    peripheral_data.email = proj_config.set1.email;
    peripheral_data.gw_uuid = proj_config.set1.uuid;
    peripheral_data.channel_name = proj_config.set1.channel_name;
    return peripheral_data;
}