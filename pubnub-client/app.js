var request = require('request');
var spawn = require('child_process').spawn;
var rl = require('readline');
var sudo = require('sudo');
var proj_config = require('./proj_config');
var configserver = proj_config.set1.configserver;
var sockio = require('socket.io-client')(configserver);
var events = require('events');
var eventEmitter = new events.EventEmitter();
var pubnub_base = require('./pubnub_base');
var gw_util = require('./gw_util');
require('./gateway-specific')();

var gwlocation = gw_util.get_location();
var cred = {
    uuid: proj_config.set1.uuid,
    email: proj_config.set1.email,
    password: proj_config.set1.password,
    subscribe_key: proj_config.set1.subscribe_key,
    publish_key: proj_config.set1.publish_key,
    channel_name: proj_config.set1.channel_name,
    devices: [{devuuid: 'bluetoothDev1'}, {devuuid: 'bluetoothDev2'}],
};

// pubnub_base.publish_location(gwlocation);
// pubnub_base.publish_location_using_ip();
pubnub_base.publish_location_using_ip_eurekapi();

sockio.on('connect', function (data) {
    console.log('socket connected to server');

    // request.post(configserver, {form: cred}, function (error, response, body) {
    //     console.log("gateway is sending request");
    //     if (error)
    //         console.log(error);

    //     if (!error && response.statusCode == 200) {
    //         console.log('succesfull login');
    //     }
    // });

    sockio.emit('creds', cred);
});

sockio.on('disconnect', function () {
    //sockio.disconnect();
    console.log('socket disconnected from server side');
});