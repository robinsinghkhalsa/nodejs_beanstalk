'use strict';
var mongoose = require('mongoose');
var ShippingInfo = mongoose.model('ShippingInfo');
var fivebeans = require('fivebeans');

//var client = new fivebeans.client('158.69.78.165', 11300);



exports.add_shipping_info = function (req, res) {
    var client = new fivebeans.client(process.env.BEANSTALK_HOST, process.env.BEANSTALK_PORT);
    var insert = [];
    insert['requestId'] = req.body.requestId;
    insert['dateTime'] = req.body.dateTime;
    insert['from'] = req.body.from;
    insert['to'] = req.body.to;
    insert['type'] = req.body.type;
    insert['orders'] = JSON.stringify(req.body.orders);

    var new_info = new ShippingInfo(insert);
    new_info.save(function (err, task) {
        if (err) {
            res.send(err);
        } else {

            /**
             * Add in the beanstackd
             */

            var job = {
                type: 'j_type',
                payload: {
                    job: task,
                }
            };
            client.on('connect', function () {

//                client.stats_tube('default', function (err, response) {
//                    console.log(response);
//                    return false;
//                });

//                return false;

                var toEmail = req.body.to.replace("@", "+");
//                client.use(process.env.TUBE_PREFIX + 'shipping_tube', function (err, name) {
                client.use(process.env.TUBE_PREFIX + 'job_queue_' + toEmail, function (err, name) {
                    client.put(0, 0, 60, JSON.stringify([process.env.TUBE_PREFIX + toEmail, job]), function (err, jobid) {
                        console.log(jobid);

                        /**
                         * Return the response
                         */
                        res.json(job);
//                        res.json({'_id': task._id, 'message': 'Info Added'});
                    })
                })
            }).on('error', function (err) {
                console.log(err);
            }).on('close', function () {
                console.log('...Closing the tube...');
            }).connect();

            /**
             * Return the response
             */
//            res.json(task);
        }
    });
};
/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 * List beanstalk tubes
 */
exports.listTubes = function (req, res) {
    var client = new fivebeans.client(process.env.BEANSTALK_HOST, process.env.BEANSTALK_PORT);
    client
            .on('connect', function ()
            {
                client.list_tubes(function (err, tubenames) {
                    console.log(tubenames);
                    res.json({"tubes": tubenames});
                });

            })
            .on('error', function (err)
            {
                // connection failure
            })
            .on('close', function ()
            {
                // underlying connection has closed
            })
            .connect();
};
exports.beanworker = function (req, res) {
    var client = new fivebeans.client(process.env.BEANSTALK_HOST, process.env.BEANSTALK_PORT);
    var Beanworker = require('fivebeans').worker;

// Create a class to handle the work load
    class IndexHandler {
        constructor() {
            this.type = "j_type"; // Specify the type of job for this class to work on
        }

        // Define the work to perform and pass back a success
        work(payload, callback) {
            console.log(payload);
            /**
             * 
             * @type IndexHandler
             * Read the job and push into the processing tube
             */

            var job = {
                type: 'j_type',
                payload: {
                    job: payload,
                }
            };
//            console.log('payload-'+payload);
            client.on('connect', function () {
                client.use(process.env.TUBE_PREFIX + 'job_processing_queue', function (err, name) {
                    client.put(0, 0, 60, JSON.stringify([process.env.TUBE_PREFIX + 'job_processing_queue', job]), function (err, jobid) {
                        console.log(jobid);

                        /**
                         * Return the response
                         */
//                        res.json(job);
//                        res.json({'_id': task._id, 'message': 'Info Added'});
                    })
                })
            }).on('error', function (err) {
                console.log(err);
            }).on('close', function () {
                console.log('...Closing the processing queue tube...');
            }).connect();

            callback('success');
        }
    }
// Instantiate the class
    var handler = new IndexHandler();

// Set options
    var options = {
        id: 'worker_1', // The ID of the worker for debugging and tacking
        host: '127.0.0.1', // The host to listen on
        port: 11300, // the port to listen on
        handlers: {
            'j_type': handler // setting handlers for types
        },
        ignoreDefault: true
    };

    var worker = new Beanworker(options); // Instantiate a worker

    /***
     * List all tubes
     */
    client.on('connect', function () {
        client.list_tubes(function (err, tubenames) {
//            console.log(tubenames);return false;
            //Start the worker on array of tubes
//            worker.start([process.env.TUBE_PREFIX + 'job_queue_user+gmail.com','default']); // Listen on my_tube

//            for (var i = 0, len = tubenames.length; i < len; i++) {
//
//                client.stats_tube(tubenames[i], function (err, response) {
////                    console.log(response);
//
//                    
//                });
//            }

            var tubenames = tubenames.filter(function (e) {
                return e !== process.env.TUBE_PREFIX + 'job_processing_queue'
            });
            var tubenames = tubenames.filter(function (e) {
                return e !== process.env.TUBE_PREFIX + 'default'
            });

            worker.start(tubenames); // Listen on my_tube
            res.send({"message":"success"});
        });

    }).on('error', function (err) {
        // connection failure
        console.log(err);
    }).on('close', function () {
        // underlying connection has closed
//        console.log('...Closing the listing ...');
    }).connect();

//    worker.start([process.env.TUBE_PREFIX + 'job_queue_user+gmail.com']); // Listen on my_tube
};

exports.beanstalk = function (req, res) {
    var client = new fivebeans.client(process.env.BEANSTALK_HOST, process.env.BEANSTALK_PORT);
    client
            .on('connect', function ()
            {
                client.release(22, 0, 1, function (err) {});

            })
            .on('error', function (err)
            {
                // connection failure
            })
            .on('close', function ()
            {
                // underlying connection has closed
            })
            .connect();
};

//exports.beanstack = function (req, res) {
//
//    var Beanworker = require('fivebeans').worker;
//
//// Create a class to handle the work load
//    class IndexHandler {
//        constructor() {
//            this.type = "j_type"; // Specify the type of job for this class to work on
//        }
//        // Define the work to perform and pass back a success
//        work(payload, callback) {
//            console.log(payload);
//            callback('success');
//        }
//    }
//// Instantiate the class
//    var handler = new IndexHandler();
//
//// Set options
//    var options = {
//        id: 'worker_1', // The ID of the worker for debugging and tacking
//        host: '127.0.0.1', // The host to listen on
//        port: 11300, // the port to listen on
//        handlers: {
//            'j_type': handler // setting handlers for types
//        },
//        ignoreDefault: true
//    };
//
//    var worker = new Beanworker(options); // Instantiate a worker
//
//    worker.start([process.env.TUBE_PREFIX + 'shipping_tube']); // Listen on my_tube
////    res.json({"message":"worker started"});
//};