'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    nit:String,
    name:String,
    phone:String,
    email:String,
    username:String,
    password:String,
    role:String,
    cart:[{
        productName:String,
        unitPrice:Number,
        quantity:Number
    }],
    bills:[{type: Schema.Types.ObjectId, ref:'bill'}]
});

module.exports = mongoose.model('user', userSchema);