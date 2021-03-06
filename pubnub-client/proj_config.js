module.exports = {
    set1: {
        configserver: 'http://localhost:8888/',
        uuid: '2',
        email: 'amit@gmail.com',
        password: 'abc',
        publish_key: 'pub-c-b032ad96-906e-4a98-94b9-4b5e76ccd4e2',
        subscribe_key: 'sub-c-c90fa6ea-38a2-11e6-bbf4-0619f8945a4f',
        channel_name: 'hello',
        eurekapi_key: 'SAK43B4A9ET54EVDVP3Z',
        serverport: 9999,
        firmware_file_path: __dirname + "/public/ff",
        firmware_update_channel: "firmware_update_data_channel",
		firmware_update_req_channel : "firmware_update_req_channel",
        firmware_update_resp_channel : "firmware_update_resp_channel",
        file_transfer_packet_size : 20,
        firmware_version : 2,
        max_BLE_connections : 4,
        all_peripherals : "-1",
        max_simultaneous_conns : 3
    },
    netmon: {
        ut_channel : "ut_data_channel"
    },
    codes : {
        success : 1,
        failure : 2,
        blank : 3,
        new_firmware_available : 4,
        delete_old_file : 5,
        get_no_of_packets_received_by_BLEdevice : 6
    },
    pb_codes : {
        success : 1,
        failure : 2,
        blank : 3,
        req_ready_for_ft : 4,
        update_finished : 5
    },
    ble_values : {
        FT_SERVICE_UUID : '12ab',
        FT_DATA_CHARACTERISTIC_UUID : '34cd',
        FT_CONTROL_CHARACTERISTIC_UUID : '56ef',
        FT_CONTROL_FVERSION_UUID : '78ab',
        FT_CONTROL_FUPACKETS_RECV_STATUS_UUID : '21ab'
    }
}
