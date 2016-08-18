module.exports = {
    set1: {
        configserver: 'http://localhost:8888/',
        uuid: '1',
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
        firmware_version : 2
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
    }
}
