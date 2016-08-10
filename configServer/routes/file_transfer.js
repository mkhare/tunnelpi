/**
 * Created by amit on 5/8/16.
 */

var loginModules = require('./loginModules');
var gw_sockets = require('../model/gw_sockets');
var FT_Comm = require('./file_transfer_comm');

module.exports = function (app, eventEmitter, io) {
    app.get('/file_transfer_home', function (req, res) {
        if (req.session.email) {
            res.render('file_transfer_home.ejs', {});
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    app.get('/file_transfer_init', function (req, res) {
        if(req.session.email){
            res.render('file_transfer_home.ejs', {});
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    app.post('/file_transfer_init', function (req, res) {
        if (req.session.email) {
            var sourcegw = req.body.sourcegw;
            var destgw = req.body.destgw;
            var arr = destgw.split(',');
            for (var i in arr) {
                arr[i] = arr[i].trim();
                file_transfer_check(sourcegw, arr[i]);
            }
            
            // eventEmitter.emit('ft_send_init_cmd', {sgw : sourcegw, dgw : arr});
            // loginModules.logincheck(req.session, res, null);
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    function file_transfer_check(sgw, dgw) {
        gw_sockets.find({uuid: sgw}, function (err, sgw_info) {
            if (err || sgw_info.length > 1) {
                console.log('error : source gateway not online.');
            } else {
                gw_sockets.find({uuid: dgw}, function (err, dgw_info) {
                    if (err || dgw_info.length > 1) {
                        console.log('error : destination gateway ' + dgw + ' not online.');
                    } else {
                        var sock = io.sockets.sockets[sgw_info[0].sock_id];
                        var ft_comm = new FT_Comm(sgw_info[0], dgw_info[0], sock);
                        ft_comm.file_transfer_init();
                        // file_transfer_init(sgw_info[0], dgw_info[0]);
                    }
                })
            }
        });
    }

    // function file_transfer_init(sgw, dgw) {
    //     var socket = io.sockets.sockets[sgw.sock_id];
    //     var data = {sgw: sgw.uuid};
    //     socket.emit('ft_init_cmd_frm_server', data);
    //     console.log("init command sent to gateway");
    //
    //     // socket.on()
    // }
};