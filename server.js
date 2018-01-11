require('dotenv').config();
var express = require('express'),
        app = express(),
        port = process.env.PORT || 8081,
        mongoose = require('mongoose'),
        ShippingInfo = require('./models/shippingInfo'), //created model loading here
        bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/parserdb');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


var routes = require('./routes/api'); //importing route
routes(app); //register the route

app.listen(port);

console.log('server started on: ' + port);