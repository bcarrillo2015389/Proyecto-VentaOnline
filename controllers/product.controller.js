'use strict'

var Product = require('../models/product.model');
var Category = require('../models/category.model');

function saveProduct(req, res){
    var product = new Product();
    var params = req.body;
    var idCategory = req.params.id;
    
    if(params.productName && params.quantity && params.unitPrice){
        Product.findOne({'productName': params.productName}, (err, productFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(productFind){
                res.send({message:'Nombre de producto ya utilizado.'});
            }else{
                Category.findOne({'_id':idCategory},(err, categoryFind)=>{
                    if(err){
                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                    }else if(categoryFind){

                        if(params.quantity>=0 && params.unitPrice>0){
                            product.productName = params.productName;
                            product.quantity = params.quantity;
                            product.unitPrice = params.unitPrice;
                            product.sales = 0;
            
                            product.save((err, productSaved)=>{
                                if(err){
                                    res.status(500).send({message:'Error general al guardar producto.'});
                                }else if(productSaved){
                                    
                                    Category.findByIdAndUpdate(idCategory,{$push:{products:product._id}},
                                        {new:true},(err, categoryUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general al guardar producto.'});
                                            }else if(categoryUpdated){
                                                res.send({message:'Producto creado.', product: productSaved});
                                            }else{
                                                res.status(404).send({message:'Producto no guardado.'});
                                            }
                                        });
                                }else{
                                    res.status(404).send({message:'Producto no guardado.'});
                                }
                            });
                        }else{
                            res.send({message:'El precio unitario y la cantidad deben ser positivos.'});
                        }
                    }else{
                        res.status(404).send({message:'Categoria no encontrada.'});
                    }
                });
            }
        });
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }

}

function updateProduct(req, res){
    let id = req.params.id;
    var update = req.body;
        Product.findOne({'_id':id}, (err, productFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(productFind){
                    var findName;
    
                    if(!update.productName){
                        findName = '';
                    }else if(update.productName){
                        if(update.productName == productFind.productName){
                            findName = '';
                        }else{
                            findName = update.productName;
                        }
                    }

                    if(update.quantity){
                        if(update.quantity>=0){
                            update.quantity = parseInt(productFind.quantity)+parseInt(update.quantity);
                       }else{
                           return  res.send({message:'El precio unitario y la cantidad deben ser positivos.'});
                       }      
                    }

                    if(update.unitPrice){
                        if(update.unitPrice<=0){
                            return  res.send({message:'El precio unitario y la cantidad deben ser positivos.'});
                        }
                    }
    
                    Product.findOne({$or:[ {'productName':findName}]},(err, productOk)=>{
                    if(err){
                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                    }else if(productOk){
                        res.send({message:'Nombre de producto ya utilizado.'});
                    }else{
                       if(update.sales){
                            res.send({message:'No puede actualizar el campo ventas'});
                       }else{
                            Product.findByIdAndUpdate(id, update, {new:true}, (err, productUpdated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general'});
                                }else if(productUpdated){
                                    res.send({message:'Producto actualizado', product: productUpdated});
                                }else{
                                    res.status(404).send({message: 'No se actualizo.'});
                                }
                            });
                    }
                    }
                });
            }else{
                res.status(404).send({message:'Producto inexistente.'});
            }
        });
}

function getProduct(req, res){
    var id = req.params.id;

    Product.findOne({'_id':id}, (err, productFind)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(productFind){
            res.send({product:productFind});
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
	});
}

function listProducts(req, res){
    Product.find({}, (err, products)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(products){
            if(products.length>0){
                res.send({products:products});
            }else{
                res.send({message:'No se encontraron productos.'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
	});
}

function removeProduct(req, res){
    var id = req.params.id;

    Product.findByIdAndRemove(id, (err, productRemoved)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(productRemoved){
            Category.findOneAndUpdate({'products':id}, {$pull:{products:id}},{new:true},(err, categoryUpdated)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(categoryUpdated){
                    res.send({message:'Producto eliminado.', product:productRemoved});
                }else{
                    res.send({message:'No se elimino el producto.'});
                }
            });
        }else{
            res.status(404).send({message: 'No se elimino de la BD.'});  
        }
    });
}


function soldOutProducts(req,res){

    Product.find({ quantity: 0}, (err,productsFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (productsFind){
            
            if(productsFind.length > 0){
                res.send({message:'productos agotados','products': productsFind});
            } else {
                res.send({message : 'No existen productos agotados.'});
            }
        } else {
            res.status(404).send({message : 'No hay productos que mostrar.'});
        }   
    })
}

function mostSelledProducts(req,res){

    Product.find({sales: {$gt: 0}},(err,products)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (products){
            res.send({message:'productos mas vendidos',
                'products': products});
        } else {
            res.status(404).send({ message : 'No hay productos que mostrar.'});
        }
    }).sort({sales:-1}).limit(10);
}

function searchProduct(req, res){
    var params = req.body;
    
    if(params.search){
        Product.find({productName:{$regex:params.search, $options:'i'}},(err, productFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            }else if(productFind){
                if(productFind.length>0){
                    res.send({products:productFind});
                }else{
                    res.send({message:'No existen coincidencias.'});
                }
            }else{
                res.status(404).send({message:'producto no encontrado.'});
            }
        });
    }else{
        res.send({message:'Ingresa el campo de búsqueda.'});
    }
}

function catalogByCategory(req, res){
    var params = req.body;

    if(params.search){
        Category.findOne({name:{$regex:params.search, $options:'i'}},(err, categoryFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            }else if(categoryFind){
                res.send({message:'catalogo de productos por categoria',
                        products:categoryFind.products});
            }else{
                res.status(404).send({message:'categoria no encontrada.'});
            }
        }).populate('products');
    }else{
        res.send({message:'Ingresa el campo de búsqueda.'});
    }
}


module.exports = {
    saveProduct,
    updateProduct,
    getProduct,
    listProducts,
    removeProduct,
    soldOutProducts,
    mostSelledProducts,
    searchProduct,
    catalogByCategory
}