/**
 * Created by amit on 27/12/16.
 */
//todo: make a separate table for completed tasks ( it will improve the performance)
    // todo: make a separate collection for gw_pps_new
    //todo: timestamp can be used to arrange the pps in response

var multer = require("multer");

var gw_state_col = require("../model/gw_state_col"),
    gw_pps_all = require("../model/gw_pps_all"),
    dfu_pending_tasks_col = require("../model/dfu_pending_tasks_col"),
    dfu_files_info_col = require("../model/dfu_files_info_col");

var debug_data = {
    email: "amit@gmail.com",
    gw_uuid: "2",
    pp_id: "abcdefgh"
}

module.exports = function (app) {

    //**************************test area*************************************


    // var test_task = {
    //     "email": debug_data.email,
    //     "gw_uuid": debug_data.gw_uuid,
    //     "pp_id": debug_data.pp_id,
    //     "file_path": "../fw_files/abc.png",
    //     "progress": "-1"
    // };
    //
    // dfu_pending_tasks_col.update(test_task, test_task, {upsert: true}, function(err){
    //     if(err){
    //         console.log("Error: inserting test task in db");
    //         return;
    //     }
    // });
    //
    // var test_file_info = {
    //     "email": debug_data.email,
    //     "file_path": test_task.file_path
    // }
    //
    // dfu_files_info_col.update(test_file_info, test_file_info, {upsert: true}, function(err){
    //     if(err){
    //         console.log("Error: inserting dfu test file info in db");
    //         return;
    //     }
    // });

    //***************************************************************

    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, __dirname + '/fw_files');
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });
    var upload = multer({storage: storage});

    app.get("/dfu", function(req, res){
        // if(req.session.email){
            res.render("dfu.ejs");
        // } else {
        //     res.render("index");
        // }
    })

    app.get("/dfu/get_online_gws", function (req, res) {
        console.log("Request: Get online gateways");
        gw_state_col.find({
            "email": debug_data.email,
            "gw_state": "1"
        }, "gw_uuid -_id", function (err, online_gws) {
            if (err) {
                console.log("Error: dfu: getting online gws");
                return;
            }
            res.json(online_gws);
        })
    })

    app.post("/dfu/get_gw_pps_details", function (req, res) {
        var search_query = {
            "email": debug_data.email,
            "gw_uuid": debug_data.gw_uuid
        }
        gw_pps_all.find(search_query, 'pp_id pp_name -_id', function (err, gw_pps_details) {
            if (err) {
                console.log("Error: dfu: getting peripherals details");
                return;
            }
            res.json(gw_pps_details);
        })
    });

    app.post("/dfu/pp_id_and_file", upload.single("userPhoto"), function (req, res) {
        // if (req.session.email) {
        // if (req.session.email == gw_info.email) {
        console.log("pp_id received: " + req.body.pp_id_arr);
        var query = {
            email: debug_data.email,
            gw_uuid: req.body.gw_uuid,
        };

        var pp_id_arr = JSON.parse(req.body.pp_id_arr);
        console.log("pp_id_arr: ", pp_id_arr.length);
        for(var i = 0; i < pp_id_arr.length; i++) {
            query["pp_id"] = pp_id_arr[i].pp_id;
            var updated_data = JSON.parse(JSON.stringify(query));
            updated_data.file_name = req.file.originalname;
            dfu_pending_tasks_col.update(query, updated_data, {upsert: true}, function (err) {
                if (err) {
                    console.log("Error: updating pending tasks column");
                    return;
                }
                console.log("Updated task into task col");
            })
        }
        res.sendStatus(200);
        //     }
        // } else {
        //     res.render("index");
        // }
    });

    app.post("/dfu/progress_update", function(req, res){
        var gw_uuid = req.body.gw_uuid;
        var pp_id_arr = req.body.pp_id_arr;

        var tasks_progress = [];

        for(var i = 0; i < pp_id_arr.length; i++){
            var pp_id = pp_id_arr[i].pp_id;
            var query = {"gw_uuid": gw_uuid, "pp_id": pp_id};
            dfu_pending_tasks_col.findOne(query, function(err, task_details){
                if(err){
                    console.log("Error: getting progress from db", err);
                    return;
                }
                if(task_details) {
                    tasks_progress.push({
                        "pp_id": pp_id,
                        "progress_pcnt": task_details.progress_pcnt,
                        "progress_msg": task_details.progress_msg
                    })
                }
                if (i == pp_id_arr.length) {
                    res.json(tasks_progress);
                }
            });

        }
    })

    // app.post("/dfu/pp_id_and_file", upload.single("fw_file"), function (req, res) {
    //     // if (req.session.email) {
    //     // if (req.session.email == gw_info.email) {
    //     console.log("pp_id received: " + req.body.pp_id);
    //
    //     res.sendStatus(200);
    //     //     }
    //     // } else {
    //     //     res.render("index");
    //     // }
    // });

}