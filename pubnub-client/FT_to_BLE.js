/**
 * Created by amit on 4/8/16.
 */

var noble = require('noble');
var pubnub_base = require('./pubnub_base');
var proj_config = require('./proj_config');

module.exports = function () {

    var FT_SERVICE_UUID = '12ab';
    var FT_DATA_CHARACTERISTIC_UUID = '34cd';
    var FT_CONTROL_CHARACTERISTIC_UUID = '56ef';

    noble.on('stateChange', function (state) {
        if (state === 'poweredOn') {
            console.log('scanning...');
            noble.startScanning([FT_SERVICE_UUID], false);
        }
        else {
            noble.stopScanning();
        }
    })

    var data_characteristic = null;
    var control_characteristic = null;

    noble.on('discover', function (peripheral) {
        // we found a peripheral, stop scanning
        // noble.stopScanning();

        //
        // The advertisment data contains a name, power level (if available),
        // certain advertised service uuids, as well as manufacturer data,
        // which could be formatted as an iBeacon.
        //
        console.log('found peripheral:', peripheral.advertisement);
        //
        // Once the peripheral has been discovered, then connect to it.
        // It can also be constructed if the uuid is already known.
        ///
        peripheral.connect(function (err) {
            //
            // Once the peripheral has been connected, then discover the
            // services and characteristics of interest.
            //
            peripheral.discoverServices([FT_SERVICE_UUID], function (err, services) {
                services.forEach(function (service) {
                    //
                    // This must be the service we were looking for.
                    //
                    console.log('found service:', service.uuid);

                    //
                    // So, discover its characteristics.
                    //
                    service.discoverCharacteristics([], function (err, characteristics) {

                        characteristics.forEach(function (characteristic) {
                            //
                            // Loop through each characteristic and match them to the
                            // UUIDs that we know about.
                            //
                            console.log('found characteristic:', characteristic.uuid);

                            if (FT_DATA_CHARACTERISTIC_UUID == characteristic.uuid) {
                                data_characteristic = characteristic;
                            } else if(FT_CONTROL_CHARACTERISTIC_UUID == characteristic.uuid) {
                                control_characteristic = characteristic;
                            }
                        })

                        //
                        // Check to see if we found all of our characteristics.
                        //
                        if (data_characteristic && control_characteristic) {
                            pubnub_base.resp_for_get_ready(data_characteristic, control_characteristic);
                            // sendData();
                        }
                        else {
                            console.log('No firmware update characteristic found');
                        }
                    })
                })
            })
        })
    })

    function sendData() {
        var data = new Buffer('this is message from amit');
        // crust.writeUInt8('amit', 0);
        commCharacteristic.write(data, false, function (err) {
            if (err) {
                console.log(err);
            }
        })
    }

}