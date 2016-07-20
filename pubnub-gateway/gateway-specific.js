module.exports = function(){
	var pubnub_base = require('./pubnub_base');
	require('./serverapp')();
	pubnub_base.subscribe_data();
	pubnub_base.send_server_url();
}