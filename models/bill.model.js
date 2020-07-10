'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var billSchema = Schema({
    date:Date,
    client:String,
    nit:String,
    products:[{
        productName:String,
        quantity:Number,
        unitPrice:Number,
        amount:Number
    }],
    total:Number
});

module.exports = mongoose.model('bill', billSchema);