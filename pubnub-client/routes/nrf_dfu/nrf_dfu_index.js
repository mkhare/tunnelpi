var noble = require('noble'),
    request = require("request"),
    fs = require('fs');
var http = require('http');
var fileUtils = require('./file_utils');
var crc = require('crc');
var littleEndianUtils = require('./little_endian_utils'),
    proj_config = require('../../proj_config');

module.exports = function () {

    var dfuTargService = '0000fe5900001000800000805f9b34fb';
    var dfuControlpointCharacteristicUuid = '8ec90001f3154f609fb8838830daea50';
    var dfuPacketCharacteristicUuid = '8ec90002f3154f609fb8838830daea50';

    var server_url = 'http://localhost:8888/';

    const CONTROL_OPCODES = {
        CREATE: 0x01,
        SET_PRN: 0x02,
        CALCULATE_CHECKSUM: 0x03,
        EXECUTE: 0x04,
        SELECT: 0x06,
        RESPONSE_CODE: 0x60,
    };

    const CONTROL_PARAMETERS = {
        COMMAND_OBJECT: 0x01,
        DATA_OBJECT: 0x02,
    };


    var dfuTargServiceData = null;
    var dfuControlpointCharacteristicData = null;
    var dfuPacketCharacteristicData = null;

    let imageBuf;

    var all_pps = [];
    var latest_index = 0;
    var peripheralsData = []
    var peripheralToPass;

    startScanningAndGetPeripheral();

    function startScanningAndGetPeripheral() {
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {
                console.log('scanning...');
                noble.startScanning();
            }
            else {
                noble.stopScanning();
            }
        });

        noble.on('discover', function (peripheral) {
            console.log("found")
            all_pps.push({
                "email": "amit@gmail.com",
                "gw_uuid": "2",
                "pp_id": peripheral.id,
                "pp_name": peripheral.advertisement.localName
            });
            peripheralsData.push(peripheral);
        })

        setInterval(sendPeripheralData, 10000);

        var intervalId = setInterval(function () {
            request.post({
                "url": server_url + "dfu_gw/get_pp_id", "form": {
                    "email": proj_config.set1.email,
                    "gw_uuid": proj_config.set1.uuid
                }
            }, function (err, res, body) {
                if (err) {
                    console.log("Error: getting peripheral ID");
                    return;
                }
                console.log("body: ", body);
                if (is_json(body)) {
                    var idToCheck = JSON.parse(body).pp_id;
                    peripheralsData.forEach(function (peripheral) {
                        console.log("peripheral id:", peripheral.id)
                        if (peripheral.id == idToCheck) {
                            console.log("andar aagya mai")
                            sendStatus(20, "DFU task started");
                            clearInterval(intervalId);
                            peripheralToPass = peripheral;
                            var file = fs.createWriteStream('zippy.zip');
                            var request = http.get(server_url + "dfu_gw/get_dfu_file", function (response) {
                                response.pipe(file);
                                file.on('finish', function () {
                                    file.close(function () {
                                        unZipFile('zippy.zip', peripheralToPass);
                                        sendStatus(40, "DFU file recieved on gateway");
                                    });
                                });
                            }).on('error', function (err) { // Handle errors
                                fs.unlink(dest); // Delete the file async. (But we don't check the result)
                            });
                        }
                    })
                }
            })
        }, 10000)
    }

    function sendPeripheralData() {
        if (all_pps.length != latest_index) {
            console.log("sending data")
            request.post({
                url: server_url + "dfu_gw/gw_pps_scan_res",
                form: {gw_pps_details: all_pps.slice(latest_index)}
            }, function (err, httpResponse, body) {
                if (err) console.log(err)
            })
            latest_index = all_pps.length;
            console.log("Sending scan data to server");
        }
    }

    function is_json(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function unZipFile(fileName, peripheral) {
        var result = fileUtils.unZip(fileName);
        if (result)
            if (result[0].substr(result[0].length - 3, result[0].length) == "dat") {
                noble.stopScanning();
                console.log("dfu start 1");
                sendStatus(50, "DFU file unzipped");
                doDfu(result[0], result[1], peripheral)
            }
            else {
                console.log("dfu start 2");
                noble.stopScanning();
                sendStatus(50, "DFU file unzipped");
                doDfu(result[1], result[0], peripheral)
            }
        else
            console.log("Error")
    }


    function doDfu(datFile, binFile, peripheral) {

        peripheral.connect(function (err) {
            console.log("connected")
            sendStatus(60, "Connected to peripheral");
            peripheral.discoverServices(['fe59'], function (err, services) {
                console.log("found dfu service");
                services.forEach(function (service) {
                    console.log('Found service:', service.uuid);
                    dfuTargServiceData = service;
                    service.discoverCharacteristics([], function (err, characteristics) {
                        characteristics.forEach(function (characteristic) {
                            console.log('Found characteristic:', characteristic.uuid);
                            if (dfuControlpointCharacteristicUuid == characteristic.uuid) {
                                dfuControlpointCharacteristicData = characteristic;
                            }
                            else if (dfuPacketCharacteristicUuid == characteristic.uuid) {
                                dfuPacketCharacteristicData = characteristic;
                            }
                            if (dfuPacketCharacteristicData && dfuControlpointCharacteristicData) {
                                sendStatus(80, "DFU services and characteristics found");
                                dfuControlpointCharacteristicData.notify(true, function (error) {
                                    console.log('Notification on');
                                    dfuControlpointCharacteristicData.write(new Buffer([CONTROL_OPCODES.SET_PRN, 0x00, 0x00]), true, function (error) {
                                        if (error) {
                                            console.log('Error')
                                        }
                                        else {
                                            console.log("Written PRN");
                                            fileUtils.parseBinaryFile(`./tmp/` + datFile)
                                                .then((result) => {
                                                    expectedCRC = crc.crc32(result);
                                                    console.log(expectedCRC);
                                                    sendData(dfuPacketCharacteristicData, result)
                                                        .then(() => {
                                                            sendStatus(90, "Firmware installation started");
                                                            dfuControlpointCharacteristicData.write(new Buffer([CONTROL_OPCODES.CALCULATE_CHECKSUM]), true, function (error) {
                                                                console.log(".dat File Sent");
                                                                dfuControlpointCharacteristicData.write(new Buffer([CONTROL_OPCODES.EXECUTE]), true, function (error) {
                                                                    console.log("Execute Cmmd in Notification");
                                                                    dfuControlpointCharacteristicData.write(new Buffer([CONTROL_OPCODES.SELECT, CONTROL_PARAMETERS.DATA_OBJECT]), true, function (error) {
                                                                        console.log("Select Cmmd in Notification");
                                                                        fileUtils.parseBinaryFile(`./tmp/` + binFile)
                                                                            .then((result) => {
                                                                                console.log(".bin File parsed");
                                                                                imageBuf = result;
                                                                                console.log(imageBuf.length);
                                                                                dfuControlpointCharacteristicData.write(new Buffer([CONTROL_OPCODES.CREATE, CONTROL_PARAMETERS.DATA_OBJECT, 0x0, 0x10, 0x0, 0x0]), true, function (error) {
                                                                                    console.log("Create Cmmd Sent");
                                                                                    sendData(dfuPacketCharacteristicData, imageBuf.slice(0, 0x1000))
                                                                                        .then(() => {
                                                                                            function checkFileStatus() {
                                                                                                expectedCRC = crc.crc32(imageBuf.slice(0, 0x1000));
                                                                                                console.log(expectedCRC);
                                                                                                imageBuf = imageBuf.slice(0x1000);
                                                                                                if (imageBuf.length !== 0) {
                                                                                                    sendData(dfuPacketCharacteristicData, imageBuf.slice(0, 0x1000))
                                                                                                        .then(() => {
                                                                                                            checkFileStatus();
                                                                                                        })
                                                                                                }
                                                                                                else {
                                                                                                    console.log(".bin File Sent");
                                                                                                    console.log("Done Execution");
                                                                                                    sendStatus(100, "Firmware update completed");
                                                                                                    console.log(dfuPacketCharacteristicData)
                                                                                                    peripheral.disconnect(function (error) {
                                                                                                        console.log('disconnected from peripheral: ' + peripheral.uuid);
                                                                                                    });
                                                                                                }
                                                                                            }

                                                                                            checkFileStatus();
                                                                                        });
                                                                                });
                                                                            });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    }

    function sendData(characteristic, buffer) {
        return new Promise((resolve, reject) => {
            if (buffer.length <= 0) {
                resolve();
            }
            else {
                characteristic.write(littleEndianUtils.littleEndian(buffer.slice(0, 20)), true, function (error) {
                    if (error) {
                        console.log('Error')
                    }
                    else {
                        sendData(characteristic, buffer.slice(20))
                            .then(() => {
                                resolve();
                            })
                    }
                });
            }
        });
    }

    function sendStatus(per, msg) {
        if (per == 100) {
            startScanningAndGetPeripheral();
        }
        request.post({
            url: server_url + "dfu_gw/task_progress",
            form: {
                progress_pcnt: per,
                progress_msg: msg
            }
        }, function (err, httpResponse, body) {
            if (err) console.log(err)
        })
    }
}


