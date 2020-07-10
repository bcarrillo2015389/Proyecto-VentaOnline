'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveProduct/:id',mdAuth.ensureAuthAdmin,productController.saveProduct);
api.put('/updateProduct/:id',mdAuth.ensureAuthAdmin,productController.updateProduct);
api.get('/getProduct/:id',mdAuth.ensureAuthAdmin,productController.getProduct);
api.get('/listProducts',mdAuth.ensureAuthAdmin,productController.listProducts);
api.delete('/removeProduct/:id',mdAuth.ensureAuthAdmin,productController.removeProduct);
api.get('/soldOutProducts',mdAuth.ensureAuthAdmin,productController.soldOutProducts);
api.get('/mostSelledProducts',mdAuth.ensureAuthAdmin,productController.mostSelledProducts);
api.get('/catalogMostSelledProducts',mdAuth.ensureAuth,productController.mostSelledProducts);
api.get('/searchProduct',mdAuth.ensureAuth,productController.searchProduct);
api.get('/catalogByCategory',mdAuth.ensureAuth,productController.catalogByCategory);

module.exports = api;