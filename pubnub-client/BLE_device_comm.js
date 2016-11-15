/**
 * Created by amit on 31/8/16.
 */

var proj_config = require('./proj_config');
var globals = require('./globals');
var gw_util = require("./gw_util.js");
var pubnub_base = require("./pubnub_base.js");
var noble = globals.noble;
var eventEmitter = globals.eventEmitter;
var socket = globals.sockio;

var connected_peripherals = {};
eventEmitter.on('server_connected_to_gw', function (_) {
    console.log("eventEmitter on : gw_connected to server");
    for (var pid in connected_peripherals) {
        peripheral_data = gw_util.build_peripheral_data(connected_peripherals[pid]);
        socket.emit("upload_peripheral_data", peripheral_data);
    }
});

var FT_SERVICE_UUID = proj_config.ble_values.FT_SERVICE_UUID;
var FT_DATA_CHARACTERISTIC_UUID = proj_config.ble_values.FT_DATA_CHARACTERISTIC_UUID;
var FT_CONTROL_CHARACTERISTIC_UUID = proj_config.ble_values.FT_CONTROL_CHARACTERISTIC_UUID;
var FT_CONTROL_FVERSION_UUID = proj_config.ble_values.FT_CONTROL_FVERSION_UUID;
var FT_CONTROL_FUPACKETS_RECV_STATUS_UUID = proj_config.ble_values.FT_CONTROL_FUPACKETS_RECV_STATUS_UUID;

module.exports = BLE_device_comm;

function BLE_device_comm(pp) {
    this.peripheral = pp;

    this.data_characteristic = null;
    this.control_characteristic = null;
    this.version_characteristic = null;
    this.fu_packets_characteristic = null;
}

BLE_device_comm.prototype.restart_scanning = function () {
    noble.stopScanning();
    noble.startScanning([FT_SERVICE_UUID], false);
}

BLE_device_comm.prototype.start_scanning = function () {
    noble.startScanning([FT_SERVICE_UUID], false);
}

BLE_device_comm.prototype.event_listeners = function () {
    var self = this;
    var peripheral_uuid = self.peripheral.uuid;

    this.new_firmware_available_event_listener = function (pp) {
        if (pp == peripheral_uuid || pp == proj_config.set1.all_peripherals) {
            pubnub_base.send_firmware_file_to_ble_devices(data_characteristic, control_characteristic, version_characteristic, fu_packets_characteristic, peripheral_uuid);
        }
    };
    this.peripheral_disconnected_event_listener = function () {
        console.log('event : peripheral disconnected, uuid : ' + peripheral_uuid);
        eventEmitter.removeListener("new_firmware_available", this.event_listeners().new_firmware_available_event_listener);
        this.remove_peripheral_from_list();
        var peripheral_data = gw_util.build_peripheral_data(self.peripheral);
        socket.emit("peripheral_disconnected", peripheral_data);
        this.restart_scanning();
    }
}

BLE_device_comm.prototype.upload_peripheral_data = function () {
    var self = this;
    var peripheral_data = gw_util.build_peripheral_data(self.peripheral);
    socket.emit("upload_peripheral_data", peripheral_data);
};

BLE_device_comm.prototype.remove_peripheral_from_list = function () {
    if (self.peripheral.uuid in connected_peripherals) {
        delete connected_peripherals[self.peripheral.uuid];
        console.log("peripheral entry deleted from connected_peripherals array");
    }
}

BLE_device_comm.prototype.valid_peripheral_found = function () {
    var self = this;
    if (self.peripheral.uuid in connected_peripherals) {
        console.log("success : peripheral already exists")
    } else {
        connected_peripherals[self.peripheral.uuid] = self.peripheral;
        console.log("success : peripheral added into the list")
    }
    self.upload_peripheral_data();
};

BLE_device_comm.prototype.connect_peripheral = function (ble_device_comm) {
    var self = ble_device_comm;

    self.peripheral.once('disconnect', this.event_listeners.peripheral_disconnected_event_listener);

    self.peripheral.connect(function (err) {
        if (err) {
            console.log("error : connecting peripheral " + self.peripheral.uuid);
            this.restart_scanning();
        }
        this.start_scanning();

        self.peripheral.discoverServices([FT_SERVICE_UUID], function (err, services) {
            services.forEach(function (service) {
                console.log('found service:', service.uuid);
                service.discoverCharacteristics([], function (err, characteristics) {
                    characteristics.forEach(function (characteristic) {

                        console.log('found characteristic:', characteristic.uuid);
                        if (FT_DATA_CHARACTERISTIC_UUID == characteristic.uuid) {
                            self.data_characteristic = characteristic;
                        } else if (FT_CONTROL_CHARACTERISTIC_UUID == characteristic.uuid) {
                            self.control_characteristic = characteristic;
                        } else if (FT_CONTROL_FVERSION_UUID == characteristic.uuid) {
                            self.version_characteristic = characteristic;
                        } else if (FT_CONTROL_FUPACKETS_RECV_STATUS_UUID == characteristic.uuid) {
                            self.fu_packets_characteristic = characteristic;
                        }
                    });

                    if (self.data_characteristic && self.control_characteristic && self.version_characteristic && self.fu_packets_characteristic) {
                        self.valid_peripheral_found();

                        var peripheral_uuid = self.peripheral.uuid;
                        console.log("peripheral uuid : " + peripheral_uuid);

                        //todo : already connected devices
                        // eventEmitter.on('new_firmware_available', this.event_listeners.new_firmware_available_event_listener);
                    }
                    else {
                        console.log('No firmware update characteristic found');
                        self.peripheral.disconnect();
                    }
                })
            })
        });
    });

}
