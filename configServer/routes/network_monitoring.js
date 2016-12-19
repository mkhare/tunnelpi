/**
 * Created by amit on 25/11/16.
 */
var globals = require('../globals');
var eventEmitter = globals.eventEmitter;
var config = require("../config/config");
var pubnub = globals.pubnub;

module.exports = function (app, io) {

    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var ObjectId = require('mongodb').ObjectID;
    var url = config.dburl,
        proj_config = require("../proj_config");

    var ut_channel = proj_config.netmon.ut_channel,
        ut_data_col = config.ut_data_col,
        ut_ad_count_col = config.ut_ad_count_col;

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }


    var subscribe_to_ut_data = function (db) {

        pubnub.subscribe({
            channel: ut_channel,
            callback: ut_data_recvd
        });

        function ut_data_recvd(ut_data) {
            console.log("Data recvd over pubnub");
            if (IsJsonString(ut_data.ut_data_string)) {
                var doc = JSON.parse(ut_data.ut_data_string);
                if (doc.AdvA != undefined) {
                    doc.timestamp = ut_data.timestamp;
                    doc.email = ut_data.email;
                    doc.gw_uuid = ut_data.gw_uuid;
                    db.collection(ut_data_col).insertOne(doc, function (err, result) {
                        assert.equal(err, null);
                        //console.log("Inserted a document into the ut_data_col collection.");
                    });

                    db.collection(ut_ad_count_col).updateOne(
                        {"AdvA": doc.AdvA, "email": doc.email, "uuid": doc.gw_uuid},
                        {$inc: {"counter": 1}},
                        {upsert: true},
                        function (err, results) {
                            if (err) {
                                console.log("Error: updateing count in collection ut_ad_count_col");
                            }
                        }
                    );
                }
            }
        }
    }

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);

        subscribe_to_ut_data(db);
        browser_requests(db);
    });

    var aggregate_data_count = function (db,email, field, callback) {
        db.collection(ut_data_col).aggregate(
            [
                {$match: {"email": email}},
                {$group: {"_id": field, "count": {$sum: 1}}}
            ]).toArray(function (err, result) {
            assert.equal(err, null);
            console.log(result);
            callback(result);
        });
    };

    var aggregate_data_match_count = function (db, callback) {
        db.restaurants.aggregate(
            [
                {$match: {"borough": "Queens", "cuisine": "Brazilian"}},
                {$group: {"_id": "$address.zipcode", "count": {$sum: 1}}}
            ]
        );

    }

    function browser_requests(db) {
        app.get("/network_monitoring", function (req, res) {
            if(req.session.email) {
                res.render("network_monitoring.ejs");
            } else {
                res.render("index");
            }
        })

        app.get("/jquery-2.1.1.min.js", function (req, res) {
            res.sendFile('/jquery-2.1.1.min.js', {root: __dirname});
        })

        app.get("/Chart.js", function (req, res) {
            res.sendFile('/Chart.js', {root: __dirname});
        })

        app.get("/adv_validity_full", function (req, res) {
            aggregate_data_count(db, req.session.email, "$validity", function (results) {
                res.json(results);
            })
        });

        app.get("/adv_channel_index_full", function (req, res) {
            aggregate_data_count(db, req.session.email, "$Channel_index", function (results) {
                res.json(results);
            })
        });

        app.get("/adv_addr_types_full", function (req, res) {
            aggregate_data_count(db, req.session.email, "$addr_type", function (results) {
                res.json(results);
            })
        })

        app.get("/adv_types_full", function (req, res) {
            aggregate_data_count(db, req.session.email, "$Type", function (results) {
                res.json(results);
            })
        })

        app.get("/get_addr_freqs", function (req, res) {
            db.collection(ut_ad_count_col).find({"email": req.session.email}).toArray(function (err, documents) {

                res.json(documents);
            });
        })

        app.post("/get_AdvA_details", function (req, res) {
            var addr = req.body.AdvA;

            var summary_data = {};
            db.collection(ut_data_col).aggregate(
                [
                    {$match: {"AdvA": addr, "email": req.session.email}},
                    {$group: {"_id": "$Channel_index", "count": {$sum: 1}}}
                ]).toArray(function (err, results) {
                if (err) {
                    console.log("Error: finding address details : channel index");
                } else {
                    summary_data.channel_index_pie = results;
                    db.collection(ut_data_col).aggregate(
                        [
                            {$match: {"AdvA": addr}},
                            {$group: {"_id": "$Type", "count": {$sum: 1}}},
                        ]).toArray(function (err, results) {
                        if (err) {
                            console.log("Error: finding address details : channel index");
                        } else {
                            summary_data.adv_type = results
                            db.collection(ut_data_col).aggregate(
                                [
                                    {$match: {"AdvA": addr}},
                                    {$group: {"_id": "$addr_type", "count": {$sum: 1}}}
                                ]).toArray(function (err, results) {
                                if (err) {
                                    console.log("Error: finding address details : channel index");
                                } else {
                                    summary_data.addr_type = results;
                                    console.log(JSON.stringify(summary_data));
                                    res.json(summary_data);
                                }
                            });
                        }
                    });
                }
            });
        })
    }
}