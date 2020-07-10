'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', userController.login);
api.post('/saveUser',mdAuth.ensureAuthAdmin ,userController.saveUser);
api.put('/updateUser/:id',mdAuth.ensureAuthAdmin ,userController.updateUser);
api.delete('/removeUser/:id',mdAuth.ensureAuthAdmin ,userController.removeUser);
api.put('/setOnCart/:idUser/:idProduct',mdAuth.ensureAuth ,userController.setOnCart);
api.get('/listUsers',mdAuth.ensureAuthAdmin ,userController.listUsers);
api.get('/listUserBills/:id',mdAuth.ensureAuthAdmin ,userController.listUserBills);
api.get('/getDetailedBill/:idU/:id',mdAuth.ensureAuth ,userController.getDetailedBill);
api.post('/saveUserClient', userController.saveUserClient);
api.put('/updateUserClient/:id',mdAuth.ensureAuth ,userController.updateUserClient);
api.delete('/removeUserClient/:id',mdAuth.ensureAuth ,userController.removeUserClient);
api.get('/getUserCart/:id',mdAuth.ensureAuth ,userController.getUserCart);
api.put('/updateProductCart/:id/:idP',mdAuth.ensureAuth ,userController.updateProductCart);
api.put('/removeProductCart/:id/:idP',mdAuth.ensureAuth ,userController.removeProductCart);


module.exports = api;