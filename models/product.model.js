'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    productName:String,
    quantity:Number,
    unitPrice:Number,
    sales:Number
});

module.exports = mongoose.model('product', productSchema);