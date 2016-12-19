module.exports = function () {
    var pubnub_base = require('./pubnub_base'),
    sudo = require('sudo'),
    port_monitoring = require("./routes/port_monitoring"),
    network_monitoring = require('./routes/network_monitoring');

    require('./FT_to_BLE')();
    pubnub_base.resp_for_get_ready();

    var options = {
        cachePassword: true,
        prompt: 'Password, yo? ',
        spawnOptions: {shell: true, stdio: 'inherit'}
    };

    // sending btmon data
    var pubnubclient = "";
    pubnubclient = sudo(['sh', '-c', 'btmon']);
    pubnubclient.stdout.setEncoding('utf8');
    pubnubclient.stdout.on('data', function (data) {
        pubnub_base.publish_data(data);
    });

    pubnubclient.on('close', function (data) {
        console.log('bluetooth program stopped.');
    });

    port_monitoring.find_open_ports();
    network_monitoring.capture_ut_data();
}
