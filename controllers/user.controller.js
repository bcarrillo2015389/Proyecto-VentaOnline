'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var jwt = require('../services/jwt');
var Product = require('../models/product.model');
var Bill = require('../models/bill.model');

function login(req, res){
    var params = req.body;

    if(params.username || params.email){
        if(params.password){
            User.findOne({$or:[
                {username:params.username},
                {email:params.email}
            ]},(err, userFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(userFind){
                    bcrypt.compare(params.password, userFind.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                                if(userFind.role == 'CLIENT'){
                                    if(params.gettoken){
                                        res.send({message:'Bienvenido', user:userFind.name, bills:userFind.bills,
                                            token:jwt.createToken(userFind)});
                                    }else{
                                        res.send({message:'Bienvenido', user:userFind.name, bills:userFind.bills});
                                    }
                                }else{
                                    if(params.gettoken){
                                        res.send({message:'Bienvenido',user:userFind.name,token:jwt.createToken(userFind)});
                                    }else{
                                        res.send({message:'Bienvenido', user:userFind.name});
                                    }
                                }
                        }else{
                            res.send({message:'Datos de usuario incorrectos.'});
                        }
                    });
                }else{
                    res.send({message:'Datos de usuario incorrectos.'});
                }
            }).populate('bills');
        }else{
            res.send({message:'Ingresa tu contraseña.'});
        }
    }else{
        res.send({message:'Ingresa tu correo o tu username.'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.nit && params.name && params.username && params.password && params.email && params.role){
        User.findOne({$or:[
            {username:params.username},
            {email:params.email},
            {'nit':params.nit},
            {'phone':params.phone}]}, (err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(userFind){
                res.send({message:'Algunos de los datos unicos ya han sido utilizados.'});
            }else{
                if(params.role != 'CLIENT' && params.role != 'ADMIN'){
                    res.send({message:'Debe de ingresar una opcion de role valida.'});
                }else{
                    user.nit = params.nit;
                    user.name = params.name;
                    user.username = params.username;
                    user.email = params.email;
                    user.role = params.role;
                    user.phone = params.phone
                    
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message:'Error al encriptar contraseña.'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                        }else{
                            res.status(418).send({message:'Error inesperado.'});
                        }
                    });

                    user.save((err, userSaved)=>{
                        if(err){
                            res.status(500).send({message:'Error general al guardar usuario.'});
                        }else if(userSaved){
                            res.send({message:'Usuario creado.', user: userSaved});
                        }else{
                            res.status(404).send({message:'Usuario no guardado.'});
                        }
                    });
                }
            }
        });
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }
}


function updateUser(req, res){
    let id = req.params.id;
    var update = req.body;

    if(update.cart || update.bills || update.role){
        res.send({message:'Algunos campos del usuario no es posible modificarlos.'});
    }else{
        User.findOne({'_id':id}, (err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(userFind){
                    if(userFind.role != 'CLIENT'){
                        res.status(401).send({message:'No puede actualizar usuarios que no sean clientes.'});
                    }else{
                            var findUsername;
                            var findEmail;
                            var findNit;
                            var findPhone;
            
                            if(!update.username){
                                findUsername = '';
                            }else if(update.username){
                                if(update.username == userFind.username){
                                    findUsername = '';
                                }else{
                                    findUsername = update.username;
                                }
                            }

                            if(!update.email){
                                findEmail = '';
                            }else if(update.email){
                                if(update.email == userFind.email){
                                    findEmail = '';
                                }else{
                                    findEmail = update.email;
                                }
                            }

                            if(!update.nit){
                                findNit = '';
                            }else if(update.nit){
                                if(update.nit == userFind.nit){
                                    findNit = '';
                                }else{
                                    findNit = update.nit;
                                }
                            }

                            if(!update.phone){
                                findPhone = '';
                            }else if(update.phone){
                                if(update.phone == userFind.phone){
                                    findPhone = '';
                                }else{
                                    findPhone = update.phone;
                                }
                            }
            
                            User.findOne({$or:[{'username':findUsername},
                            {'email':findEmail}, {'nit':findNit}, {'phone':findPhone}]},(err, userOk)=>{
                                if(err){
                                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                }else if(userOk){
                                    res.send({message:'Algunos de los datos unicos ya han sido utilizados.'});
                                }else{  
                                    if(req.body.password){
                                        bcrypt.hash(req.body.password, null, null, (err, passwordHash)=>{
                                            if(err){
                                                res.status(500).send({message:'Error al encriptar contraseña.'});
                                            }else if(passwordHash){
                                                update.password = passwordHash;
                                                User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                                    if(err){
                                                        res.status(500).send({message:'Error general'});
                                                    }else if(userUpdated){
                                                        res.send({message:'Usuario actualizado', user: userUpdated});
                                                    }else{
                                                        res.status(404).send({message: 'No se actualizo.'});
                                                    }
                                                });
                                            }else{
                                                res.status(418).send({message:'Error inesperado.'});
                                            }
                                        });
                                     }else{
                                        User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general'});
                                            }else if(userUpdated){
                                                res.send({message:'Usuario actualizado', user: userUpdated});
                                            }else{
                                                res.status(404).send({message: 'No se actualizo.'});
                                            }
                                        });
                                     }
                                }
                            });
                    }
            }else{
                res.status(404).send({message:'Usuario inexistente.'});
            }
        });
    }
}

function removeUser(req, res){
    var id = req.params.id;

    User.findOne({'_id':id},(err, userFind)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(userFind){
            if(userFind.role != 'CLIENT'){
                res.status(401).send({message:'No puede eliminar usuarios que no sean clientes.'});
            }else{
                User.findByIdAndRemove(id, (err, userRemoved)=>{
                    if(err){
                        res.status(500).send({message: 'Error general'});
                    }else if(userRemoved){
                        res.send({message:'Usuario eliminado.', user:userRemoved});
                    }else{
                        res.status(404).send({message: 'No se elimino de la BD.'});  
                    }
                });
            }
        }else{
            res.status(404).send({message:'Usuario inexistente.'});
        }
    });
}

function listUsers(req, res){
    User.find({}, (err, users)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(users){
            if(users.length>0){
                res.send({users:users});
            }else{
                res.send({message:'No se encontraron usuarios.'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
	});
}

function setOnCart(req, res){
    var idUser = req.params.idUser;
    var idProduct = req.params.idProduct;
    var params = req.body;

    if(idUser != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
   }else{
    if(params.quantity){
        User.findOne({'_id': idUser, 'cart._id':idProduct}, (err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(userFind){
                res.send({message:'Producto ya añadido.'});
            }else{
                Product.findOne({'_id':idProduct},(err, productFind)=>{
                    if(err){
                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                    }else if(productFind){
                        if(productFind.quantity>=params.quantity){
                            productFind.quantity = params.quantity;
            
                            User.findOneAndUpdate({'_id':idUser},
                            {$push:{cart:productFind}},{new:true},(err, userUpdated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general'});
                                }else if(userUpdated){
                                    res.send({message:'Producto agregado a su carrito.', cart:userUpdated.cart});
                                }else{
                                    res.status(418).send({message:'Producto no agregado.'});
                                }
                            });
                            }else{
                                res.send({message:'Error. Cantidad mayor al stock existente.'});
                            }
                    }else{
                        res.status(404).send({message:'producto inexistente.'});
                    }
                });
    
               
            }
        });
       }else{
        res.send({message:'Ingresa la cantidad del producto que desea.'});
       }
   }
}

function listUserBills(req, res){
    let idUser = req.params.id;
    
    User.findById({_id:idUser,role:'CLIENT'}, (err,userFind)=>{
        if(err){
            res.status(500).send({message : 'Error general en el servidor'});
        } else if (userFind){
            if(userFind.bills.length > 0){
                res.send({message:'facturas de usuario','bills': userFind.bills});
            } else {
                res.send({ message : 'El usuario no posee facturas.'});
            }
        } else {
            res.status(404).send({ message : 'No se han encontrado registros que mostrar'});
        }
    }).populate('bills');
}


function getDetailedBill(req, res){
    var idBill = req.params.id;
    var idUser = req.params.idU;

    if(idUser != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findOne({'_id':idUser, 'bills':idBill}, (err, userFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            }else if(userFind){
                Bill.findOne({'_id':idBill}, (err, billFind) =>{
                    if(err){

                    }else if(billFind){
                        res.send({message:'factura',
                                'bill': billFind});
                    }else{
                        res.send({message:'Factura no encontrada.'});
                    }
                });
            }else{
                res.status(404).send({message:'La factura deseado no se ha encontrado dentro de sus facturas.'});
            }
        });
    }
}

function saveUserClient(req, res){
    var user = new User();
    var params = req.body;

    if(params.nit && params.name && params.username && params.password && params.email){
        User.findOne({$or:[
            {username:params.username},
            {email:params.email},
            {'nit':params.nit},
            {'phone':params.phone}]}, (err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(userFind){
                res.send({message:'Algunos de los datos unicos ya han sido utilizados.'});
            }else{
                    user.nit = params.nit;
                    user.name = params.name;
                    user.username = params.username;
                    user.email = params.email;
                    user.role = 'CLIENT';
                    user.phone = params.phone
                    
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message:'Error al encriptar contraseña.'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                        }else{
                            res.status(418).send({message:'Error inesperado.'});
                        }
                    });

                    user.save((err, userSaved)=>{
                        if(err){
                            res.status(500).send({message:'Error general al guardar usuario.'});
                        }else if(userSaved){
                            res.send({message:'Usuario creado.', user: userSaved});
                        }else{
                            res.status(404).send({message:'Usuario no guardado.'});
                        }
                    });
            }
        });
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }
}

function updateUserClient(req, res){
    let id = req.params.id;
    var update = req.body;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(update.cart || update.bills || update.role){
            res.send({message:'Algunos campos del usuario no es posible modificarlos.'});
        }else{
            User.findOne({'_id':id}, (err, userFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(userFind){
                        if(userFind.role != 'CLIENT'){
                            res.status(401).send({message:'No puede actualizar usuarios que no sean clientes.'});
                        }else{
                                var findUsername;
                                var findEmail;
                                var findNit;
                                var findPhone;
                
                                if(!update.username){
                                    findUsername = '';
                                }else if(update.username){
                                    if(update.username == userFind.username){
                                        findUsername = '';
                                    }else{
                                        findUsername = update.username;
                                    }
                                }
    
                                if(!update.email){
                                    findEmail = '';
                                }else if(update.email){
                                    if(update.email == userFind.email){
                                        findEmail = '';
                                    }else{
                                        findEmail = update.email;
                                    }
                                }
    
                                if(!update.nit){
                                    findNit = '';
                                }else if(update.nit){
                                    if(update.nit == userFind.nit){
                                        findNit = '';
                                    }else{
                                        findNit = update.nit;
                                    }
                                }
    
                                if(!update.phone){
                                    findPhone = '';
                                }else if(update.phone){
                                    if(update.phone == userFind.phone){
                                        findPhone = '';
                                    }else{
                                        findPhone = update.phone;
                                    }
                                }
                
                                User.findOne({$or:[{'username':findUsername},
                                {'email':findEmail}, {'nit':findNit}, {'phone':findPhone}]},(err, userOk)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                    }else if(userOk){
                                        res.send({message:'Algunos de los datos unicos ya han sido utilizados.'});
                                    }else{  
                                        if(req.body.password){
                                            bcrypt.hash(req.body.password, null, null, (err, passwordHash)=>{
                                                if(err){
                                                    res.status(500).send({message:'Error al encriptar contraseña.'});
                                                }else if(passwordHash){
                                                    update.password = passwordHash;
                                                    User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                                        if(err){
                                                            res.status(500).send({message:'Error general'});
                                                        }else if(userUpdated){
                                                            res.send({message:'Usuario actualizado', user: userUpdated});
                                                        }else{
                                                            res.status(404).send({message: 'No se actualizo.'});
                                                        }
                                                    });
                                                }else{
                                                    res.status(418).send({message:'Error inesperado.'});
                                                }
                                            });
                                         }else{
                                            User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                                if(err){
                                                    res.status(500).send({message:'Error general'});
                                                }else if(userUpdated){
                                                    res.send({message:'Usuario actualizado', user: userUpdated});
                                                }else{
                                                    res.status(404).send({message: 'No se actualizo.'});
                                                }
                                            });
                                         }
                                    }
                                });
                        }
                }else{
                    res.status(404).send({message:'Usuario inexistente.'});
                }
            });
        }
    }
}

function removeUserClient(req, res){
    var id = req.params.id;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findOne({'_id':id},(err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(userFind){
                if(userFind.role != 'CLIENT'){
                    res.status(401).send({message:'No puede eliminar usuarios que no sean clientes.'});
                }else{
                    User.findByIdAndRemove(id, (err, userRemoved)=>{
                        if(err){
                            res.status(500).send({message: 'Error general'});
                        }else if(userRemoved){
                            res.send({message:'Usuario eliminado.', user:userRemoved});
                        }else{
                            res.status(404).send({message: 'No se elimino de la BD.'});  
                        }
                    });
                }
            }else{
                res.status(404).send({message:'Usuario inexistente.'});
            }
        });
    }
}

function updateProductCart(req, res){
    var idUser=req.params.id;
    var idProduct=req.params.idP;
    var params = req.body;

    if(idUser != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(params.quantity){
            Product.findOne({'_id':idProduct},(err, productFind)=>{
                if(err){

                }else if(productFind){
                    if(productFind.quantity>=params.quantity){
                        User.findOneAndUpdate({'_id':idUser,'cart._id':idProduct},{'cart.$.quantity':params.quantity},{new:true},(err, userFind)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(userFind){
                                res.send({message:'Carrito actualizado.',
                                        cart:userFind.cart});
                            }else{
                                res.status(404).send({message: 'Usuario inexistente.'});  
                            }
                        }); 
                    }else{
                        res.send({message:'Error. Cantidad mayor al stock existente.'});
                    }
                }else{
                    res.send({message:'producto inexistente.'});
                }
            });
           
        }else{
            res.send({message:'Debe ingresar el campo de cantidad que desea actualizar.'});
        }
    }
}

function removeProductCart(req, res){
    var idUser=req.params.id;
    var idProduct=req.params.idP;

    if(idUser != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findOneAndUpdate({'_id':idUser, 'cart._id':idProduct}, {$pull:{cart:{_id:idProduct}}}, {new:true},(err, userUpdated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(userUpdated){
                res.send({message:'Carrito actualizado.',
                                        cart:userUpdated.cart});
            }else{
                res.status(404).send({message:'No se encontraron coincidencias.'});
            }
        });
    }
}

function getUserCart(req, res){
    var idUser=req.params.id;

    if(idUser != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findOne({'_id':idUser},(err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(userFind){
                if(userFind.cart.length>0){
                    res.send({message:'Carrito de compras.',
                        cart:userFind.cart});
                }else{
                    res.send({message:'Carrito de compras vacio.'});
                }
            }else{
                res.status(404).send({message:'Usuario no encontrado.'});
            }
        });
    }
}



module.exports = {
    login,
    saveUser,
    updateUser,
    removeUser,
    setOnCart,
    listUsers,
    listUserBills,
    getDetailedBill,
    saveUserClient,
    updateUserClient,
    removeUserClient,
    getUserCart,
    updateProductCart,
    removeProductCart
}