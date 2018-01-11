'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ShippingInfoSchema = new Schema({
    requestId: {
        type: String,
        required: 'Request ID is mandatory'
    },
    orders: {
        type: String,
        required: 'Tracking URL is mandatory'
    },
    dateTime: {
        type: Date,
        required: 'Datetime is mandatory'
    },
    type: {
        type: String,
        required: 'Type is mandatory'
    },
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('ShippingInfo', ShippingInfoSchema);