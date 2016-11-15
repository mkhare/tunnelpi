/**
 * Created by amit on 30/8/16.
 */

module.exports.build_gws_tagid = function (creds) {
    var tagid = creds.uuid + creds.subscribe_key + creds.publish_key + creds.channel_name + creds.email;
    tagid = tagid.toString().split('').reverse().join('');
    tagid = tagid.split('@').join('');
    tagid = tagid.split('.').join('');
    // console.log("event : uuid for gws from creds built : " + tagid);
    return tagid;
}

module.exports.build_pps_tagid = function (peripheral) {
    var tagid = peripheral.peripheral_uuid + peripheral.channel_name + peripheral.gw_uuid + peripheral.email;
    tagid = tagid.toString().split('').reverse().join('');
    tagid = tagid.split('@').join('');
    tagid = tagid.split('.').join('');
    // console.log("event : uuid for peripheral built : " + tagid);
    return tagid;
}