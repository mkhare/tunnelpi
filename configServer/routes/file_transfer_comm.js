/**
 * Created by amit on 10/8/16.
 */

var gw_sockets = require('../model/gw_sockets');

module.exports = FT_Comm;
function FT_Comm(sgw_info, dgw_info, sock) {
    this.sock = sock;
    this.sgw_info = sgw_info;
    this.dgw_info = dgw_info;
}

FT_Comm.prototype.file_transfer_init = function() {
    var data = {sgw: this.sgw_info.uuid};
    this.sock.emit('ft_init_cmd_frm_server', data);
    console.log("init command sent to gateway");

    // socket.on()
}
