module.exports = function () {
    var pubnub_base = require('./pubnub_base'),
        sudo = require('sudo'),
        port_monitoring = require("./routes/port_monitoring"),
        network_monitoring = require('./routes/network_monitoring');

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

    start_noble_for_dfu();

    function start_noble_for_dfu(){
        var dfu_process = "";
        dfu_process = sudo(['sh', '-c', 'node nrf_dfu_index.js']);
        dfu_process.stdout.setEncoding('utf8');
        dfu_process.stdout.on('data', function (data) {
            console.log("okay i got this:",data);
            if(data.includes('09876rerfsd'))
            {
                dfu_process.kill();
                setTimeout(function(){
                    start_noble_for_dfu();
                    console.log("Running again")
                },500)
            }
        });
    }

    port_monitoring.find_open_ports();
    network_monitoring.capture_ut_data();
}