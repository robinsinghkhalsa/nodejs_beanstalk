'use strict';
module.exports = function (app) {
    var shippingInfo = require('../controllers/shippingController');
    app.route('/shipping')
            .post(shippingInfo.add_shipping_info);
    app.route('/beanworker')
            .post(shippingInfo.beanworker);
    app.route('/beanstalk')
            .post(shippingInfo.beanstalk);
    
    app.route('/listTubes')
            .get(shippingInfo.listTubes);
};