'use strict'

var express = require('express');
var categoryController = require('../controllers/category.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveCategory',mdAuth.ensureAuthAdmin, categoryController.saveCategory);
api.put('/updateCategory/:id',mdAuth.ensureAuthAdmin, categoryController.updateCategory);
api.get('/listCategories',mdAuth.ensureAuthAdmin, categoryController.listCategories);
api.get('/listCategoriesNames',mdAuth.ensureAuth, categoryController.listCategoriesNames);
api.delete('/removeCategory/:id',mdAuth.ensureAuthAdmin, categoryController.removeCategory);

module.exports = api;