/**
 * Created by amit on 28/11/16.
 */

var globals = require("../globals"),
    eventEmitter = globals.eventEmitter,
    open_ports = require("../model/open_ports");

module.exports = function (app, io) {
    var gw_nsp = io.of("/");
    gw_nsp.on("connection", function (socket) {
        socket.on("open_ports_data", function (open_ports_data) {
                console.log("open ports data received");
                console.log(open_ports_data);
                open_ports.findOne({"uuid": open_ports_data.uuid}, function (err, uuid) {
                    if (err) {
                        console.log("error : finding uuid while updating open ports");
                    } else if (uuid) {
                        open_ports.findOneAndUpdate({"uuid": open_ports_data.uuid},
                            {"open_ports": open_ports_data.open_ports}, function (err) {
                                if (err) {
                                    console.log("error : updating open ports");
                                }
                            })
                    } else {
                        var open_ports_doc = new open_ports(open_ports_data);
                        open_ports_doc.save(function (err) {
                            if (err) {
                                console.log("error : inserting new record of open ports of a gateway");
                            }
                        })
                    }
                })
            }
        )
    })

    app.get("/port_monitoring", function (req, res) {
        if (req.session.email) {
            open_ports.find({"email": req.session.email}, function (err, open_ports_data) {
                if(err){
                    console.log("error : fetching open ports data");
                } else {
                    res.render('port_monitoring.ejs', {user: req.session.email, "open_ports_data": open_ports_data});
                }
            });
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    });
}
