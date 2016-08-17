module.exports = function () {
    var pubnub_base = require('./pubnub_base');
    var sudo = require('sudo');
    require('./FT_to_BLE')();
    pubnub_base.resp_for_get_ready();

    var options = {
        cachePassword: true,
        prompt: 'Password, yo? ',
        spawnOptions: {shell: true, stdio: 'inherit'}
    };

    var pubnubclient = "";
    pubnubclient = sudo(['sh', '-c', 'btmon']);
    pubnubclient.stdout.setEncoding('utf8');
    pubnubclient.stdout.on('data', function (data) {
        pubnub_base.publish_data(data);
    });

    pubnubclient.on('close', function (data) {
        console.log('bluetooth program stopped.');
    });
}
