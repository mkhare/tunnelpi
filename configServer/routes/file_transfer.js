/**
 * Created by amit on 5/8/16.
 */

var loginModules = require('./loginModules');
var gw_sockets = require('../model/gw_sockets');
var FT_Comm = require('./file_transfer_comm');
var socket_manager = require('./socket_manager');
var ft_log = require('../model/ft_log');
var logger = require('./logger');

module.exports = function (app, eventEmitter, io) {
    var ftnsp = io.of("/ftnsp");

    ftnsp.on("connection", function (socket) {
        console.log("connected to ftnsp socket");

        socket.on('beFTconnect', function (data) {
            socket_manager.add_browser_socket_to_db(socket, data.user);
            ft_log.find({email: data.user}, function (err, mongodata) {
                if (err) {
                    console.log("error finding log data");
                    return;
                }
                socket.emit('old_log_data', {logs: mongodata});
            });

            eventEmitter.on('beft_logdata', function (ft_logdata) {
                if (data.user == ft_logdata.email) {
                    socket.emit('beft_logdata', ft_logdata);
                }
            })

        });

        socket.on('disconnect', function (data) {
            socket_manager.remove_browser_socket_from_db(socket);
        });
    })

    app.get('/file_transfer_home', function (req, res) {
        if (req.session.email) {
            res.render('file_transfer_home.ejs', {user: req.session.email});
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    app.get('/file_transfer_init', function (req, res) {
        if (req.session.email) {
            res.render('file_transfer_home.ejs', {});
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    app.post('/file_transfer_init', function (req, res) {
        if (req.session.email) {
            res.sendStatus(200);
            var sourcegw = req.body.sourcegw;
            var destgw = req.body.destgw;
            var arr = destgw.split(',');
            for (var i in arr) {
                arr[i] = arr[i].trim();
                file_transfer_check(sourcegw, arr[i], req.session.email);
            }

            // eventEmitter.emit('ft_send_init_cmd', {sgw : sourcegw, dgw : arr});
            // loginModules.logincheck(req.session, res, null);
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    function file_transfer_check(sgw, dgw, email) {
        gw_sockets.find({uuid: sgw}, function (err, sgw_info) {
            if (err || sgw_info.length > 1) {
                console.log('error : source gateway not online.');
            } else {
                gw_sockets.find({uuid: dgw}, function (err, dgw_info) {
                    if (err || dgw_info.length > 1) {
                        console.log('error : destination gateway ' + dgw + ' not online.');
                    } else {
                        var temp1 = sgw_info[0];
                        var temp2 = dgw_info[0];
                        if (typeof temp1 !== 'undefined' && temp1 && typeof temp2 !== 'undefined' && temp2) {
                            var sock = io.sockets.sockets[sgw_info[0].sock_id];
                            var ft_comm = new FT_Comm(sgw_info[0], dgw_info[0], sock, io);
                            ft_comm.file_transfer_init();
                            // file_transfer_init(sgw_info[0], dgw_info[0]);
                        } else {
                            logger.ft_logger(email, sgw, dgw, "unable to update firmware, please try again");
                        }
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