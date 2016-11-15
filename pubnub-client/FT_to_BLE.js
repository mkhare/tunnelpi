/**
 * Created by amit on 4/8/16.
 */

var pubnub_base = require('./pubnub_base');
var proj_config = require('./proj_config');
var app = require('./app');
var gw_util = require('./gw_util');
var BLE_device_comm = require('./BLE_device_comm');
var globals = require('./globals');
var noble = globals.noble;
var eventEmitter = globals.eventEmitter;
var socket = globals.sockio;

module.exports = function () {

    // var connected_peripherals = {};
    //
    var FT_SERVICE_UUID = '12ab';
    // var FT_DATA_CHARACTERISTIC_UUID = '34cd';
    // var FT_CONTROL_CHARACTERISTIC_UUID = '56ef';
    // var FT_CONTROL_FVERSION_UUID = '78ab';
    // var FT_CONTROL_FUPACKETS_RECV_STATUS_UUID = '21ab';

    noble.on('stateChange', function (state) {
        if (state === 'poweredOn') {
            console.log('scanning...');
            noble.startScanning([FT_SERVICE_UUID], false);
            // noble.startScanning([], true);
        } else {
            noble.stopScanning();
        }
    })

    // var data_characteristic = null;
    // var control_characteristic = null;
    // var version_characteristic = null;
    // var fu_packets_characteristic = null;

    // noble.on('scanStart', function () {
    //     console.log("event : scan started");
    // });
    // noble.on('scanStop', function () {
    //     console.log("event : scan stopped");
    //     setTimeout(function () {
    //         // noble.startScanning([FT_SERVICE_UUID], true);
    //         noble.startScanning([], true);
    //         console.log("start scanning");
    //     }, 1000);
    // })


    noble.on('discover', function (peripheral) {
        console.log('found peripheral:', peripheral.advertisement);
        var ble_device_comm = new BLE_device_comm(peripheral);
        // ble_device_comm.connect_peripheral(ble_device_comm);

        setInterval(ble_device_comm.connect_peripheral,1000, ble_device_comm);
        
        // peripheral.once('disconnect', function () {
        //     console.log('peripheral disconnected');
        //     if (peripheral.uuid in connected_peripherals) {
        //         delete connected_peripherals[peripheral.uuid];
        //         console.log("peripheral entry deleted from connected_peripherals array");
        //     }
        //     var peripheral_data = gw_util.build_peripheral_data(peripheral);
        //     socket.emit("peripheral_disconnected", peripheral_data);
        //     noble.stopScanning();
        // })

        // Once the peripheral has been discovered, then connect to it.
        // It can also be constructed if the uuid is already known.
        ///

        // peripheral.connect(function (err) {
        //
        //     peripheral.discoverServices([FT_SERVICE_UUID], function (err, services) {
        //         services.forEach(function (service) {
        //             console.log('found service:', service.uuid);
        //             service.discoverCharacteristics([], function (err, characteristics) {
        //                 characteristics.forEach(function (characteristic) {
        //                     //
        //                     // Loop through each characteristic and match them to the
        //                     // UUIDs that we know about.
        //                     //
        //                     console.log('found characteristic:', characteristic.uuid);
        //
        //                     if (FT_DATA_CHARACTERISTIC_UUID == characteristic.uuid) {
        //                         data_characteristic = characteristic;
        //                     } else if (FT_CONTROL_CHARACTERISTIC_UUID == characteristic.uuid) {
        //                         control_characteristic = characteristic;
        //                     } else if (FT_CONTROL_FVERSION_UUID == characteristic.uuid) {
        //                         version_characteristic = characteristic;
        //                     } else if (FT_CONTROL_FUPACKETS_RECV_STATUS_UUID == characteristic.uuid) {
        //                         fu_packets_characteristic = characteristic;
        //                     }
        //                 })
        //
        //                 //
        //                 // Check to see if we found all of our characteristics.
        //                 //
        //                 if (data_characteristic && control_characteristic && version_characteristic && fu_packets_characteristic) {
        //                     valid_peripheral_found(peripheral);
        //
        //                     var peripheral_uuid = peripheral.uuid;
        //                     console.log("peripheral uuid : " + peripheral_uuid);
        //                     eventEmitter.on('new_firmware_available', function (pp) {
        //                         if (pp == peripheral_uuid || pp == proj_config.set1.all_peripherals) {
        //                             pubnub_base.send_firmware_file_to_ble_devices(data_characteristic, control_characteristic, version_characteristic, fu_packets_characteristic, peripheral_uuid);
        //                         }
        //                     });
        //                     // sendData();
        //                 }
        //                 else {
        //                     console.log('No firmware update characteristic found');
        //                 }
        //             })
        //         })
        //     })
        // })
    })

    //if gw reconnects to the server
    // eventEmitter.on('server_connected_to_gw', function (_) {
    //     console.log("eventEmitter on : gw_connected to server");
    //     for (var pid in connected_peripherals) {
    //         peripheral_data = gw_util.build_peripheral_data(connected_peripherals[pid]);
    //         eventEmitter.emit("upload_peripheral_data", peripheral_data);
    //     }
    // });

    // function upload_peripheral_data(peripheral) {
    //     peripheral_data = gw_util.build_peripheral_data(peripheral);
    //     socket.emit("upload_peripheral_data", peripheral_data);
    // }
    //
    // function valid_peripheral_found(peripheral) {
    //     if (peripheral.uuid in connected_peripherals) {
    //         console.log("success : peripheral already exists")
    //     } else {
    //         connected_peripherals[peripheral.uuid] = peripheral;
    //         console.log("success : peripheral added into the list")
    //     }
    //
    //     upload_peripheral_data(peripheral);
    // }

    // function sendData() {
    //     var data = new Buffer('this is message from amit');
    //     commCharacteristic.write(data, false, function (err) {
    //         if (err) {
    //             console.log(err);
    //         }
    //     })
    // }

}