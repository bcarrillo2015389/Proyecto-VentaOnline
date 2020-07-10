'use strict'

var express = require('express');
var billController = require('../controllers/bill.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/createBill/:id', mdAuth.ensureAuthAdmin, billController.createBill);
api.get('/listBills', mdAuth.ensureAuthAdmin, billController.listBills);
api.get('/searchBillProducts/:id', mdAuth.ensureAuthAdmin, billController.searchBillProducts);

module.exports = api;