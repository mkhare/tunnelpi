/**
 * Created by amit on 26/12/16.
 */

var gw_pps_all = require("../model/gw_pps_all"),
    dfu_files_info_col = require("../model/dfu_files_info_col"),
    dfu_pending_tasks_col = require("../model/dfu_pending_tasks_col"),
    fs = require("fs"),
    dl = require("delivery");

var debug_data = {
    "email": "amit@gmail.com",
    "gw_uuid": "2"
}

module.exports = function (app, socket, gw_info) {

    app.post("/dfu_gw/gw_pps_scan_res", function(req, res){
        console.log("Data received: gateway peripheral scan response");
        var gw_pps_details = req.body.gw_pps_details;
        gw_pps_details.forEach(function (gw_pp_info) {
            gw_pps_all.findOneAndUpdate(gw_pp_info, gw_pp_info, {upsert: true}, function (err) {
                if (err) {
                    console.log("Error: Inserting new peripheral");
                    return;
                }
                console.log("New peripheral updated to db");
            });
        });
        console.log(JSON.stringify(gw_pps_details));
        res.sendStatus(200);
    });

    app.post("/dfu_gw/get_pp_id", function(req, res){
        if(req.body) {
            dfu_pending_tasks_col.findOne({
                "email": req.body.email,
                "gw_uuid": req.body.gw_uuid,
                "progress_pcnt": {$lt: 100}
            }, "pp_id _id", function (err, task) {
                if (err) {
                    console.log("Error: nrf_dfu_gw: fetching tasks from db");
                    return;
                }
                // res.json({"pp_id": task.pp_id});
                //res.json({"pp_id": "e85c8e4e719e"});
                // if(task) {
                    // res.json({"pp_id": task.pp_id, "task_id": task._id});
                    res.json(task)
                    console.log("Task sent to gateway: ", task);
                // } else {
                //     res.json({});
                // }
            })
        }
    });

    app.get("/dfu_gw/get_dfu_file", function (req, res) {
        console.log("dfu file request from gateway");
        dfu_pending_tasks_col.findOne({"_id": req.query.task_id}, "file_name", function (err, task_details) {
            if(err){
                console.log("Error: getting filename from db");
                return;
            }
            if(task_details) {
                res.sendFile(__dirname + "/fw_files/" + task_details.file_name);
            } else {
                console.log("Error: No task entry found for this task ID in db");
            }
        })
    });

    app.post("/dfu_gw/task_progress", function (req, res) {
        var query = {
            "_id": req.body.task_id
        }
        console.log("progress received from gateway: ", req.body);
        dfu_pending_tasks_col.findOne(query, function(err, task_details){
            if(err){
                console.log("Error: unable to update progress: task not found in collection");
                return;
            }
            if(task_details && task_details != "null" && parseInt(task_details.progress_pcnt) < parseInt(req.body.progress_pcnt)){
                dfu_pending_tasks_col.update(query, {"progress_pcnt": req.body.progress_pcnt}, function(err){
                    console.log("Error: updating the progress of task");
                    return;
                })
            }

        })
    })

/*
    var fw_file_no = 1;

    serve_dfu_task_list();

    // app.post("/nrf_dfu_file", function (req, res) {
    //     if (req.session.email) {
    //         if (req.session.email == gw_info.email) {
    //             var tmp_path = req.files.thumbnail.path;
    //             var target_path = '../fw_files/' + req.session.email + "_" + req.files.thumbnail.name;
    //             fs.rename(tmp_path, target_path, function (err) {
    //                 if (err) throw err;
    //                 fs.unlink(tmp_path, function () {
    //                     if (err) throw err;
    //                     var dfu_file_info = {
    //                         "email": req.session.email,
    //                         "target_path": target_path
    //                     };
    //
    //                     dfu_files_info_col.findOneAndUpdate(dfu_file_info, dfu_file_info, {upsert: true}, function (err) {
    //                         if (err) {
    //                             console.log("Error: Inserting new dfu file info");
    //                             return;
    //                         }
    //                         res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
    //                         deliver_file_to_gw(target_path);
    //                     })
    //                 });
    //             });
    //         }
    //     } else {
    //         res.render("index");
    //     }
    // });

    app.post("/get_dfu_file_from_server", function (req, res) {
        console.log("dfu file request from gateway");
        res.sendFile(__dirname + "/abc.png");
    })

    socket.on("gw_pps_scan_res", function (gw_pps_details) {
        console.log("Data received: gateway peripheral scan response");
        gw_pps_details.forEach(function (gw_pp_info) {
            gw_pps_all.findOneAndUpdate(gw_pp_info, gw_pp_info, {upsert: true}, function (err) {
                if (err) {
                    console.log("Error: Inserting new peripheral");
                    return;
                }
            });
        });
        console.log(JSON.stringify(gw_pps_details));
    });

    socket.on("get_fw_file", function(file_info, callback){
        console.log("Get firmware file request received: ", file_info);
        dfu_files_info_col.findOne({"email": gw_info.email, "file_path": file_info.file_path}, function (err, file_info_doc) {
            if(err){
                console.log("Error: getting file info from db");
                return;
            } else if(file_info_doc){
                deliver_file_to_gw(file_info.file_path);
                callback({ok: true});
            } else {
                console.log("File not present on server");
                callback({"error": true});
            }
        })
    })


    function serve_dfu_task_list() {
        dfu_pending_tasks_col.find({"email": debug_data.email, "gw_uuid": debug_data.gw_uuid}, function(err, dfu_tasks){
            if(err){
                console.log("Error: nrf_dfu_gw: fetching tasks from db");
                return;
            }

            console.log("Tasks list from db: ", dfu_tasks);
            var res_recvd = false;
            var intvl_id = setInterval(function () {
                socket.emit("dfu_tasks_list", dfu_tasks, function (data) {
                    if(data.ok){
                        console.log("DFU tasks list sent successfully");
                        if(res_recvd == false){
                            res_recvd = true;
                            clearInterval(intvl_id);
                            dfu_tasks.forEach(function(task){
                                dfu_pending_tasks_col.update(task, {"progress": "0"}, function(err){
                                    if(err){
                                        console.log("Error: updating pending tasks collection");
                                        return;
                                    }
                                })
                            })
                        }
                    }
                })
            })
        })
    }

    function deliver_file_to_gw(target_path) {
        console.log("File request received for ", target_path);
        delivery = dl.listen(socket);
        delivery.connect();
        var file_name = 'fw_file_' + fw_file_no;

        delivery.on('delivery.connect', function (delivery) {
            delivery.send({
                name: file_name,
                path: target_path
            });

            delivery.on('send.success', function (file) {
                console.log('File sent successfully!');
            });
        });
    }
    */
}