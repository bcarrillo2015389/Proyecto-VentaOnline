'use strict'

var Bill = require('../models/bill.model');
var Product = require('../models/product.model');
var User = require('../models/user.model');
var moment = require('moment');

function createBill(req, res){
    var idUser = req.params.id;
    var bill = new Bill();

    User.findOne({'_id':idUser}, (err, userFind)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(userFind){
            if(userFind.cart.length>0){
                bill.client = userFind.name;
                bill.nit = userFind.nit;
                var num=0;

                userFind.cart.forEach(product =>{
                    Product.findOne({'_id':product._id},(err, productFind)=>{
                        if(err){
                            return res.status(500).send({message:'Error general'});
                        }else if(productFind){
                            if(productFind.quantity>=product.quantity){
                                var billProduct = {
                                    productName:String,
                                    quantity:Number,
                                    unitPrice:Number,
                                    amount:Number
                                };
                                billProduct._id = productFind._id;
                                billProduct.productName = productFind.productName;
                                billProduct.quantity = product.quantity;
                                billProduct.unitPrice = productFind.unitPrice;
                                billProduct.amount = parseFloat(product.quantity)*parseFloat(productFind.unitPrice);
                                num = num + billProduct.amount;
                                bill.total = num;
                                bill.products.push(billProduct);
                                
                                if(userFind.cart.indexOf(product)==userFind.cart.length-1){
                                    var dateBill = new Date(moment().format('YYYY MM DD'));
                                    bill.date = dateBill;

                                    bill.save((err, billSaved)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general'});
                                        }else if(billSaved){
                                            res.send({message:'bill saved',
                                                    bill:billSaved});
                                                userFind.cart.forEach(product =>{
                                                    Product.findOne({'_id':product._id}, (err, productFind)=>{
                                                        if(err){
                                                            return res.status(500).send({message:'Error general'});
                                                        }else if(productFind){
                                                            var num = productFind.quantity-product.quantity;
                                                            var sale = parseInt(productFind.sales)+parseInt(product.quantity);
                                                            Product.findByIdAndUpdate(product._id,{'quantity':num, 'sales':sale},{new:true},(err, productFind)=>{
                                                                if(err){
                                                                    return res.status(500).send({message:'Error general'});
                                                                }else if(productFind){
                                                                    if(userFind.cart.indexOf(product)==userFind.cart.length-1){
                                                                        var newCart = [];
                                                                            User.findByIdAndUpdate(idUser, {'cart':newCart, $push:{'bills':billSaved._id}},{new:true},(err, userUpdated)=>{
                                                                                if(err){
                                                                                    return res.status(500).send({message:'Error general'});
                                                                                }else if(userUpdated){
                                                                                    console.log('Usuario actualizado.');
                                                                                }
                                                                            });
                                                                    }
                                                                }else{
                                                                    return res.send({message:'Alguno de los productos que desea ha sido eliminados.'});
                                                                }
                                                            });
                                                        }else{
                                                            return res.status(404).send({message:'Producto no encontrado.'});
                                                        }
                                                    });
                                                    
                                                });
                                        }else{
                                            res.send({message:'Error. No se creo la factura.'});
                                        }
                                    });
                                }
                            }else{
                                return res.send({message:'No existe la cantidad que desea en stock.'});
                            }
                        }else{
                            return res.send({message:'Alguno de los productos que desea ha sido eliminados.'});
                        }
                    });
                });
            }else{
                res.send({message:'El carrito de compras del usuario está vacío.'});
            }

        }else{
            res.status(404).send({message:'Usuario no encontrado.'});
        }
    });
}

function listBills(req, res){
    Bill.find({}, (err, bills)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(bills){
            if(bills.length>0){
                res.send({message:'facturas',bills:bills});
            }else{
                res.send({message:'No se encontraron facturas.'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron facturas.'});
        }
	});
}

function searchBillProducts(req,res){
    let idBill = req.params.id;

    Bill.findById(idBill, (err, billFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (billFind){
            res.send({message:'productos de factura','products': billFind.products});
        } else {
            res.status(404).send({ message : 'No se ha encontrado la factura.'});
        }
    })
}



module.exports = {
    createBill,
    listBills,
    searchBillProducts
}